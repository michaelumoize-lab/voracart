// app/api/shipping-addresses/[id]/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, validateBody } from "@/lib/api-helper";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateAddressSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { id } = await params;

  const validation = await validateBody(req, updateAddressSchema);
  if (validation.error) return validation.error;

  const { fullName, phone, address, city, state, pincode, isDefault } =
    validation.data;

  // Check if address exists and belongs to user
  const existing = await prisma.shippingAddress.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) return apiError("Address not found", 404);

  // If setting as default, unset all other addresses
  if (isDefault === true) {
    await prisma.shippingAddress.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  // Prepare update data (only include provided fields)
  const updateData: Record<string, unknown> = {};
  if (fullName !== undefined) updateData.fullName = fullName;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (city !== undefined) updateData.city = city;
  if (state !== undefined) updateData.state = state;
  if (pincode !== undefined) updateData.pincode = pincode;
  if (isDefault !== undefined) updateData.isDefault = isDefault;

  const updated = await prisma.shippingAddress.update({
    where: { id },
    data: updateData,
  });

  return apiSuccess({ address: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { id } = await params;

  const existing = await prisma.shippingAddress.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) return apiError("Address not found", 404);

  await prisma.shippingAddress.delete({ where: { id } });

  // If deleted address was default, promote the most recent remaining address
  if (existing.isDefault) {
    const next = await prisma.shippingAddress.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (next) {
      await prisma.shippingAddress.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  return apiSuccess({ success: true });
}
