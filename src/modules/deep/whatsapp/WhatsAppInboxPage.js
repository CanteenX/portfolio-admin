/**
 * WhatsApp Inbox Page
 *
 * Two-way messaging inbox for WhatsApp conversations.
 * Features:
 * - Left panel: conversation list with search, filters, and unread indicators
 * - Right panel: message thread with chat history and reply input
 * - Real-time updates via Socket.IO
 * - 24-hour window enforcement (free-text vs template-only)
 * - Template picker modal for sending approved templates
 * - Message status indicators (sent/delivered/read)
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Search,
  MessageCircle,
  Send,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  FileText,
  RefreshCw,
} from "lucide-react";

// TODO: Uncomment when Socket.IO is properly configured
// import { io } from "socket.io-client";
// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:7002";

export function WhatsAppInboxPage() {
  const { api } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateVariables, setTemplateVariables] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load conversations
  async function loadConversations() {
    try {
      setError(null);
      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.getConversations({
      //   page,
      //   limit: 20,
      //   search: searchTerm,
      //   campaignId: campaignFilter || undefined,
      // });

      // Mock data
      const mockConversations = [
        {
          _id: "conv1",
          contactName: "John Doe",
          phoneNumber: "+1234567890",
          lastMessage: "Thanks for the update! Looking forward to it.",
          lastMessageAt: new Date(Date.now() - 2 * 60000).toISOString(), // 2m ago
          unreadCount: 2,
          within24h: true,
          campaignId: "campaign1",
        },
        {
          _id: "conv2",
          contactName: "Jane Smith",
          phoneNumber: "+1987654321",
          lastMessage: "Got it, will check that out.",
          lastMessageAt: new Date(Date.now() - 3600000).toISOString(), // 1h ago
          unreadCount: 0,
          within24h: true,
          campaignId: "campaign1",
        },
        {
          _id: "conv3",
          contactName: null,
          phoneNumber: "+1555123456",
          lastMessage: "Sounds good!",
          lastMessageAt: new Date(Date.now() - 86400000 - 3600000).toISOString(), // 25h ago
          unreadCount: 1,
          within24h: false,
          campaignId: "campaign2",
        },
      ];

      setConversations(mockConversations);
      setHasMore(false); // Mock: no more pages
    } catch (err) {
      setError("Failed to load conversations");
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }

  // Load campaigns for filter
  async function loadCampaigns() {
    try {
      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.listCampaigns();

      const mockCampaigns = [
        { _id: "campaign1", name: "Spring Sale 2024" },
        { _id: "campaign2", name: "Product Launch" },
      ];

      setCampaigns(mockCampaigns);
    } catch {
      // ignore
    }
  }

  // Load templates
  async function loadTemplates() {
    try {
      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.listTemplates({ status: "approved" });

      const mockTemplates = [
        {
          _id: "tmpl1",
          name: "order_confirmation",
          displayName: "Order Confirmation",
          bodyText: "Hi {{1}}, your order #{{2}} has been confirmed. Expected delivery: {{3}}.",
          variableCount: 3,
        },
        {
          _id: "tmpl2",
          name: "payment_reminder",
          displayName: "Payment Reminder",
          bodyText: "Hello {{1}}, your payment of ${{2}} is due on {{3}}.",
          variableCount: 3,
        },
      ];

      setTemplates(mockTemplates);
    } catch {
      // ignore
    }
  }

  // Load messages for selected conversation
  async function loadMessages(conversationId) {
    try {
      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.getMessages(conversationId, { limit: 50 });

      const mockMessages = [
        {
          _id: "msg1",
          direction: "outbound",
          text: "Hi! Thanks for your interest in our Spring Sale.",
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2h ago
          status: "read",
        },
        {
          _id: "msg2",
          direction: "inbound",
          text: "Great! Can you tell me more about the discounts?",
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1h ago
        },
        {
          _id: "msg3",
          direction: "outbound",
          text: "Sure! We're offering 20% off on all items.",
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30m ago
          status: "delivered",
        },
        {
          _id: "msg4",
          direction: "inbound",
          text: "Thanks for the update! Looking forward to it.",
          timestamp: new Date(Date.now() - 120000).toISOString(), // 2m ago
        },
      ];

      setMessages(mockMessages);
      setTimeout(scrollToBottom, 100);

      // Mark as read
      // TODO: Replace with actual SDK call
      // await api.whatsapp.markConversationRead(conversationId);
    } catch (err) {
      toast.error("Failed to load messages");
    }
  }

  // Select conversation
  function handleSelectConversation(conversation) {
    setSelectedConversation(conversation);
    loadMessages(conversation._id);

    // Update unread count locally
    setConversations((prev) =>
      prev.map((c) => (c._id === conversation._id ? { ...c, unreadCount: 0 } : c))
    );
  }

  // Send free-text reply
  async function handleSendReply() {
    if (!replyText.trim() || !selectedConversation) return;

    if (!selectedConversation.within24h) {
      toast.error("24-hour window expired. Please use a template.");
      return;
    }

    setSending(true);
    try {
      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.sendReply(selectedConversation._id, {
      //   text: replyText,
      // });

      // Mock: Add message optimistically
      const newMessage = {
        _id: `msg_${Date.now()}`,
        direction: "outbound",
        text: replyText,
        timestamp: new Date().toISOString(),
        status: "sent",
      };

      setMessages((prev) => [...prev, newMessage]);
      setReplyText("");
      setTimeout(scrollToBottom, 100);
      toast.success("Message sent");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  // Open template modal
  function handleOpenTemplateModal() {
    setTemplateModalOpen(true);
    setSelectedTemplate(null);
    setTemplateVariables({});
  }

  // Handle template selection
  function handleTemplateSelect(templateId) {
    const template = templates.find((t) => t._id === templateId);
    setSelectedTemplate(template);

    // Initialize variables
    const vars = {};
    for (let i = 1; i <= (template?.variableCount || 0); i++) {
      vars[i] = "";
    }
    setTemplateVariables(vars);
  }

  // Send template message
  async function handleSendTemplate() {
    if (!selectedTemplate || !selectedConversation) return;

    // Validate all variables are filled
    const allFilled = Object.values(templateVariables).every((v) => v.trim());
    if (!allFilled) {
      toast.error("Please fill all template variables");
      return;
    }

    setSending(true);
    try {
      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.sendTemplate(selectedConversation._id, {
      //   templateId: selectedTemplate._id,
      //   variables: Object.values(templateVariables),
      // });

      // Mock: Add message optimistically
      let resolvedText = selectedTemplate.bodyText;
      Object.entries(templateVariables).forEach(([key, value]) => {
        resolvedText = resolvedText.replace(`{{${key}}}`, value);
      });

      const newMessage = {
        _id: `msg_${Date.now()}`,
        direction: "outbound",
        text: resolvedText,
        timestamp: new Date().toISOString(),
        status: "sent",
      };

      setMessages((prev) => [...prev, newMessage]);
      setTemplateModalOpen(false);
      setTimeout(scrollToBottom, 100);
      toast.success("Template sent");
    } catch (err) {
      toast.error("Failed to send template");
    } finally {
      setSending(false);
    }
  }

  // Get preview of resolved template
  function getTemplatePreview() {
    if (!selectedTemplate) return "";

    let preview = selectedTemplate.bodyText;
    Object.entries(templateVariables).forEach(([key, value]) => {
      preview = preview.replace(`{{${key}}}`, value || `{{${key}}}`);
    });
    return preview;
  }

  // Socket.IO setup
  useEffect(() => {
    // TODO: Uncomment when Socket.IO is configured
    // socketRef.current = io(SOCKET_URL);
    // socketRef.current.emit("join_whatsapp_inbox");
    //
    // socketRef.current.on("wa_new_message", (data) => {
    //   // Update conversation list
    //   setConversations((prev) => {
    //     const updated = prev.map((c) =>
    //       c._id === data.conversationId
    //         ? {
    //             ...c,
    //             lastMessage: data.text,
    //             lastMessageAt: data.timestamp,
    //             unreadCount: c.unreadCount + (c._id !== selectedConversation?._id ? 1 : 0),
    //           }
    //         : c
    //     );
    //     return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
    //   });
    //
    //   // If message is for current conversation, append it
    //   if (selectedConversation && data.conversationId === selectedConversation._id) {
    //     setMessages((prev) => [...prev, data]);
    //     setTimeout(scrollToBottom, 100);
    //   }
    // });
    //
    // socketRef.current.on("wa_status_update", (data) => {
    //   setMessages((prev) =>
    //     prev.map((m) => (m._id === data.messageId ? { ...m, status: data.status } : m))
    //   );
    // });
    //
    // return () => {
    //   socketRef.current?.disconnect();
    // };
  }, [selectedConversation]);

  // Load initial data
  useEffect(() => {
    loadConversations();
    loadCampaigns();
    loadTemplates();
  }, [page, searchTerm, campaignFilter, api]);

  // Auto-refresh every 10 seconds if conversation is open
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(() => {
      loadMessages(selectedConversation._id);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Format relative time
  function formatRelativeTime(timestamp) {
    if (!timestamp) return "";

    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;

    const diffDays = Math.floor(diffHr / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  }

  // Format message timestamp
  function formatMessageTime(timestamp) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(timestamp));
  }

  // Get status icon
  function getStatusIcon(status) {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <Breadcrumb
          title="WhatsApp Inbox"
          items={[
            { label: "Home", path: "/" },
            { label: "WhatsApp" },
            { label: "Inbox" },
          ]}
        />
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Breadcrumb
        title="WhatsApp Inbox"
        items={[
          { label: "Home", path: "/" },
          { label: "WhatsApp" },
          { label: "Inbox" },
        ]}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <Card className="industrial-card">
        <CardContent className="p-0">
          <div className="flex h-[calc(100vh-240px)]">
            {/* Left Column: Conversation List */}
            <div className="w-[30%] border-r flex flex-col">
              {/* Search & Filters */}
              <div className="p-4 border-b space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={campaignFilter || "all"} onValueChange={(value) => setCampaignFilter(value === "all" ? "" : value)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Filter by campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign._id} value={campaign._id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations found</p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation?._id === conversation._id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2 flex-1">
                          <h4 className="font-medium text-sm truncate">
                            {conversation.contactName || conversation.phoneNumber}
                          </h4>
                          {conversation.within24h ? (
                            <div
                              className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"
                              title="Can reply (within 24h)"
                            />
                          ) : (
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"
                              title="Template only (24h expired)"
                            />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatRelativeTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        {conversation.phoneNumber}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate flex-1">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-2 flex-shrink-0 h-5 min-w-5 px-1.5 text-xs"
                          >
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {hasMore && (
                  <div className="p-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      className="text-xs"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Chat Panel */}
            <div className="w-[70%] flex flex-col">
              {!selectedConversation ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold uppercase tracking-tight">
                          {selectedConversation.contactName || selectedConversation.phoneNumber}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedConversation.phoneNumber}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedConversation.within24h ? (
                          <Badge variant="default" className="uppercase text-xs">
                            Can Reply
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="uppercase text-xs">
                            Template Only
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadMessages(selectedConversation._id)}
                          title="Refresh messages"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Message History */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.direction === "outbound" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            message.direction === "outbound"
                              ? "bg-blue-500 text-white"
                              : "bg-muted text-foreground"
                          } rounded-lg px-3 py-2`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          <div
                            className={`flex items-center gap-1 mt-1 text-xs ${
                              message.direction === "outbound"
                                ? "text-blue-100 justify-end"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span>{formatMessageTime(message.timestamp)}</span>
                            {message.direction === "outbound" && (
                              <span className="ml-1">{getStatusIcon(message.status)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    {!selectedConversation.within24h && (
                      <div className="mb-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>
                          24-hour window expired. Free-text replies are disabled. Use a template
                          instead.
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        placeholder={
                          selectedConversation.within24h
                            ? "Type your message..."
                            : "Use template (24h expired)"
                        }
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={!selectedConversation.within24h || sending}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || !selectedConversation.within24h || sending}
                        className="font-bold uppercase tracking-wider"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleOpenTemplateModal}
                        disabled={sending}
                        className="font-bold uppercase tracking-wider"
                      >
                        <FileText className="w-4 h-4 mr-1" /> Template
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Picker Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">
              Send Template Message
            </DialogTitle>
            <DialogDescription>
              Select an approved template and fill in the required variables.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Select Template
              </label>
              <Select value={selectedTemplate?._id || ""} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <>
                {/* Variable Inputs */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Template Variables
                  </label>
                  {Array.from({ length: selectedTemplate.variableCount }, (_, i) => i + 1).map(
                    (idx) => (
                      <div key={idx}>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Variable {idx}
                        </label>
                        <Input
                          placeholder={`Value for {{${idx}}}`}
                          value={templateVariables[idx] || ""}
                          onChange={(e) =>
                            setTemplateVariables((prev) => ({ ...prev, [idx]: e.target.value }))
                          }
                        />
                      </div>
                    )
                  )}
                </div>

                {/* Preview */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Preview
                  </label>
                  <div className="bg-muted rounded-sm p-3 text-sm whitespace-pre-wrap">
                    {getTemplatePreview()}
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTemplateModalOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendTemplate}
              disabled={!selectedTemplate || sending}
              className="font-bold uppercase tracking-wider"
            >
              {sending ? "Sending..." : "Send Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
