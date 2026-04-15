// app/product/[id]/page.tsx (Server Component)
import { prisma } from "@/lib/prisma";
import ProductClient from "./ProductClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch single product
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          whatsappNumber: true,
        },
      },
    },
  });
  
  // Fetch related products (same category)
  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: id },
      category: product?.category,
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  
  if (!product) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }
  
  // ✅ Convert null to undefined and Decimal to number
  const serializedProduct = {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image: product.image,
    description: product.description ?? undefined, // null -> undefined
    userId: product.userId,
    category: product.category,
    offerPrice: product.offerPrice ? Number(product.offerPrice) : undefined,
    stock: product.stock,
    rating: product.rating ?? undefined,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    seller: product.seller ? {
  id: product.seller.id,
  name: product.seller.name ?? undefined,
  whatsappNumber: product.seller.whatsappNumber ?? undefined,  
} : undefined,
  };
  
  const serializedRelatedProducts = relatedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    image: p.image,
    description: p.description ?? undefined,
    userId: p.userId,
    category: p.category,
    offerPrice: p.offerPrice ? Number(p.offerPrice) : undefined,
    stock: p.stock,
    rating: p.rating ?? undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    seller: p.seller ? {
  id: p.seller.id,
  name: p.seller.name ?? undefined,
} : undefined,
  }));
  
  return (
    <ProductClient 
      product={serializedProduct}
      relatedProducts={serializedRelatedProducts}
    />
  );
}