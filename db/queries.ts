import { db } from './index';
import { orders } from './schema';
import { eq } from 'drizzle-orm';

export async function getOrderWithItems(orderId: string) {
  return await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true },
  });
}

export async function getOrdersByStatus(status: typeof orders.$inferSelect.status) {
  return await db.query.orders.findMany({
    where: eq(orders.status, status),
    with: { items: true },
    orderBy: (o, { desc }) => [desc(o.createdAt)],
  });
}
