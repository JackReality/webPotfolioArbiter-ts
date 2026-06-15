import { AppError } from "@/lib/AppError";

let lastSend = 0;
const COOLDOWN_MS = 5000;

export function check(): void {
  if (Date.now() - lastSend < COOLDOWN_MS) {
    throw new AppError("ERR_CONTACT_TOO_FAST");
  }
}

export function record(): void {
  lastSend = Date.now();
}
