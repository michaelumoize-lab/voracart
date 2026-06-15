// app/api/shipping-addresses/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, validateBody } from "@/lib/api-helper";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  const validation = await validateBody(req, createAddressSchema);
  if (validation.error) return validation.error;

  const { fullName, phone, address, city, state, pincode, isDefault } =
    validation.data;

  if (isDefault) {
    await prisma.shippingAddress.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  // If this is the first address, make it default automatically
  const count = await prisma.shippingAddress.count({
    where: { userId: session.user.id },
  });
  const shouldBeDefault = isDefault || count === 0;

  const newAddress = await prisma.shippingAddress.create({
    data: {
      userId: session.user.id,
      fullName,
      phone,
      address,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      isDefault: shouldBeDefault,
    },
  });

  return apiSuccess({ address: newAddress }, 201);
}
