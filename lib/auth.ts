// Authentication helper for generating and verifying signed session tokens
export const SESSION_COOKIE_NAME = "admin_session";

function getSecretKey(): string {
  const key = process.env.ADMIN_SESSION_SECRET;
  if (!key) {
    throw new Error("ADMIN_SESSION_SECRET environment variable must be set");
  }
  return key;
}

export interface SessionPayload {
  email: string;
  role: string;
  iat: number;
  exp?: number;
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

export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  const dataStr = JSON.stringify(payload);
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

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
