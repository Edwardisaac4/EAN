interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockoutUntil?: number;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

// Shared memory store across serverless invocations and module reloads
declare global {
  var __rateLimitStore: Map<string, AttemptRecord> | undefined;
}

const store: Map<string, AttemptRecord> =
  globalThis.__rateLimitStore ?? new Map<string, AttemptRecord>();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__rateLimitStore = store;
}

export function checkRateLimit(ip: string, email: string): { isAllowed: boolean; retryAfterSeconds?: number } {
  try {
    const key = `${ip.trim()}:${email.trim().toLowerCase()}`;
    const record = store.get(key);

    if (!record) {
      return { isAllowed: true };
    }

    const now = Date.now();

    if (record.lockoutUntil && record.lockoutUntil > now) {
      const retryAfterSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
      return { isAllowed: false, retryAfterSeconds };
    }

    if (now - record.firstAttemptAt > WINDOW_MS) {
      store.delete(key);
      return { isAllowed: true };
    }

    return { isAllowed: true };
  } catch (err) {
    console.error('Rate limiter check error:', err);
    throw new Error('Rate limiter state evaluation failed');
  }
}

export function recordFailedAttempt(ip: string, email: string): void {
  try {
    const key = `${ip.trim()}:${email.trim().toLowerCase()}`;
    const now = Date.now();
    const existing = store.get(key);

    let record: AttemptRecord;

    if (!existing || now - existing.firstAttemptAt > WINDOW_MS) {
      record = {
        count: 1,
        firstAttemptAt: now,
      };
    } else {
      const newCount = existing.count + 1;
      record = {
        count: newCount,
        firstAttemptAt: existing.firstAttemptAt,
        lockoutUntil: newCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : existing.lockoutUntil,
      };
    }

    store.set(key, record);
  } catch (err) {
    console.error('Rate limiter record failed attempt error:', err);
    throw new Error('Failed to record rate limit attempt');
  }
}

export function clearRateLimit(ip: string, email: string): void {
  try {
    const key = `${ip.trim()}:${email.trim().toLowerCase()}`;
    if (store.has(key)) {
      store.delete(key);
    }
  } catch (err) {
    console.error('Rate limiter clear error:', err);
    throw new Error('Failed to clear rate limit state');
  }
}
