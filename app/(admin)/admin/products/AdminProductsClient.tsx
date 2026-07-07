// app/(admin)/admin/products/AdminProductsClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  Store,
  User,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  offerPrice: number | null;
  stock: number;
  category: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  image: string;
  store: {
    id: string;
    name: string;
    slug: string;
    seller: {
      name: string;
      email: string;
    };
  };
}

interface AdminProductsClientProps {
  products: Product[];
}

export default function AdminProductsClient({
  products: initialProducts,
}: AdminProductsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);

  const filteredProducts = initialProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.store.seller.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Products</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, stores, sellers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Created</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative w-9 h-9 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal break-words max-w-[200px]">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-normal break-words max-w-[150px]">
                      <div className="flex items-center gap-1.5">
                        <Store className="h-3 w-3 text-muted-foreground shrink-0" />
                        <Link
                          href={`/store/${product.store.slug}`}
                          target="_blank"
                          className="text-sm hover:underline"
                        >
                          {product.store.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal break-words max-w-[150px]">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-sm">
                          {product.store.seller.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {product.offerPrice ? (
                        <div>
                          <span className="line-through text-muted-foreground text-xs mr-1">
                            ₦{product.price.toLocaleString()}
                          </span>
                          <span className="text-green-600">
                            ₦{product.offerPrice.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        `₦${product.price.toLocaleString()}`
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <span
                        className={
                          product.stock === 0
                            ? "text-destructive"
                            : product.stock < 10
                              ? "text-yellow-600"
                              : "text-green-600"
                        }
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize whitespace-nowrap"
                      >
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.isActive ? (
                        <Badge
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="whitespace-nowrap"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm whitespace-nowrap">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/admin/products/${product.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
          <span>
            Showing {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, filteredProducts.length)} of{" "}
            {filteredProducts.length} products
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
