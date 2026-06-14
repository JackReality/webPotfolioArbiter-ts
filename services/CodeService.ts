import { AppError } from "@/lib/AppError";

interface CodeEntry {
  code: string;
  expiry: number;
  attempts: number;
}

const g = globalThis as unknown as { _codeStore?: Map<string, CodeEntry> };
const store = g._codeStore ?? new Map<string, CodeEntry>();
if (process.env.NODE_ENV !== "production") g._codeStore = store;

export function generateCode(email: string): string {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set(email, {
    code,
    expiry: Date.now() + 20 * 60 * 1000,
    attempts: 0,
  });
  return code;
}

export function checkCode(email: string, input: string): void {
  const entry = store.get(email);
  if (!entry) throw new AppError("ERR_CODE_NOT_FOUND", 2020);

  if (Date.now() > entry.expiry) {
    store.delete(email);
    throw new AppError("ERR_CODE_EXPIRED", 2021);
  }

  if (entry.code !== input.trim()) {
    const attempts = entry.attempts + 1;
    if (attempts >= 5) {
      store.delete(email);
      throw new AppError("ERR_CODE_MAX_ATTEMPTS", 2022);
    }
    store.set(email, { ...entry, attempts });
    throw new AppError("ERR_CODE_INVALID", 2023);
  }

  store.delete(email);
}
