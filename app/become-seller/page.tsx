// app/become-seller/page.tsx
"use client";
import React, { useEffect, useState, FormEvent } from "react";
import Navbar from "@/components/Landing/Navbar/Navbar";
import Footer from "@/components/Landing/Footer";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useRole } from "@/lib/auth/helpers";
import toast from "react-hot-toast";
import { Store, Phone, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | null;

const BecomeSeller = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { isSeller } = useRole();

  const [storeName, setStoreName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatus>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  // Redirect if already a seller
  useEffect(() => {
    if (isSeller) {
      router.push("/seller");
      return;
    }
  }, [isSeller, router]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/seller/application/status");
        const data = await res.json();
        if (data.success && data.application) {
          setApplicationStatus(data.application.status);
        }
      } catch {
        console.error("Failed to check application status");
      } finally {
        setCheckingStatus(false);
      }
    };

    if (session?.user) checkStatus();
    else setCheckingStatus(false);
  }, [session]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!session?.user) {
      router.push("/auth/sign-in");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, description, phone }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to submit application");
        return;
      }

      toast.success("Application submitted successfully!");
      setApplicationStatus("PENDING");
      
      // Reset form
      setStoreName("");
      setDescription("");
      setPhone("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-primary border-muted" />
        </div>
        <Footer />
      </>
    );
  }

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
    <>
      <Navbar />
      <div className="min-h-screen px-6 md:px-16 lg:px-32 py-14">
        <div className="max-w-xl mx-auto">
          {/* Heading */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground">
              Become a <span className="text-primary">Seller</span>
            </h1>
            <div className="w-20 h-0.5 bg-primary mt-2" />
            <p className="text-muted-foreground text-sm mt-4">
              Fill out the form below to apply for a seller account. We&apos;ll
              review your application and get back to you shortly.
            </p>
          </div>

          {/* Status Display */}
          {applicationStatus && (
            <div className={`${getStatusStyles()} border rounded-lg p-6 mb-8 space-y-3`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center">
                  {getStatusIcon()}
                </div>
                <div>
                  <h2 className={`text-lg font-semibold ${getStatusTextStyles()}`}>
                    {applicationStatus === "PENDING" && "Application Under Review"}
                    {applicationStatus === "APPROVED" && "Application Approved!"}
                    {applicationStatus === "REJECTED" && "Application Not Approved"}
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

          {/* Form — show if no application, rejected, or not approved */}
          {(applicationStatus === null || applicationStatus === "REJECTED") && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Store className="w-4 h-4 text-muted-foreground" />
                  Store Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Michael's Tech Store"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Store Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your store, what you sell, and why you want to become a seller..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g., +1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Customers will contact you on this number for orders
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium mt-4"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BecomeSeller;