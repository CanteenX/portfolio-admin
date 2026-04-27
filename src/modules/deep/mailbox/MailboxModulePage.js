import {
  listMailboxMessages,
  createMailboxMessage,
  deleteMailboxMessage,
  moveMailboxMessage,
  toggleMailboxStar,
  markMailboxRead,
  sendMailboxDraft,
  getMailboxInsights
} from "@admin-platform/shared-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Mail, Plus, AlertCircle, Star, Trash2, Send, Eye, EyeOff } from "lucide-react";

export function MailboxModulePage() {
  const { api } = useAuth();
  const [messages, setMessages] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    body: "",
    fromAddress: "",
    fromName: "",
    toAddresses: "",
    folder: "drafts"
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [currentFolder, setCurrentFolder] = useState("inbox");

  async function loadAll(targetPage = page, folder = currentFolder) {
    setError(null);
    try {
      const [messagesResult, insightsResult] = await Promise.all([
        listMailboxMessages(api, { folder, page: targetPage, limit }),
        getMailboxInsights(api)
      ]);
      setMessages(messagesResult.items);
      setPage(messagesResult.page);
      setTotal(messagesResult.total);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load messages");
    }
  }

  useEffect(() => {
    void loadAll(page, currentFolder);
  }, [api, page, currentFolder]);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      const toAddrs = form.toAddresses
        .split(",")
        .map(addr => addr.trim())
        .filter(Boolean);
      await createMailboxMessage(api, {
        subject: form.subject,
        body: form.body,
        fromAddress: form.fromAddress,
        fromName: form.fromName,
        toAddresses: toAddrs,
        folder: form.folder
      });
      setForm({
        subject: "",
        body: "",
        fromAddress: "",
        fromName: "",
        toAddresses: "",
        folder: "drafts"
      });
      await loadAll(1, currentFolder);
    } catch {
      setError("Failed to create message");
    }
  }

  async function handleDelete(messageId) {
    setError(null);
    try {
      await deleteMailboxMessage(api, { messageId });
      await loadAll(page, currentFolder);
    } catch {
      setError("Failed to delete message");
    }
  }

  async function handleMove(messageId, targetFolder) {
    setError(null);
    try {
      await moveMailboxMessage(api, { messageId, folder: targetFolder });
      await loadAll(page, currentFolder);
    } catch {
      setError("Failed to move message");
    }
  }

  async function handleToggleStar(messageId) {
    setError(null);
    try {
      await toggleMailboxStar(api, { messageId });
      await loadAll(page, currentFolder);
    } catch {
      setError("Failed to toggle star");
    }
  }

  async function handleMarkRead(messageId, isRead) {
    setError(null);
    try {
      await markMailboxRead(api, { messageId, isRead });
      await loadAll(page, currentFolder);
    } catch {
      setError("Failed to mark read status");
    }
  }

  async function handleSendDraft(messageId) {
    setError(null);
    try {
      await sendMailboxDraft(api, { messageId });
      await loadAll(page, currentFolder);
    } catch {
      setError("Failed to send draft");
    }
  }

  function handleFolderChange(folder) {
    setCurrentFolder(folder);
    setPage(1);
  }

  const totalPages = Math.ceil(total / limit);
  const folders = ["inbox", "sent", "drafts", "trash", "archive"];

  return (
    <div className="space-y-6">
      <Breadcrumb title="Mailbox" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "Mailbox" }]} />

      {insights ? (
        <Card className="industrial-card">
          <CardContent className="p-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Inbox</span>
              <span className="ml-2 font-bold">{insights.inbox}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Sent</span>
              <span className="ml-2 font-bold">{insights.sent}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Drafts</span>
              <span className="ml-2 font-bold">{insights.drafts}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Trash</span>
              <span className="ml-2 font-bold">{insights.trash}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Archive</span>
              <span className="ml-2 font-bold">{insights.archive}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Unread</span>
              <span className="ml-2 font-bold">{insights.unread}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Starred</span>
              <span className="ml-2 font-bold">{insights.starred}</span>
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
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Compose Message</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Subject</Label>
              <Input
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={e => setForm(prev => ({ ...prev, subject: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Body</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Body"
                value={form.body}
                onChange={e => setForm(prev => ({ ...prev, body: e.target.value }))}
                rows={6}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">From Address</Label>
                <Input
                  type="email"
                  placeholder="From Address"
                  value={form.fromAddress}
                  onChange={e => setForm(prev => ({ ...prev, fromAddress: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">From Name</Label>
                <Input
                  type="text"
                  placeholder="From Name"
                  value={form.fromName}
                  onChange={e => setForm(prev => ({ ...prev, fromName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">To Addresses</Label>
              <Input
                type="text"
                placeholder="To Addresses (comma-separated)"
                value={form.toAddresses}
                onChange={e => setForm(prev => ({ ...prev, toAddresses: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Delivery</Label>
              <select
                className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.folder}
                onChange={e => setForm(prev => ({ ...prev, folder: e.target.value }))}
              >
                <option value="drafts">Save as Draft</option>
                <option value="sent">Send Immediately</option>
              </select>
            </div>
            <Button type="submit" className="font-bold uppercase tracking-wider">
              <Plus className="w-4 h-4" /> Create Message
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {folders.map(folder => (
            <Button
              key={folder}
              variant={currentFolder === folder ? "default" : "outline"}
              size="sm"
              onClick={() => handleFolderChange(folder)}
            >
              {folder.charAt(0).toUpperCase() + folder.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold uppercase tracking-tight">
            {currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1)}
          </span>
          <Badge variant="secondary">{total}</Badge>
        </div>
      </div>

      {messages.length === 0 ? (
        <Card className="industrial-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No messages in {currentFolder}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map(msg => (
            <Card key={msg.messageId} className="industrial-card">
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      {msg.isStarred ? (
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ) : null}
                      {msg.subject}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      From: {msg.fromName} ({msg.fromAddress})
                    </div>
                    <div className="text-sm text-muted-foreground">
                      To: {msg.toAddresses.join(", ")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <Badge variant="outline">{msg.isRead ? "Read" : "Unread"}</Badge>
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-sm mb-3 whitespace-pre-wrap">{msg.body}</div>

                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => handleToggleStar(msg.messageId)}>
                    <Star className={`w-4 h-4 ${msg.isStarred ? "fill-yellow-500 text-yellow-500" : ""}`} />
                    {msg.isStarred ? "Unstar" : "Star"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMarkRead(msg.messageId, !msg.isRead)}>
                    {msg.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    Mark {msg.isRead ? "Unread" : "Read"}
                  </Button>
                  {currentFolder === "drafts" ? (
                    <Button variant="outline" size="sm" onClick={() => handleSendDraft(msg.messageId)}>
                      <Send className="w-4 h-4" /> Send
                    </Button>
                  ) : null}
                  <select
                    className="flex h-9 rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    onChange={e => {
                      if (e.target.value) {
                        handleMove(msg.messageId, e.target.value);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">Move to...</option>
                    {folders
                      .filter(f => f !== currentFolder)
                      .map(f => (
                        <option key={f} value={f}>
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </option>
                      ))}
                  </select>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(msg.messageId)}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </div>
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
