// app/become-seller/BecomeSellerClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Store,
  Phone,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
} from "lucide-react";

// Enhanced Zod schema with better validation
const applicationSchema = z.object({
  storeName: z
    .string()
    .min(1, "Store name is required")
    .max(50, "Store name must be under 50 characters"),
  description: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(500, "Description cannot exceed 500 characters"),
  phone: z
    .string()
    .min(5, "Phone number is required")
    .regex(
      /^[\+\d\s\-\(\)]{5,}$/,
      "Please enter a valid phone number (e.g., +1 234 567 8900)",
    ),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;
type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | null;

interface BecomeSellerClientProps {
  initialApplication: {
    status: ApplicationStatus;
    storeName: string | null;
    description: string | null;
    phone: string | null;
  } | null;
  userName?: string | null;
}

export default function BecomeSellerClient({
  initialApplication,
  userName,
}: BecomeSellerClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>(
    initialApplication?.status ?? null,
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      storeName: initialApplication?.storeName ?? "",
      description: initialApplication?.description ?? "",
      phone: initialApplication?.phone ?? "",
    },
  });

  const descriptionValue = watch("description", "");

  useEffect(() => {
    if (applicationStatus === "APPROVED") {
      router.push("/seller");
    }
  }, [applicationStatus, router]);

  const onSubmit = async (data: ApplicationFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/seller-application/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to submit application");
      }

      toast.success("Application submitted successfully!");
      setApplicationStatus("PENDING");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    switch (applicationStatus) {
      case "PENDING":
        return <Clock className="w-7 h-7 text-yellow-600" />;
      case "APPROVED":
        return <CheckCircle className="w-7 h-7 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-7 h-7 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusStyles = () => {
    switch (applicationStatus) {
      case "PENDING":
        return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800";
      case "APPROVED":
        return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";
      case "REJECTED":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
      default:
        return "";
    }
  };

  const getStatusTextStyles = () => {
    switch (applicationStatus) {
      case "PENDING":
        return "text-yellow-700 dark:text-yellow-400";
      case "APPROVED":
        return "text-green-700 dark:text-green-400";
      case "REJECTED":
        return "text-red-700 dark:text-red-400";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen px-6 md:px-16 lg:px-32 py-14">
      <div className="max-w-xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">
            Become a <span className="text-primary">Seller</span>
          </h1>
          <div className="w-20 h-0.5 bg-primary mt-2" />
          <p className="text-muted-foreground text-sm mt-4">
            Fill out the form below to apply for a seller account. We’ll review
            your application and get back to you shortly.
          </p>
        </div>

        {/* Status banner */}
        {applicationStatus && (
          <div
            className={`${getStatusStyles()} border rounded-lg p-6 mb-8 space-y-3`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center">
                {getStatusIcon()}
              </div>
              <div>
                <h2
                  className={`text-lg font-semibold ${getStatusTextStyles()}`}
                >
                  {applicationStatus === "PENDING" &&
                    "Application Under Review"}
                  {applicationStatus === "APPROVED" && "Application Approved!"}
                  {applicationStatus === "REJECTED" &&
                    "Application Not Approved"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {applicationStatus === "PENDING" &&
                    "Your seller application has been submitted and is currently being reviewed. We'll notify you once a decision has been made."}
                  {applicationStatus === "APPROVED" &&
                    "Congratulations! Your seller application has been approved. You can now start selling on VoraCart."}
                  {applicationStatus === "REJECTED" &&
                    "Unfortunately your application was not approved at this time. You may reapply with updated information below."}
                </p>
              </div>
            </div>
            {applicationStatus === "APPROVED" && (
              <button
                onClick={() => router.push("/seller")}
                className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
              >
                Go to Seller Dashboard
              </button>
            )}
          </div>
        )}

        {/* Form */}
        {(applicationStatus === null || applicationStatus === "REJECTED") && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Store Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="storeName"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-muted-foreground" />
                Store Name
              </label>
              <input
                id="storeName"
                type="text"
                placeholder={
                  userName
                    ? `${userName}'s Store`
                    : "e.g., Michael's Tech Store"
                }
                {...register("storeName")}
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              {errors.storeName && (
                <p className="text-sm text-destructive">
                  {errors.storeName.message}
                </p>
              )}
            </div>

            {/* Description with character counter */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Store Description
                </span>
                <span className="text-xs text-muted-foreground">
                  {descriptionValue.length}/500
                </span>
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Tell us about your store, what you sell, and why you want to become a seller..."
                {...register("description")}
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-muted-foreground" />
                WhatsApp Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                {...register("phone")}
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                We&apos;ll use this number for order-related communication with
                customers.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium mt-4"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
