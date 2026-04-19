//app/(admin)/users/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/auth/helpers";
import {
  Search,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle,
  Trash2,
  Loader2,
  UserCheck,
  Package,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "buyer" | "seller" | "admin";
  whatsappNumber: string | null;
  createdAt: string;
  banned: boolean | null;
  banReason: string | null;
  banExpires: string | null;
  stats: {
    totalProducts: number;
    totalOrders: number;
  };
}

interface BanModalData {
  userId: string;
  userName: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAdmin, isLoading: roleLoading } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [search]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banUser, setBanUser] = useState<BanModalData | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDays, setBanDays] = useState(7);
  const [actionLoading, setActionLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const limit = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        const body = await res.text();
        const message = body || `HTTP ${res.status}`;
        throw new Error(message);
      }

      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      } else {
        throw new Error(data.message || "Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load users",
      );
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, debouncedSearch]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, roleLoading, router]);

  useEffect(() => {
    if (!roleLoading && isAdmin) {
      fetchUsers();
    }
  }, [page, roleFilter, debouncedSearch, roleLoading, isAdmin, fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user) {
      toast.error("User not found");
      return;
    }

    if (user.role === "admin" && newRole !== "admin") {
      const confirmed = confirm(
        `Are you sure you want to demote ${user.name || user.email} from admin to ${newRole}?`,
      );
      if (!confirmed) {
        return;
      }
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers();
      } else {
        throw new Error(data.message || "Failed to update role");
      }
    } catch (error) {
      console.error("Role change error:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setActionLoading(false);
      setMenuOpen(null);
    }
  };

  const handleBan = async () => {
    if (!banUser) return;

    setActionLoading(true);
    try {
      const banExpires =
        banDays > 0
          ? new Date(Date.now() + banDays * 24 * 60 * 60 * 1000).toISOString()
          : null;

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: banUser.userId,
          banned: true,
          banReason,
          banExpires,
        }),
      });

      if (!res.ok) {
        let errorMessage = "Failed to ban user";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data.success) {
        toast.success(`User ${banUser.userName} has been banned`);
        setShowBanModal(false);
        setBanUser(null);
        setBanReason("");
        setBanDays(7);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to ban user");
      }
    } catch (error) {
      console.error("Ban error:", error);
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async (userId: string, userName: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          banned: false,
          banReason: null,
          banExpires: null,
        }),
      });

      if (!res.ok) {
        let errorMessage = "Failed to unban user";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data.success) {
        toast.success(`${userName} has been unbanned`);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to unban user");
      }
    } catch (error) {
      console.error("Unban error:", error);
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
      setMenuOpen(null);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let errorMessage = "Failed to delete user";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data.success) {
        toast.success(`${userName} has been deleted`);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong");
    } finally {
      setActionLoading(false);
      setMenuOpen(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
      case "seller":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, update roles, and handle bans
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <Filter className="w-4 h-4 text-muted-foreground self-center" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  User
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Role
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  WhatsApp
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Stats
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Joined
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {user.name || "Unnamed"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        disabled={actionLoading}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-primary ${getRoleBadgeColor(user.role)}`}
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {user.whatsappNumber || "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Package className="w-3 h-3" />
                          {user.stats.totalProducts}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <ShoppingBag className="w-3 h-3" />
                          {user.stats.totalOrders}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {user.banned ? (
                        <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                          <Ban className="w-3 h-3" />
                          Banned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpen(menuOpen === user.id ? null : user.id)
                          }
                          className="p-1 rounded-lg hover:bg-muted transition"
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {menuOpen === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                            {user.banned ? (
                              <button
                                onClick={() =>
                                  handleUnban(user.id, user.name || user.email)
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-muted transition text-left"
                              >
                                <UserCheck className="w-4 h-4" />
                                Unban User
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setBanUser({
                                    userId: user.id,
                                    userName: user.name || user.email,
                                  });
                                  setShowBanModal(true);
                                  setMenuOpen(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-muted transition text-left"
                              >
                                <Ban className="w-4 h-4" />
                                Ban User
                              </button>
                            )}
                            {user.role !== "admin" && (
                              <button
                                onClick={() =>
                                  handleDelete(user.id, user.name || user.email)
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-muted transition text-left border-t border-border"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete User
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-border">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {showBanModal && banUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Ban User
            </h2>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to ban{" "}
              <span className="font-medium text-foreground">
                {banUser.userName}
              </span>
              ?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Reason for ban
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for banning this user..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Ban duration
              </label>
              <select
                value={banDays}
                onChange={(e) => setBanDays(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={0}>Permanent</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanUser(null);
                  setBanReason("");
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
