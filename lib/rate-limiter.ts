import fs from 'fs';
import path from 'path';

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockoutUntil?: number;
}

interface RateLimitStore {
  [key: string]: AttemptRecord;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

const STORE_PATH = path.join(process.cwd(), '.next', 'rate-limit-store.json');

function loadStore(): RateLimitStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    // Fail gracefully
  }
  return {};
}

function saveStore(store: RateLimitStore): void {
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    // Fail gracefully
  }
}

export function checkRateLimit(ip: string, email: string): { isAllowed: boolean; retryAfterSeconds?: number } {
  const store = loadStore();
  const key = `${ip.trim()}:${email.trim().toLowerCase()}`;
  const record = store[key];

  if (!record) {
    return { isAllowed: true };
  }

  const now = Date.now();

  if (record.lockoutUntil && record.lockoutUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return { isAllowed: false, retryAfterSeconds };
  }

  if (now - record.firstAttemptAt > WINDOW_MS) {
    delete store[key];
    saveStore(store);
    return { isAllowed: true };
  }

  return { isAllowed: true };
}

export function recordFailedAttempt(ip: string, email: string): void {
  const store = loadStore();
  const key = `${ip.trim()}:${email.trim().toLowerCase()}`;
  const now = Date.now();
  const record = store[key] || { count: 0, firstAttemptAt: now };

  if (now - record.firstAttemptAt > WINDOW_MS) {
    record.count = 1;
    record.firstAttemptAt = now;
    delete record.lockoutUntil;
  } else {
    record.count += 1;
  }

  if (record.count >= MAX_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_MS;
  }

  store[key] = record;
  saveStore(store);
}

export function clearRateLimit(ip: string, email: string): void {
  const store = loadStore();
  const key = `${ip.trim()}:${email.trim().toLowerCase()}`;
  if (store[key]) {
    delete store[key];
    saveStore(store);
  }
}
