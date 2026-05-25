"use server";

import { db } from "@/db/index";
import { orders, type OrderStatus } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifyAuth } from "./auth";

const ALLOWED_STATUSES: OrderStatus[] = [
  "PENDING",
  "PENDING_VERIFICATION",
  "PAID",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
];

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  const session = await verifyAuth(token);
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Helper to dispatch automated notifications when order status changes.
 * Under dummy/testing conditions, this writes detailed outbox traces to server logs.
 * When going live, you can replace this with Resend (Email) or Twilio / Fast2SMS (SMS) API calls.
 */
async function sendOrderStatusNotification(order: any, status: OrderStatus) {
  console.log(`[NOTIFICATION OUTBOX] Status of Order ${order.orderNumber} changed to: ${status}`);
  console.log(`[CUSTOMER TARGET] Name: ${order.customerName}, Phone: ${order.customerPhone}, Email: ${order.customerEmail}`);
  
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://pallemamidi.vercel.app"}/track?phone=${encodeURIComponent(order.customerPhone)}`;
  
  let messageText = "";
  switch (status) {
    case "PENDING":
      messageText = `Hi ${order.customerName}, your order ${order.orderNumber} at Palle Mamidi has been placed successfully! Please submit your UPI transaction reference to start verification: ${orderUrl}`;
      break;
    case "PENDING_VERIFICATION":
      messageText = `Hi ${order.customerName}, we received your transaction ref (UTR) for ${order.orderNumber}. Our team is verifying the payment and will confirm shortly!`;
      break;
    case "PAID":
      messageText = `Thank you ${order.customerName}! Payment for your order ${order.orderNumber} is verified. Your box of premium naturally ripened mangoes is secured.`;
      break;
    case "DISPATCHED":
      messageText = `Great news ${order.customerName}! Your order ${order.orderNumber} has been dispatched via RTC Cargo. Follow your tracking details at: ${orderUrl}`;
      break;
    case "DELIVERED":
      messageText = `Hi ${order.customerName}, your mangoes for order ${order.orderNumber} have been delivered! We hope you love the taste of Palle Mamidi. Let us know your feedback!`;
      break;
    case "CANCELLED":
      messageText = `Hi ${order.customerName}, your order ${order.orderNumber} has been cancelled. If this is a mistake, contact us immediately.`;
      break;
    default:
      return;
  }
  
  console.log(`[NOTIFICATION MSG BODY] ${messageText}`);
  
  // ==========================================
  // LIVE INTEGRATION BLUEPRINT (E.g. Fast2SMS / Twilio)
  // ==========================================
  /*
  const API_KEY = process.env.SMS_API_KEY;
  if (API_KEY && order.customerPhone) {
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          route: "q",
          message: messageText,
          language: "english",
          numbers: order.customerPhone
        })
      });
      const data = await response.json();
      console.log("[Fast2SMS Response]", data);
    } catch (e) {
      console.error("SMS dispatch failed", e);
    }
  }
  */
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  await requireAdmin();

  if (!ALLOWED_STATUSES.includes(newStatus)) {
    return { success: false, error: "Invalid status." };
  }
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
    return { success: false, error: "Invalid order id." };
  }

  const now = new Date();
  const patch: Partial<typeof orders.$inferInsert> = {
    status: newStatus,
    updatedAt: now,
  };
  if (newStatus === "PAID") patch.paidAt = now;
  if (newStatus === "DISPATCHED") patch.dispatchedAt = now;
  if (newStatus === "DELIVERED") patch.deliveredAt = now;
  if (newStatus === "CANCELLED") patch.cancelledAt = now;

  try {
    await db.update(orders).set(patch).where(eq(orders.id, orderId));

    // Fetch the updated order details asynchronously to trigger the notification
    const updatedOrders = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    const order = updatedOrders[0];
    if (order) {
      sendOrderStatusNotification(order, newStatus).catch((err) => {
        console.error("Failed to send order status notification:", err);
      });
    }

    revalidatePath("/admin");
    revalidatePath("/track");
    return { success: true };
  } catch (error) {
    console.error("updateOrderStatus failed:", error);
    return { success: false, error: "Database update failed." };
  }
}

export async function setAdminNotes(orderId: string, notes: string) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
    return { success: false, error: "Invalid order id." };
  }
  await db.update(orders)
    .set({ adminNotes: notes.slice(0, 1000), updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  revalidatePath("/admin");
  return { success: true };
}
