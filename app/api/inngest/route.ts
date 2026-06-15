// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  sendOrderConfirmation,
  createOrderNotifications,
  updateStoreMetrics,
  checkLowStock,
  generateInvoice,
} from "@/lib/inngest/functions/orderFunctions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendOrderConfirmation,
    createOrderNotifications,
    updateStoreMetrics,
    checkLowStock,
    generateInvoice,
  ],
});