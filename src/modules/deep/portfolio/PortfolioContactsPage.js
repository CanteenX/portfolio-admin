import { RbacGate } from "../../../components/common/RequirePermission";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { listPortfolioContacts, updateContactStatus } from "../../../shared/sdk";

const STATUS_OPTIONS = ["new", "read", "replied"];
const STATUS_COLORS = { new: "bg-blue-500/10 text-blue-400", read: "bg-yellow-500/10 text-yellow-400", replied: "bg-green-500/10 text-green-400" };

export function PortfolioContactsPage() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const LIMIT = 20;

  async function loadData(p = 1) {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      const result = await listPortfolioContacts(api, params);
      setItems(result.items);
      setTotal(result.total);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(page); }, [page, statusFilter]);

  async function handleStatusChange(id, status) {
    try {
      await updateContactStatus(api, id, status);
      setItems(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to update status");
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Portfolio CMS</div>
          <h1 className="text-2xl font-bold">Contact Inbox</h1>
          <p className="text-sm text-gray-500 mt-1">{total} submission{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Filter:</label>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">All</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* List */}
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">From</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Service</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No submissions yet.</td></tr>
              ) : items.map(item => (
                <tr key={item._id} onClick={() => setSelected(item)} className={`border-b border-border cursor-pointer transition-colors ${selected?._id === item._id ? "bg-primary/5" : "hover:bg-muted/20"}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{item.service || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="rounded-xl border border-border p-6 space-y-4 h-fit">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{selected.name}</h3>
                <a href={`mailto:${selected.email}`} className="text-sm text-primary hover:underline">{selected.email}</a>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
            </div>

            <div className="space-y-1 text-sm">
              {selected.service && <div><span className="text-muted-foreground">Service:</span> {selected.service}</div>}
              {selected.callSlot && <div><span className="text-muted-foreground">Call Slot:</span> {selected.callSlot}</div>}
              <div><span className="text-muted-foreground">Received:</span> {new Date(selected.createdAt).toLocaleString()}</div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Update Status</label>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map(s => (
                  <RbacGate action="edit"><button key={s} onClick={() => handleStatusChange(selected._id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selected.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button></RbacGate>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border p-6 flex items-center justify-center text-muted-foreground text-sm h-48">
            Select a submission to view details
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded border border-border disabled:opacity-40 hover:bg-muted">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
