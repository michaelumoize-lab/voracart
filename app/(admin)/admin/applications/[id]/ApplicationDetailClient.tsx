"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  X,
  User,
  Mail,
  Calendar,
  Store,
  Phone,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Application {
  id: string;
  storeName: string;
  description: string | null;
  phone: string;
  status: string;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    joinedAt: string;
  };
}

export default function ApplicationDetailClient({
  application,
}: {
  application: Application;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState(application.adminNotes || "");

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/seller-applications/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          adminNotes,
          action,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(
        `Application ${action === "approve" ? "approved" : "rejected"} successfully`,
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    } finally {
      setIsLoading(false);
      setShowDialog(false);
    }
  };

  const openDialog = (actionType: "approve" | "reject") => {
    setAction(actionType);
    setShowDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
    };
    return variants[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = () => {
    switch (application.status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "APPROVED":
        return <Check className="h-4 w-4" />;
      case "REJECTED":
        return <X className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const isPending = application.status === "PENDING";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/admin/applications"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to applications
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {application.storeName}
                  </CardTitle>
                  <CardDescription>
                    Application #{application.id.slice(-8).toUpperCase()}
                  </CardDescription>
                </div>
                <Badge
                  className={`${getStatusBadge(application.status)} flex items-center gap-1`}
                >
                  {getStatusIcon()}
                  {application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {new Date(application.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last updated</p>
                  <p className="font-medium">
                    {new Date(application.updatedAt).toLocaleString()}
                  </p>
                </div>
                {application.reviewedAt && (
                  <div>
                    <p className="text-muted-foreground">Reviewed at</p>
                    <p className="font-medium">
                      {new Date(application.reviewedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {application.reviewedBy && (
                  <div>
                    <p className="text-muted-foreground">Reviewed by</p>
                    <p className="font-medium">{application.reviewedBy}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Store details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                Store Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Store Name</p>
                <p className="font-medium">{application.storeName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{application.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm whitespace-pre-wrap">
                  {application.description || "No description provided."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin notes */}
          {isPending && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes about this application (optional)"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar – Applicant info & actions */}
        <div className="space-y-6">
          {/* Applicant */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Applicant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={application.user.image || undefined} />
                  <AvatarFallback>
                    {application.user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {application.user.name || "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {application.user.email}
                  </p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Joined</p>
                <p>
                  {new Date(application.user.joinedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Role</p>
                <Badge variant="outline" className="capitalize">
                  {application.user.role}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {isPending && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full gap-2"
                  onClick={() => openDialog("approve")}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4" />
                  Approve Application
                </Button>
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => openDialog("reject")}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  Reject Application
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog
        open={showDialog}
        onOpenChange={(open) => !open && setShowDialog(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve" : "Reject"} Application
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "This will approve the seller application and create a store for the user."
                : "This will reject the seller application. The user will be notified."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm font-medium">
              Store: {application.storeName}
            </p>
            <p className="text-sm text-muted-foreground">
              Applicant: {application.user.email}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : action === "approve"
                  ? "Approve"
                  : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
