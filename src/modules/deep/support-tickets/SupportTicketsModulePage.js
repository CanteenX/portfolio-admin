import {
  addSupportTicketComment,
  createSupportTicket,
  deleteSupportTicket,
  getSupportTicketInsights,
  listSupportTickets,
  transitionSupportTicket,
  updateSupportTicket
} from "@admin-platform/shared-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Ticket, Plus, AlertCircle, MessageSquare } from "lucide-react";

function parseTags(input) {
  return Array.from(new Set(input.split(",").map((item) => item.trim()).filter((item) => item.length > 0)));
}

export function SupportTicketsModulePage() {
  const { api } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [insights, setInsights] = useState(null);
  const [commentByTicket, setCommentByTicket] = useState({});
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    description: "",
    requesterName: "",
    requesterEmail: "",
    channel: "web",
    priority: "medium",
    tagsCsv: ""
  });

  async function loadAll(targetPage = page) {
    setError(null);
    try {
      const [ticketsResult, insightsResult] = await Promise.all([
        listSupportTickets(api, { page: targetPage, limit }),
        getSupportTicketInsights(api)
      ]);
      setTickets(ticketsResult.items);
      setPage(ticketsResult.page);
      setTotal(ticketsResult.total);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load support tickets");
    }
  }

  useEffect(() => {
    void loadAll(page);
  }, [api, page]);

  async function onCreateTicket(event) {
    event.preventDefault();
    try {
      await createSupportTicket(api, {
        subject: form.subject,
        description: form.description,
        requesterName: form.requesterName,
        requesterEmail: form.requesterEmail,
        channel: form.channel,
        priority: form.priority,
        tags: parseTags(form.tagsCsv)
      });
      setForm({
        subject: "",
        description: "",
        requesterName: "",
        requesterEmail: "",
        channel: "web",
        priority: "medium",
        tagsCsv: ""
      });
      await loadAll(1);
    } catch {
      setError("Failed to create support ticket");
    }
  }

  async function onTransitionTicket(ticketId, to) {
    try {
      const noteInput = window.prompt("Optional transition note");
      const note = noteInput && noteInput.trim() ? noteInput.trim() : undefined;
      await transitionSupportTicket(api, ticketId, { to, note });
      await loadAll(page);
    } catch {
      setError("Failed to transition support ticket");
    }
  }

  async function onAddComment(ticketId) {
    const message = (commentByTicket[ticketId] ?? "").trim();
    if (!message) {
      setError("Comment message is required");
      return;
    }
    try {
      await addSupportTicketComment(api, ticketId, { message });
      setCommentByTicket((prev) => ({ ...prev, [ticketId]: "" }));
      await loadAll(page);
    } catch {
      setError("Failed to add comment");
    }
  }

  async function onPriorityChange(ticketId, priority) {
    try {
      await updateSupportTicket(api, ticketId, { priority });
      await loadAll(page);
    } catch {
      setError("Failed to update ticket priority");
    }
  }

  async function onDeleteTicket(ticketId) {
    if (!window.confirm("Delete this closed ticket?")) return;
    try {
      await deleteSupportTicket(api, ticketId);
      const remainingAfterDelete = total - 1;
      const maxPage = Math.max(1, Math.ceil(remainingAfterDelete / limit));
      await loadAll(Math.min(page, maxPage));
    } catch {
      setError("Failed to delete ticket");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <section className="space-y-6">
      <Breadcrumb title="Support Tickets" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "Support Tickets" }]} />

      {insights ? (
        <Card className="industrial-card">
          <CardContent className="p-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Open</span>
              <span className="ml-2 font-bold">{insights.counts.open}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">In Progress</span>
              <span className="ml-2 font-bold">{insights.counts.inProgress}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Pending Customer</span>
              <span className="ml-2 font-bold">{insights.counts.pendingCustomer}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Resolved</span>
              <span className="ml-2 font-bold">{insights.counts.resolved}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Closed</span>
              <span className="ml-2 font-bold">{insights.counts.closed}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Urgent Open</span>
              <span className="ml-2 font-bold">{insights.counts.urgentOpen}</span>
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
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Create Ticket</h3>
          <form onSubmit={onCreateTicket} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Subject</Label>
              <Input
                placeholder="Subject"
                value={form.subject}
                onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Description</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Requester Name</Label>
                <Input
                  placeholder="Requester Name"
                  value={form.requesterName}
                  onChange={(event) => setForm((prev) => ({ ...prev, requesterName: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Requester Email</Label>
                <Input
                  placeholder="Requester Email"
                  value={form.requesterEmail}
                  onChange={(event) => setForm((prev) => ({ ...prev, requesterEmail: event.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Channel</Label>
                <select
                  className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.channel}
                  onChange={(event) => setForm((prev) => ({ ...prev, channel: event.target.value }))}
                >
                  <option value="web">web</option>
                  <option value="email">email</option>
                  <option value="chat">chat</option>
                  <option value="phone">phone</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Priority</Label>
                <select
                  className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.priority}
                  onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="urgent">urgent</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Tags (comma-separated)</Label>
              <Input
                placeholder="Tags CSV (optional)"
                value={form.tagsCsv}
                onChange={(event) => setForm((prev) => ({ ...prev, tagsCsv: event.target.value }))}
              />
            </div>
            <Button type="submit" className="font-bold uppercase tracking-wider">
              <Plus className="w-4 h-4" /> Create Ticket
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-2">Tickets</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Showing {tickets.length} of {total} tickets
        </p>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <Card key={ticket._id} className="industrial-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold">
                  {ticket.ticketNumber} - {ticket.subject}
                </div>
                <Badge
                  variant={
                    ticket.status === "open" || ticket.status === "in_progress"
                      ? "default"
                      : ticket.status === "closed"
                        ? "secondary"
                        : "secondary"
                  }
                  className="text-xs"
                >
                  {ticket.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Requester: {ticket.requesterName} ({ticket.requesterEmail}) | Channel: {ticket.channel}
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                Priority:{" "}
                <select
                  className="flex h-7 rounded-sm border border-input bg-transparent px-2 py-0.5 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={ticket.priority}
                  onChange={(event) => onPriorityChange(ticket._id, event.target.value)}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="urgent">urgent</option>
                </select>
              </div>
              {ticket.description ? (
                <p className="text-sm mt-2">{ticket.description}</p>
              ) : null}

              {ticket.tags && ticket.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {ticket.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              ) : null}

              <div className="flex gap-2 mt-3 flex-wrap">
                {ticket.status === "open" ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "in_progress")}>
                      Start
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "pending_customer")}>
                      Pending Customer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "resolved")}>
                      Resolve
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "closed")}>
                      Close
                    </Button>
                  </>
                ) : null}
                {ticket.status === "in_progress" ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "pending_customer")}>
                      Pending Customer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "resolved")}>
                      Resolve
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "closed")}>
                      Close
                    </Button>
                  </>
                ) : null}
                {ticket.status === "pending_customer" ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "in_progress")}>
                      Resume
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "resolved")}>
                      Resolve
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "closed")}>
                      Close
                    </Button>
                  </>
                ) : null}
                {ticket.status === "resolved" ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "in_progress")}>
                      Reopen
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onTransitionTicket(ticket._id, "closed")}>
                      Close
                    </Button>
                  </>
                ) : null}
                {ticket.status === "closed" ? (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDeleteTicket(ticket._id)}>
                    Delete
                  </Button>
                ) : null}
              </div>

              <div className="flex gap-2 mt-3">
                <Input
                  className="flex-1"
                  placeholder="Add comment"
                  value={commentByTicket[ticket._id] ?? ""}
                  onChange={(event) => setCommentByTicket((prev) => ({ ...prev, [ticket._id]: event.target.value }))}
                />
                <Button size="sm" onClick={() => onAddComment(ticket._id)}>
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Comments: {ticket.commentsCount ?? 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </section>
  );
}
