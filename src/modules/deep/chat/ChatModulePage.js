import {
  listChatConversations,
  createChatConversation,
  archiveChatConversation,
  deleteChatConversation,
  listChatMessages,
  sendChatMessage,
  getChatInsights
} from "@admin-platform/shared-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { MessageSquare, Plus, AlertCircle, Send, Archive, Trash2 } from "lucide-react";

export function ChatModulePage() {
  const { api, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ title: "", participantUserIds: "" });
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageForm, setMessageForm] = useState({ content: "" });
  const [loadingMessages, setLoadingMessages] = useState(false);

  async function loadAll(targetPage = page) {
    setError(null);
    try {
      const [conversationsResult, insightsResult] = await Promise.all([
        listChatConversations(api, { page: targetPage, limit }),
        getChatInsights(api)
      ]);
      setConversations(conversationsResult.items);
      setPage(conversationsResult.page);
      setTotal(conversationsResult.total);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load conversations");
    }
  }

  async function loadMessages(conversationId) {
    setLoadingMessages(true);
    setError(null);
    try {
      const result = await listChatMessages(api, { conversationId, page: 1, limit: 100 });
      setMessages(result.items);
    } catch {
      setError("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => {
    void loadAll(page);
  }, [api, page]);

  useEffect(() => {
    if (selectedConversationId) {
      void loadMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  // SSE: subscribe to real-time events when a conversation is expanded
  useEffect(() => {
    if (!selectedConversationId || !token) return;

    const baseUrl = (api.defaults.baseURL ?? "").replace(/\/$/, "");
    // SECURITY NOTE: JWT in URL query string is visible in server logs and browser history. Acceptable for internal admin panel; for public-facing apps, use cookie-based auth or a short-lived token exchange.
    const url = `${baseUrl}/api/v1/chat/conversations/${selectedConversationId}/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener("message", (e) => {
      try {
        const incoming = JSON.parse(e.data);
        setMessages((prev) => [incoming, ...prev]);
      } catch { /* ignore */ }
    });

    eventSource.addEventListener("message_edited", (e) => {
      try {
        const updated = JSON.parse(e.data);
        setMessages((prev) =>
          prev.map((m) => (m._id === updated._id || m.messageId === updated._id ? updated : m))
        );
      } catch { /* ignore */ }
    });

    eventSource.addEventListener("message_deleted", (e) => {
      try {
        const { _id } = JSON.parse(e.data);
        setMessages((prev) => prev.filter((m) => m._id !== _id && m.messageId !== _id));
      } catch { /* ignore */ }
    });

    eventSource.addEventListener("error", () => {
      eventSource.close();
    });

    return () => {
      eventSource.close();
    };
  }, [selectedConversationId, token, api]);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      const participantIds = form.participantUserIds
        .split(",")
        .map(id => id.trim())
        .filter(Boolean);
      await createChatConversation(api, {
        title: form.title,
        participantUserIds: participantIds
      });
      setForm({ title: "", participantUserIds: "" });
      await loadAll(1);
    } catch {
      setError("Failed to create conversation");
    }
  }

  async function handleArchive(conversationId) {
    setError(null);
    try {
      await archiveChatConversation(api, { conversationId });
      await loadAll(page);
    } catch {
      setError("Failed to archive conversation");
    }
  }

  async function handleDelete(conversationId) {
    setError(null);
    try {
      await deleteChatConversation(api, { conversationId });
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
      await loadAll(page);
    } catch {
      setError("Failed to delete conversation");
    }
  }

  async function handleSendMessage(e, conversationId) {
    e.preventDefault();
    setError(null);
    try {
      await sendChatMessage(api, {
        conversationId,
        content: messageForm.content
      });
      setMessageForm({ content: "" });
      await loadMessages(conversationId);
      await loadAll(page);
    } catch {
      setError("Failed to send message");
    }
  }

  function toggleConversation(conversationId) {
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null);
    } else {
      setSelectedConversationId(conversationId);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <Breadcrumb title="Chat" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "Chat" }]} />

      {insights ? (
        <Card className="industrial-card">
          <CardContent className="p-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Total</span>
              <span className="ml-2 font-bold">{insights.total}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Active</span>
              <span className="ml-2 font-bold">{insights.active}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Archived</span>
              <span className="ml-2 font-bold">{insights.archived}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Messages</span>
              <span className="ml-2 font-bold">{insights.totalMessages}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : null}

      <Card className="industrial-card">
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Create Conversation</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Title</Label>
              <Input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Participant User IDs</Label>
              <Input
                type="text"
                placeholder="Participant User IDs (comma-separated)"
                value={form.participantUserIds}
                onChange={e => setForm(prev => ({ ...prev, participantUserIds: e.target.value }))}
              />
            </div>
            <Button type="submit" className="font-bold uppercase tracking-wider">
              <Plus className="w-4 h-4" /> Create Conversation
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <span className="font-display font-bold uppercase tracking-tight">Conversations</span>
        <Badge variant="secondary">{total}</Badge>
      </div>

      {conversations.length === 0 ? (
        <Card className="industrial-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No conversations found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map(conv => (
            <Card
              key={conv.conversationId}
              className={`industrial-card ${selectedConversationId === conv.conversationId ? "border-primary/30 bg-primary/5" : ""}`}
            >
              <CardContent className="p-4">
                <div
                  onClick={() => toggleConversation(conv.conversationId)}
                  className="cursor-pointer mb-2"
                >
                  <div className="font-bold">{conv.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Status: <Badge variant="outline" className="ml-1">{conv.status}</Badge>
                    <span className="ml-2">Participants: {conv.participantUserIds.join(", ")}</span>
                    <span className="ml-2">Messages: {conv.messageCount}</span>
                    {conv.lastMessageAt ? <span className="ml-2">Last: {new Date(conv.lastMessageAt).toLocaleString()}</span> : ""}
                  </div>
                </div>

                <div className="flex gap-2">
                  {conv.status === "active" ? (
                    <Button variant="outline" size="sm" onClick={() => handleArchive(conv.conversationId)}>
                      <Archive className="w-4 h-4" /> Archive
                    </Button>
                  ) : null}
                  {conv.status === "archived" ? (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(conv.conversationId)}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  ) : null}
                </div>

                {selectedConversationId === conv.conversationId ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="font-bold mb-2">Messages</div>
                    {loadingMessages ? (
                      <p className="text-sm text-muted-foreground">Loading messages...</p>
                    ) : messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No messages yet.</p>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto mb-3 space-y-2">
                        {messages.map(msg => (
                          <div key={msg.messageId} className="p-3 rounded-sm bg-muted">
                            <div className="text-xs text-muted-foreground">
                              {msg.senderUserId} - {new Date(msg.sentAt).toLocaleString()}
                            </div>
                            <p className="mt-1 text-sm">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      onSubmit={e => handleSendMessage(e, conv.conversationId)}
                      className="flex gap-2"
                    >
                      <Input
                        className="flex-1"
                        type="text"
                        placeholder="Type a message..."
                        value={messageForm.content}
                        onChange={e => setMessageForm({ content: e.target.value })}
                        required
                      />
                      <Button type="submit" size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center gap-3 pt-4">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
