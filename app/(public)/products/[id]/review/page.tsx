// app/(public)/products/[id]/review/page.tsx
import { getServerSession } from "@/lib/get-session";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewForm from "./ReviewForm";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id: productId } = await params;
  const session = await getServerSession();

  if (!session?.user?.id) {
    redirect(`/auth/sign-in?redirect=/products/${productId}/review`);
  }

  const userId = session.user.id;

  // Check if product exists and is active
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Check if user already reviewed
  const existingReview = await prisma.review.findUnique({
    where: {
      productId_userId: {
        productId,
        userId,
      },
    },
  });

  if (existingReview) {
    redirect(`/products/${productId}`);
  }

  // Check if user has a DELIVERED order containing this product
  const deliveredOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: "DELIVERED",
      items: {
        some: {
          productId,
        },
      },
    },
    select: { id: true },
  });

  if (!deliveredOrder) {
    redirect(`/products/${productId}`);
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="bg-card border border-border rounded-lg p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Write a Review
        </h1>
        <p className="text-muted-foreground mb-6">
          Share your experience with{" "}
          <span className="font-medium">{product.name}</span>
        </p>

        <ReviewForm productId={productId} productName={product.name} />
      </div>
    </div>
  );
}
