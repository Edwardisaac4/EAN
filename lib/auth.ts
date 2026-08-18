// Authentication helper for generating and verifying signed session tokens
export const SESSION_COOKIE_NAME = "admin_session";

function getSecretKey(): string {
  const key = process.env.ADMIN_SESSION_SECRET;
  if (!key) {
    throw new Error("ADMIN_SESSION_SECRET environment variable must be set");
  }
  return key;
}

/**
 * The admin password is one half of the session-version digest, so a runtime
 * that cannot read it derives a *different* version than the one that minted
 * the token.
 *
 * Defaulting to "" hid that: every session version silently collapsed to the
 * digest of `secret + ":"`, which both mints and verifies consistently, so
 * rotating the password would no longer have retired anything. Failing loudly
 * is the only behaviour that keeps the revocation guarantee honest.
 */
function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD environment variable must be set");
  }
  return password;
}

export interface SessionPayload {
  email: string;
  role: string;
  iat: number;
  /**
   * Required. An earlier revision treated this as optional, which meant a token
   * minted without it was accepted forever.
   */
  exp: number;
  /**
   * Session version — a truncated digest of the signing secret plus the current
   * admin password. Because it is embedded at mint time and re-derived on every
   * verify, rotating either credential invalidates every outstanding session.
   *
   * This is what makes a stolen cookie revocable. Without it the only way to
   * retire a leaked token was to wait out its `exp`.
   */
  sv?: string;
}

function base64UrlEncode(str: string): string {
  const base64 =
    typeof btoa === "function"
      ? btoa(str)
      : Buffer.from(str, "binary").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return typeof atob === "function"
    ? atob(base64)
    : Buffer.from(base64, "base64").toString("binary");
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const binary = base64UrlDecode(base64url);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Compares two secrets without leaking their relationship through timing.
 *
 * A plain `!==` on the password returns after the first differing byte, so
 * response latency correlates with how many leading characters an attacker
 * guessed correctly. Hashing both sides first makes the comparison operate on
 * fixed-length digests, so it always costs the same.
 *
 * Uses Web Crypto rather than node:crypto's timingSafeEqual because this module
 * is imported by middleware.ts, which runs on the edge runtime.
 */
export async function constantTimeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [digestA, digestB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);

  const bytesA = new Uint8Array(digestA);
  const bytesB = new Uint8Array(digestB);

  let diff = bytesA.length ^ bytesB.length;
  for (let i = 0; i < bytesA.length; i++) {
    diff |= bytesA[i] ^ bytesB[i];
  }
  return diff === 0;
}

/**
 * Derives the current session version. Any change to the signing secret or the
 * admin password produces a different value, which retires every token minted
 * under the old one.
 *
 * Throws when either credential is missing. In verifySessionToken that surfaces
 * as a caught rejection and the session is refused, which is the correct
 * fail-closed outcome — but it does mean ADMIN_PASSWORD must be present in
 * every runtime that runs proxy.ts, not just the one that serves the login
 * route, or admins are logged out on each request.
 */
async function currentSessionVersion(): Promise<string> {
  const material = `${getSecretKey()}:${getAdminPassword()}`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(material),
  );
  return arrayBufferToBase64Url(digest).slice(0, 16);
}

export async function createSessionToken(
  payload: Omit<SessionPayload, "sv">,
): Promise<string> {
  const stamped: SessionPayload = {
    ...payload,
    sv: await currentSessionVersion(),
  };
  const dataStr = JSON.stringify(stamped);
  const dataBase64 = base64UrlEncode(dataStr);

  const encoder = new TextEncoder();
  const keyData = encoder.encode(getSecretKey());
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(dataBase64),
  );

  const sigBase64 = arrayBufferToBase64Url(signature);
  return `${dataBase64}.${sigBase64}`;
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [dataBase64, sigBase64] = parts;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(getSecretKey());
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const sigBuffer = base64UrlToArrayBuffer(sigBase64);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      sigBuffer,
      encoder.encode(dataBase64),
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(dataBase64);
    const payload = JSON.parse(payloadJson) as SessionPayload;

    // A token with no expiry is rejected outright rather than treated as
    // non-expiring, so a malformed or legacy cookie cannot outlive its window.
    if (typeof payload.exp !== "number" || Date.now() / 1000 > payload.exp) {
      return null;
    }

    // Retires sessions whose signing secret or admin password has since changed.
    // Legacy tokens predating `sv` are rejected, forcing one re-login.
    if (payload.sv !== (await currentSessionVersion())) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
