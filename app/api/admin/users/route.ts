// app/api/admin/users/route.ts
import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-helper";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/get-session";
import { Prisma } from "@prisma/client";

// GET - Fetch all users (admin only)
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Admin access required", 403);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20") || 20));
  const role = searchParams.get("role");
  const search = searchParams.get("search");
  const skip = (page - 1) * limit;

  try {
    // Build where clause with proper typing
    const where: Prisma.UserWhereInput = {};

    if (role && role !== "all") {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          whatsappNumber: true,
          createdAt: true,
          updatedAt: true,
          banned: true,
          banReason: true,
          banExpires: true,
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      whatsappNumber: user.whatsappNumber,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      stats: {
        totalProducts: user._count.products,
        totalOrders: user._count.orders,
      },
    }));

    return apiSuccess({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return apiError("Failed to fetch users", 500);
  }
}

// PUT - Update user role or ban status (admin only)
export async function PUT(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Admin access required", 403);

  try {
    const body = await request.json();
    const { userId, role, banned, banReason, banExpires } = body;

    if (!userId) {
      return apiError("User ID is required", 400);
    }

    // Prevent admin from changing their own role
    if (userId === session.user.id && role && role !== "admin") {
      return apiError("You cannot change your own admin role", 400);
    }

    // Prevent admin from banning themselves
    if (userId === session.user.id && banned === true) {
      return apiError("You cannot ban your own account", 400);
    }

    const ALLOWED_ROLES = ["admin", "seller", "buyer"] as const;
    const updateData: Prisma.UserUpdateInput = {};

    if (role) {
      if (!ALLOWED_ROLES.includes(role as any)) {
        return apiError("Invalid role value", 400);
      }
      updateData.role = role;
    }

    if (banned !== undefined) {
      if (typeof banned !== "boolean") {
        return apiError("Invalid banned value", 400);
      }
      updateData.banned = banned;
    }
    if (banReason !== undefined) updateData.banReason = banReason;
    if (banExpires !== undefined) updateData.banExpires = banExpires ? new Date(banExpires) : null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
      },
    });

    return apiSuccess({
      user: updatedUser,
      message: role ? `User role updated to ${role}` : "User updated successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return apiError("User not found", 404);
    }
    console.error("Error updating user:", error);
    return apiError("Failed to update user", 500);
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (session.user.role !== "admin") return apiError("Admin access required", 403);

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return apiError("User ID is required", 400);
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return apiError("You cannot delete your own account", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return apiSuccess({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return apiError("Failed to delete user", 500);
  }
}