"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Send,
  Bell,
  MessageSquare,
  AlertTriangle,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

interface SystemMessage {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  targetAudience: "all" | "sellers" | "buyers" | "admins";
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface NotificationLog {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  status: "sent" | "failed" | "pending";
  sentAt: string;
}

const messageTypeConfig = {
  info: { label: "Info", color: "bg-blue-100 text-blue-800", icon: Info },
  warning: {
    label: "Warning",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertTriangle,
  },
  error: {
    label: "Error",
    color: "bg-red-100 text-red-800",
    icon: AlertTriangle,
  },
  success: {
    label: "Success",
    color: "bg-green-100 text-green-800",
    icon: Info,
  },
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState({
    type: "info" as const,
    title: "",
    message: "",
    targetAudience: "all" as const,
    expiresAt: "",
  });

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      if (!res.ok) throw new Error("Failed to fetch messages");

      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
      toast.error("Failed to load messages");
    }
  };

  const fetchNotificationLogs = async () => {
    try {
      const res = await fetch("/api/admin/messages/logs");
      if (!res.ok) throw new Error("Failed to fetch logs");

      const data = await res.json();
      if (data.success) {
        setNotificationLogs(data.logs);
      }
    } catch (error) {
      console.error("Fetch logs error:", error);
      toast.error("Failed to load notification logs");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMessages(), fetchNotificationLogs()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.title.trim() || !newMessage.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    try {
      setSending(true);
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      if (data.success) {
        toast.success("Message sent successfully");
        setNewMessage({
          type: "info",
          title: "",
          message: "",
          targetAudience: "all",
          expiresAt: "",
        });
        fetchMessages();
        fetchNotificationLogs();
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const toggleMessageStatus = async (messageId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      if (!res.ok) throw new Error("Failed to update message");

      toast.success(`Message ${isActive ? "activated" : "deactivated"}`);
      fetchMessages();
    } catch (error) {
      console.error("Toggle message error:", error);
      toast.error("Failed to update message");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages & Notifications</h1>
          <p className="text-muted-foreground">
            Manage system messages and notifications
          </p>
        </div>
      </div>

      <Tabs defaultValue="send" className="space-y-6">
        <TabsList>
          <TabsTrigger value="send">Send Message</TabsTrigger>
          <TabsTrigger value="active">Active Messages</TabsTrigger>
          <TabsTrigger value="logs">Notification Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send New Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Message Type</Label>
                  <Select
                    value={newMessage.type}
                    onValueChange={(value: any) =>
                      setNewMessage((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select
                    value={newMessage.targetAudience}
                    onValueChange={(value: any) =>
                      setNewMessage((prev) => ({
                        ...prev,
                        targetAudience: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="sellers">Sellers Only</SelectItem>
                      <SelectItem value="buyers">Buyers Only</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Message Title</Label>
                <Input
                  id="title"
                  value={newMessage.title}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter message title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  value={newMessage.message}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Enter your message"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={newMessage.expiresAt}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      expiresAt: e.target.value,
                    }))
                  }
                />
              </div>

              <Button
                onClick={sendMessage}
                disabled={sending}
                className="w-full"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Active System Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active messages
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const config = messageTypeConfig[message.type];
                    const Icon = config.icon;
                    return (
                      <div key={message.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Icon className="w-5 h-5 mt-0.5 text-muted-foreground" />
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{message.title}</h3>
                                <Badge className={config.color}>
                                  {config.label}
                                </Badge>
                                <Badge variant="outline">
                                  {message.targetAudience}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {message.message}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                Created: {formatDate(message.createdAt)}
                                {message.expiresAt &&
                                  ` • Expires: ${formatDate(message.expiresAt)}`}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleMessageStatus(message.id, !message.isActive)
                            }
                          >
                            {message.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Notification Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notificationLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No notification logs
                </div>
              ) : (
                <div className="space-y-2">
                  {notificationLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm">
                          <div className="font-medium">{log.subject}</div>
                          <div className="text-muted-foreground">
                            To: {log.recipient}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            log.status === "sent"
                              ? "default"
                              : log.status === "failed"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {log.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.sentAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
