import { relations } from 'drizzle-orm';
import { orders, orderItems, varieties } from './schema';

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const varietiesRelations = relations(varieties, () => ({}));
