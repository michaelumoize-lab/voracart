// lib/inngest/functions/orderFunctions.ts
import { inngest } from "../client";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend"; // or your email provider

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Send order confirmation email
export const sendOrderConfirmation = inngest.createFunction(
  { id: "send-order-confirmation", name: "Send Order Confirmation" },
  { event: "order/placed" },
  async ({ event, step }) => {
    const { orderId, userId } = event.data;

    const order = await step.run("fetch-order", async () => {
      return await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: true } },
          user: true,
          shippingAddress: true,
        },
      });
    });

    if (!order) throw new Error("Order not found");

    await step.run("send-email", async () => {
      return await resend.emails.send({
        from: "VoraCart <orders@voracart.com>",
        to: order.user.email,
        subject: `Order Confirmation #${order.id.slice(0, 8)}`,
        html: `
          <h1>Thank you for your order!</h1>
          <p>Order ID: ${order.id}</p>
          <p>Total: ₦${Number(order.totalAmount).toLocaleString()}</p>
          <!-- Full email template -->
        `,
      });
    });

    return { success: true, orderId };
  }
);

// 2. Create notifications for user and sellers
export const createOrderNotifications = inngest.createFunction(
  { id: "create-order-notifications", name: "Create Order Notifications" },
  { event: "order/placed" },
  async ({ event, step }) => {
    const { orderId, userId } = event.data;

    // Get order with items and their stores
    const order = await step.run("fetch-order-with-stores", async () => {
      return await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: { include: { store: true } },
            },
          },
        },
      });
    });

    if (!order) throw new Error("Order not found");

    // Notification for customer
    await step.run("notify-customer", async () => {
      return await prisma.notification.create({
        data: {
          userId: userId,
          type: "NEW_ORDER",
          message: `Your order #${orderId.slice(0, 8)} has been placed successfully.`,
          link: `/my-orders/${orderId}`,
        },
      });
    });

    // Notifications for each seller (store)
    const uniqueStoreIds = new Set(order.items.map((item) => item.product.storeId));
    
    await step.run("notify-sellers", async () => {
      for (const storeId of uniqueStoreIds) {
        const store = await prisma.store.findUnique({
          where: { id: storeId },
          include: { user: true },
        });
        
        if (store?.userId) {
          await prisma.notification.create({
            data: {
              userId: store.userId,
              type: "NEW_ORDER",
              message: `New order received for your store: ${store.name}`,
              link: `/seller/orders/${orderId}`,
            },
          });
        }
      }
    });

    return { success: true };
  }
);

// 3. Update store sales metrics
export const updateStoreMetrics = inngest.createFunction(
  { id: "update-store-metrics", name: "Update Store Metrics" },
  { event: "order/placed" },
  async ({ event, step }) => {
    const { orderId } = event.data;

    const order = await step.run("fetch-order-items", async () => {
      return await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: { product: { include: { store: true } } },
          },
        },
      });
    });

    if (!order) throw new Error("Order not found");

    // Group by store and update sales
    const storeSales = new Map<string, { items: number; total: number }>();
    
    for (const item of order.items) {
      const storeId = item.product.store.id;
      const existing = storeSales.get(storeId) || { items: 0, total: 0 };
      storeSales.set(storeId, {
        items: existing.items + item.quantity,
        total: existing.total + Number(item.total),
      });
    }

    await step.run("update-stores", async () => {
      for (const [storeId, data] of storeSales) {
        await prisma.store.update({
          where: { id: storeId },
          data: {
            totalSales: { increment: data.items },
            rating: undefined, // Keep existing rating
          },
        });
      }
    });

    return { success: true };
  }
);

// 4. Check low stock and alert sellers
export const checkLowStock = inngest.createFunction(
  { id: "check-low-stock", name: "Check Low Stock" },
  { event: "order/placed" },
  async ({ event, step }) => {
    const { orderId } = event.data;

    const order = await step.run("fetch-order-products", async () => {
      return await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });
    });

    if (!order) throw new Error("Order not found");

    const lowStockItems = order.items.filter(
      (item) => item.product.stock <= 5 && item.product.stock > 0
    );

    if (lowStockItems.length > 0) {
      await step.run("send-low-stock-alerts", async () => {
        for (const item of lowStockItems) {
          // Notify seller about low stock
          const product = item.product;
          await prisma.notification.create({
            data: {
              userId: product.userId,
              type: "LOW_STOCK",
              message: `⚠️ Low stock alert: ${product.name} has only ${product.stock} left.`,
              link: `/seller/products/${product.id}`,
            },
          });
        }
      });
    }

    return { success: true };
  }
);

// 5. Generate invoice (optional)
export const generateInvoice = inngest.createFunction(
  { id: "generate-invoice", name: "Generate Invoice PDF" },
  { event: "order/placed" },
  async ({ event, step }) => {
    const { orderId } = event.data;

    const order = await step.run("fetch-order-full", async () => {
      return await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: true } },
          user: true,
          shippingAddress: true,
        },
      });
    });

    if (!order) throw new Error("Order not found");

    // Generate PDF (using a library like @react-pdf/renderer)
    // Store PDF URL or attach to order record
    // For now, just mark that invoice was generated
    await step.run("mark-invoice-generated", async () => {
      // Optionally update order with invoice URL
      // await prisma.order.update({
      //   where: { id: orderId },
      //   data: { invoiceUrl: `https://...` },
      // });
    });

    return { success: true };
  }
);