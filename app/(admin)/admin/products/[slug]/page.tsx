// app/(admin)/admin/products/[slug]/page.tsx
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdminProductDetailClient from "./AdminProductDetailClient";

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { position: "asc" },
      },
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
    },
  });

  if (!product) {
    notFound();
  }

  // Serialize (unchanged)
  const serialized = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    offerPrice: product.offerPrice ? Number(product.offerPrice) : null,
    stock: product.stock,
    category: product.category,
    tags: product.tags,
    rating: Number(product.rating),
    reviewCount: product.reviewCount,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      position: img.position,
    })),
    store: {
      id: product.store.id,
      name: product.store.name,
      slug: product.store.slug,
      description: product.store.description,
      logo: product.store.logo,
      phone: product.store.phone,
      rating: Number(product.store.rating),
      totalSales: product.store.totalSales,
      seller: {
        name: product.store.user?.name || "Unknown",
        email: product.store.user?.email || "",
      },
    },
  };

  return <AdminProductDetailClient product={serialized} />;
}
