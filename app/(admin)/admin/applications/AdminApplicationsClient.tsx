// app/admin/applications/AdminApplicationsClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Application {
  id: string;
  storeName: string;
  description: string | null;
  phone: string;
  status: string;
  createdAt: string;
  userName: string;
  userEmail: string;
}

export default function AdminApplicationsClient({
  applications,
}: {
  applications: Application[];
}) {
  const router = useRouter();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!selectedApp || !action) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seller-applications/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          adminNotes,
          action, // 'approve' or 'reject'
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
      setLoading(false);
      setSelectedApp(null);
      setAction(null);
      setAdminNotes("");
    }
  };

  const openModal = (app: Application, actionType: "approve" | "reject") => {
    setSelectedApp(app);
    setAction(actionType);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        Seller Applications
      </h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No pending applications
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.storeName}</TableCell>
                  <TableCell>
                    <div>
                      <p>{app.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.userEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{app.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openModal(app, "approve")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openModal(app, "reject")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/admin/applications/${app.id}`)
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal for approve/reject */}
      <Dialog
        open={!!selectedApp}
        onOpenChange={(open) => !open && setSelectedApp(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve" : "Reject"} Application
            </DialogTitle>
            <DialogDescription>
              {selectedApp?.storeName} by {selectedApp?.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Admin notes (optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedApp(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={handleAction}
              disabled={loading}
            >
              {loading
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
