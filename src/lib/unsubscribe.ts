import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "./seo";

const SECRET = process.env.CRON_SECRET || process.env.UNSUBSCRIBE_SECRET || "dev-secret";

export function generateUnsubscribeToken(email: string): string {
  return createHmac("sha256", SECRET)
    .update(`waitlist:${email.toLowerCase()}`)
    .digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = generateUnsubscribeToken(email);
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function getUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email);
  return `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}
