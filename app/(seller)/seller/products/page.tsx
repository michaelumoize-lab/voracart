"use client";
import React, { useEffect, useState } from "react";
import { Product } from "@/types";
import Image from "next/image";
import toast from "react-hot-toast";
import EmptyState, { ProductsEmptyIcon } from "@/components/Products/EmptyState";
import { SellerProductSkeleton } from "@/components/Products/ProductsSkeletons";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye } from "lucide-react";

const ProductList = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const currency = "₦";

  // ✅ Fixed fetchProducts with proper HTTP status handling
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/seller/products");
      
      // ✅ Check HTTP status before parsing JSON
      if (!res.ok) {
        let errorMessage = "Failed to load products";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        toast.error(errorMessage);
        setProducts([]);
        return;
      }

      const data = await res.json();
      
      // ✅ Check success flag in response
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message || "Failed to load products");
        setProducts([]);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      
      // ✅ Check HTTP status
      if (!res.ok) {
        let errorMessage = "Failed to delete product";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        toast.error(errorMessage);
        return;
      }

      const data = await res.json();
      
      if (data.success) {
        toast.success("Product deleted");
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        toast.error(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong");
    } finally {
      setDeleteConfirm(null);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-10">
        <SellerProductSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-10 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product List</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your products, edit prices, and update inventory
          </p>
        </div>
        {products.length > 0 && (
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<ProductsEmptyIcon />}
          title="No products yet"
          subtitle="You haven't added any products. Start by adding your first product."
          actionLabel="Add Product"
          actionPath="/seller/add-product"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="pb-3 pr-4">Image</th>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Price</th>
                <th className="pb-3 pr-4">Offer Price</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition">
                  <td className="py-3 pr-4">
                    <Image 
                      src={
                        typeof product.image === 'string' 
                          ? product.image 
                          : (product.image?.[0] || '/placeholder-product.png')
                      } 
                      alt={product.name} 
                      width={50} 
                      height={50} 
                      className="rounded object-cover w-12 h-12" 
                    />
                  </td>
                  <td className="py-3 pr-4 font-medium text-foreground">{product.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{product.category}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{currency}{Number(product.price).toLocaleString()}</td>
                  <td className="py-3 pr-4 text-primary font-medium">
                    {product.offerPrice ? `${currency}${Number(product.offerPrice).toLocaleString()}` : "-"}
                  </td>
                  <td className="py-3">
                    {deleteConfirm === product.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 text-xs border border-border rounded hover:bg-muted transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/seller/products/${product.id}/edit`)}
                          className="p-1.5 text-muted-foreground hover:text-primary transition"
                          aria-label="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/product/${product.id}`)}
                          className="p-1.5 text-muted-foreground hover:text-primary transition"
                          aria-label="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;