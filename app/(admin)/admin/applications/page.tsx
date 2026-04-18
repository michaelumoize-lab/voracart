//app/(admin)/admin/applications/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Eye, Clock, Loader2 } from "lucide-react";

interface Application {
  id: string;
  userId: string;
  storeName: string;
  description: string;
  phone: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

const SellerApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null); // ✅ Added processing state
  const [processingAction, setProcessingAction] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");

  const fetchApplications = async (): Promise<void> => {
    try {
      const res = await fetch("/api/seller-application/admin/list");
      if (!res.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      } else {
        toast.error(data.message || "Failed to load applications");
      }
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed handleReview with duplicate click prevention and proper error handling
  const handleReview = async (
    applicationId: string,
    status: "APPROVED" | "REJECTED",
  ): Promise<void> => {
    // Prevent duplicate submissions
    if (processingId === applicationId) return;

    setProcessingId(applicationId);
    setProcessingAction(status);

    try {
      const res = await fetch("/api/seller-application/admin/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });

      if (!res.ok) {
        let errorMessage = `Failed to ${status.toLowerCase()} application`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response isn't JSON, use status text
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();

      if (data.success) {
        toast.success(
          status === "APPROVED"
            ? "Application approved! User is now a seller."
            : "Application rejected.",
        );
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? { ...a, status } : a)),
        );
      } else {
        toast.error(
          data.message || `Failed to ${status.toLowerCase()} application`,
        );
      }
    } catch (error) {
      console.error("Review error:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const filtered =
    filter === "ALL"
      ? applications
      : applications.filter((a) => a.status === filter);

  useEffect(() => {
    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] flex-1">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-primary border-muted" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "REJECTED":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
    }
  };

  return (
    <div className="flex-1 p-4 md:p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Seller Applications
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve seller applications
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-accent hover:text-foreground"
            }`}
          >
            {f}
            {f === "PENDING" && (
              <span className="ml-1.5">
                ({applications.filter((a) => a.status === "PENDING").length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Applications */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No {filter.toLowerCase()} applications
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((application) => (
            <div
              key={application.id}
              className="border border-border rounded-lg p-5 space-y-3 bg-card hover:shadow-md transition"
            >
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">
                      {application.storeName}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(application.status)}`}
                    >
                      {application.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied{" "}
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Phone: {application.phone}
                  </p>
                  {application.user && (
                    <p className="text-xs text-muted-foreground">
                      User: {application.user.email}
                    </p>
                  )}
                </div>

                {/* Action buttons — only for pending */}
                {application.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReview(application.id, "APPROVED")}
                      disabled={
                        processingId === application.id &&
                        processingAction === "APPROVED"
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === application.id &&
                      processingAction === "APPROVED" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(application.id, "REJECTED")}
                      disabled={
                        processingId === application.id &&
                        processingAction === "REJECTED"
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === application.id &&
                      processingAction === "REJECTED" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      Reject
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground border-t border-border pt-3 mt-1">
                {application.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerApplications;
