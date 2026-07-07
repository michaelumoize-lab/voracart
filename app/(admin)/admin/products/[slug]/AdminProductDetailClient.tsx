// app/(admin)/admin/products/[slug]/AdminProductDetailClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  Eye,
  EyeOff,
  Trash2,
  Store as StoreIcon,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  offerPrice: number | null;
  stock: number;
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: {
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }[];
  store: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    phone: string | null;
    rating: number;
    totalSales: number;
    seller: {
      name: string;
      email: string;
    };
  };
}

interface AdminProductDetailClientProps {
  product: Product;
}

export default function AdminProductDetailClient({
  product,
}: AdminProductDetailClientProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const displayPrice = product.offerPrice ?? product.price;
  const mainImage =
    product.images.length > 0
      ? product.images[0].url
      : "/placeholder-product.png";

  const toggleActive = async () => {
    setIsToggling(true);
    try {
      const res = await fetch(
        `/api/admin/products/${product.id}/toggle-active`,
        {
          method: "PATCH",
        },
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(
        `Product ${product.isActive ? "deactivated" : "activated"}`,
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("Product deleted");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatPrice = (value: number) => `₦${value.toLocaleString()}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant={product.isActive ? "outline" : "default"}
            size="sm"
            className="gap-1"
            onClick={toggleActive}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : product.isActive ? (
              <>
                <EyeOff className="h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted shadow-sm">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {!product.isActive && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-6 py-2">
                  Inactive
                </Badge>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {product.images.slice(1).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || product.name}
                    fill
                    sizes="20vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-primary capitalize">
              {product.category}
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>ID: {product.id}</span>
              <span>•</span>
              <span>
                Created: {new Date(product.createdAt).toLocaleDateString()}
              </span>
              {product.updatedAt && (
                <>
                  <span>•</span>
                  <span>
                    Updated: {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatPrice(displayPrice)}
            </span>
            {product.offerPrice && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={product.stock > 0 ? "default" : "destructive"}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </Badge>
            <Badge variant="outline">
              Rating: {product.rating.toFixed(1)} ({product.reviewCount}{" "}
              reviews)
            </Badge>
            {product.tags.length > 0 && (
              <Badge variant="secondary">
                {product.tags.slice(0, 3).join(", ")}
                {product.tags.length > 3 && "…"}
              </Badge>
            )}
          </div>

          {product.description && (
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium mb-1">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* Store Info */}
          <Separator />
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
              {product.store.logo ? (
                <Image
                  src={product.store.logo}
                  alt={product.store.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <StoreIcon className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">
                {product.store.name}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span>Seller: {product.store.seller.name}</span>
                <span>•</span>
                <span>Sales: {product.store.totalSales}</span>
                <span>•</span>
                <span>Rating: {product.store.rating.toFixed(1)}</span>
              </div>
              <Link
                href={`/store/${product.store.slug}`}
                target="_blank"
                className="text-xs text-primary hover:underline"
              >
                Visit store →
              </Link>
            </div>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/products/${product.slug}`, "_blank")}
            >
              View public page
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/orders?product=${product.id}`)}
            >
              View orders
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{product.name}&quot; and all
              its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
