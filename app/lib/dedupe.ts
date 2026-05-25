import { db } from "@/db/index";
import { checkoutEvents } from "@/db/schema";
import { eq, and, desc, gte, or } from "drizzle-orm";

export async function shouldSendEmail(params: {
  phone: string;
  sessionId: string;
  cartHash: string;
  eventType: "CHECKOUT_STARTED" | "PAYMENT_INTENT" | "PAYMENT_SUBMITTED";
}): Promise<{ shouldSend: boolean; reason: string }> {
  const { phone, sessionId, cartHash, eventType } = params;

  if (!phone || phone.trim().length < 10) {
    return { shouldSend: false, reason: "Invalid or empty phone number" };
  }

  // Rule 3: If Payment Submitted email was already sent, do NOT send any more emails.
  const priorPaymentSent = await db.query.checkoutEvents.findFirst({
    where: and(
      or(eq(checkoutEvents.phone, phone), eq(checkoutEvents.sessionId, sessionId)),
      eq(checkoutEvents.eventType, "PAYMENT_SUBMITTED"),
      eq(checkoutEvents.emailSent, true)
    ),
  });

  if (priorPaymentSent) {
    return { shouldSend: false, reason: "Payment Submitted email already sent for this customer" };
  }

  // Rule 2: If Hot Lead already sent, do NOT send Warm Lead later.
  if (eventType === "CHECKOUT_STARTED") {
    const priorHotLeadSent = await db.query.checkoutEvents.findFirst({
      where: and(
        or(eq(checkoutEvents.phone, phone), eq(checkoutEvents.sessionId, sessionId)),
        eq(checkoutEvents.eventType, "PAYMENT_INTENT"),
        eq(checkoutEvents.emailSent, true)
      ),
    });

    if (priorHotLeadSent) {
      return { shouldSend: false, reason: "Hot Lead already sent; skipping Warm Lead" };
    }

    // Rule 1: Only send ONE Warm Lead per phone number every 30 mins.
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentWarmLead = await db.query.checkoutEvents.findFirst({
      where: and(
        eq(checkoutEvents.phone, phone),
        eq(checkoutEvents.eventType, "CHECKOUT_STARTED"),
        eq(checkoutEvents.emailSent, true),
        gte(checkoutEvents.createdAt, thirtyMinsAgo)
      ),
    });

    if (recentWarmLead) {
      return { shouldSend: false, reason: "Warm Lead email sent in the last 30 minutes for this phone number" };
    }
  }

  // Verify if exact same event was already sent for this session (prevents double submits/refreshes)
  const exactDuplicate = await db.query.checkoutEvents.findFirst({
    where: and(
      eq(checkoutEvents.sessionId, sessionId),
      eq(checkoutEvents.eventType, eventType),
      eq(checkoutEvents.emailSent, true)
    ),
  });

  if (exactDuplicate) {
    return { shouldSend: false, reason: "This event email was already successfully sent in this session" };
  }

  return { shouldSend: true, reason: "Allowed" };
}

export function generateCartHash(items: { variety: string; weightKg: number; quantity: number }[]): string {
  if (!items || items.length === 0) return "empty";
  // Sort items to ensure consistent hashes
  const sorted = [...items].sort((a, b) => a.variety.localeCompare(b.variety));
  const hashString = sorted
    .map((item) => `${item.variety}:${item.weightKg}:${item.quantity}`)
    .join("|");
  
  // Simple fast string hashing (djb2) to generate a hex code
  let hash = 5381;
  for (let i = 0; i < hashString.length; i++) {
    hash = (hash * 33) ^ hashString.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}
