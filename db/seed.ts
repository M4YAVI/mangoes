import { db } from './index';
import { orders, orderItems } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database with premium sample orders...');

  try {
    // Clean up existing seed data to ensure idempotency
    const orderNumbers = ['PM-26137-8821', 'PM-26137-4329', 'PM-26136-1192'];
    for (const num of orderNumbers) {
      await db.delete(orders).where(eq(orders.orderNumber, num));
    }

    const sampleOrders = [
      {
        orderNumber: 'PM-26137-8821',
        customerName: 'Srinivas Rao',
        phoneNumber: '9848022338',
        state: 'Andhra Pradesh',
        city: 'Vijayawada',
        pincode: '520001',
        rtcLandmark: 'Vijayawada Central RTC Cargo Counter, Beside Platform 1',
        customerNotes: 'Please pack in sturdy export cartons. Gift for my family.',
        totalAmount: '1200.00',
        status: 'PENDING_VERIFICATION' as const,
        paymentMethod: 'UPI' as const,
        utr: '439201928472',
        utrSubmittedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
        adminNotes: 'Awaiting deposit match in bank account.',
      },
      {
        orderNumber: 'PM-26137-4329',
        customerName: 'Aditi Sharma',
        phoneNumber: '9123456789',
        state: 'Telangana',
        city: 'Hyderabad',
        pincode: '500008',
        rtcLandmark: 'MGBS RTC Cargo Counter, Hyderabad',
        customerNotes: 'Need them fresh for the Ugadi festival!',
        totalAmount: '2250.00',
        status: 'PAID' as const,
        paymentMethod: 'UPI' as const,
        utr: '410293847562',
        utrSubmittedAt: new Date(Date.now() - 3 * 3600 * 1000), // 3 hours ago
        paidAt: new Date(Date.now() - 2.5 * 3600 * 1000), // 2.5 hours ago
        adminNotes: 'Payment matched successfully. Prepare for packaging.',
      },
      {
        orderNumber: 'PM-26136-1192',
        customerName: 'Karthik Raja',
        phoneNumber: '8098765432',
        state: 'Karnataka',
        city: 'Bengaluru',
        pincode: '560001',
        rtcLandmark: 'Majestic Bus Stand Cargo Office, Bengaluru',
        customerNotes: null,
        totalAmount: '800.00',
        status: 'DELIVERED' as const,
        paymentMethod: 'UPI' as const,
        utr: '400293849182',
        utrSubmittedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), // 2 days ago
        paidAt: new Date(Date.now() - 1.9 * 24 * 3600 * 1000),
        dispatchedAt: new Date(Date.now() - 1.5 * 24 * 3600 * 1000),
        deliveredAt: new Date(Date.now() - 5 * 3600 * 1000), // 5 hours ago
        adminNotes: 'Delivered in excellent condition.',
      }
    ];

    for (const data of sampleOrders) {
      console.log(`Inserting order ${data.orderNumber} for ${data.customerName}...`);
      const [order] = await db.insert(orders).values(data).returning();

      // Insert matching items
      if (data.orderNumber === 'PM-26137-8821') {
        await db.insert(orderItems).values([
          {
            orderId: order.id,
            variety: 'Banganapalle' as const,
            quantityKg: 10,
            priceAtPurchase: '120.00'
          }
        ]);
      } else if (data.orderNumber === 'PM-26137-4329') {
        await db.insert(orderItems).values([
          {
            orderId: order.id,
            variety: 'Imam Pasand' as const,
            quantityKg: 5,
            priceAtPurchase: '250.00'
          },
          {
            orderId: order.id,
            variety: 'Sindhura' as const,
            quantityKg: 5,
            priceAtPurchase: '140.00'
          }
        ]);
      } else if (data.orderNumber === 'PM-26136-1192') {
        await db.insert(orderItems).values([
          {
            orderId: order.id,
            variety: 'Totapuri' as const,
            quantityKg: 10,
            priceAtPurchase: '80.00'
          }
        ]);
      }
    }

    console.log('🎉 Database successfully seeded with sample orders!');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
}

seed();
