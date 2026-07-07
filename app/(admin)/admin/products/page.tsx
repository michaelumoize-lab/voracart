// app/(admin)/admin/products/page.tsx
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      store: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      images: {
        take: 1,
        select: { url: true },
      },
    },
  });

  // Custom serialization (handles all fields we need for admin)
  const serializedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
    stock: product.stock,
    category: product.category,
    rating: Number(product.rating),
    reviewCount: product.reviewCount,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    image: product.images[0]?.url || "/placeholder-product.png",
    store: {
      id: product.store.id,
      name: product.store.name,
      slug: product.store.slug,
      seller: {
        name: product.store.user?.name || "Unknown",
        email: product.store.user?.email || "",
      },
    },
  }));

  return <AdminProductsClient products={serializedProducts} />;
}
