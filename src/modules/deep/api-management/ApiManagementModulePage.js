import {
  getApiManagementInsights,
  issueApiManagementKey,
  listApiManagementKeyEvents,
  listApiManagementKeys,
  regenerateApiManagementKey,
  revokeApiManagementKey
} from "@admin-platform/shared-sdk";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Key, Plus, AlertCircle, ShieldOff, RefreshCw, ClipboardList,
  ChevronDown, ChevronUp, CheckCircle, Info
} from "lucide-react";

function parseScopes(input) {
  return Array.from(new Set(input.split(",").map((item) => item.trim()).filter((item) => item.length > 0)));
}

export function ApiManagementModulePage() {
  const { api } = useAuth();
  const [keys, setKeys] = useState([]);
  const [eventsByKey, setEventsByKey] = useState({});
  const [expandedKeyId, setExpandedKeyId] = useState(null);
  const [insights, setInsights] = useState(null);
  const [issueForm, setIssueForm] = useState({
    name: "",
    description: "",
    scopesCsv: "",
    expiresAt: ""
  });
  const [revealedSecret, setRevealedSecret] = useState(null);
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState(null);

  const activeKeys = useMemo(() => keys.filter((item) => item.status === "active"), [keys]);

  useEffect(() => {
    if (!banner) return;
    const timeout = window.setTimeout(() => setBanner(null), 7000);
    return () => window.clearTimeout(timeout);
  }, [banner]);

  async function loadAll() {
    setError(null);
    try {
      const [keysResult, insightsResult] = await Promise.all([listApiManagementKeys(api), getApiManagementInsights(api)]);
      setKeys(keysResult);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load API management data");
    }
  }

  useEffect(() => {
    void loadAll();
  }, [api]);

  async function onIssueKey(event) {
    event.preventDefault();
    try {
      const response = await issueApiManagementKey(api, {
        name: issueForm.name,
        description: issueForm.description || undefined,
        scopes: parseScopes(issueForm.scopesCsv),
        expiresAt: issueForm.expiresAt ? new Date(issueForm.expiresAt).toISOString() : undefined
      });
      setRevealedSecret(response.plaintextKey);
      setIssueForm({ name: "", description: "", scopesCsv: "", expiresAt: "" });
      setBanner({ kind: "success", text: "API key issued. Copy secret now; it will not be shown again." });
      await loadAll();
    } catch {
      setError("Failed to issue API key");
    }
  }

  async function onRevokeKey(keyId) {
    if (!window.confirm("Revoke this API key?")) return;
    try {
      await revokeApiManagementKey(api, keyId);
      setBanner({ kind: "info", text: "API key revoked." });
      await loadAll();
    } catch {
      setError("Failed to revoke API key");
    }
  }

  async function onRegenerateKey(keyId) {
    if (!window.confirm("Regenerate this key? Existing key will be revoked and a new secret will be issued.")) return;
    try {
      const response = await regenerateApiManagementKey(api, keyId);
      setRevealedSecret(response.plaintextKey);
      setBanner({ kind: "success", text: "API key regenerated. Copy the new secret now." });
      await loadAll();
    } catch {
      setError("Failed to regenerate API key");
    }
  }

  async function onToggleEvents(keyId) {
    if (expandedKeyId === keyId) {
      setExpandedKeyId(null);
      return;
    }
    setExpandedKeyId(keyId);
    if (!eventsByKey[keyId]) {
      try {
        const events = await listApiManagementKeyEvents(api, keyId);
        setEventsByKey((prev) => ({ ...prev, [keyId]: events }));
      } catch {
        setError("Failed to load key audit events");
      }
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb title="API Management" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "API Management" }]} />

      {insights ? (
        <Card className="industrial-card">
          <CardContent className="p-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Total</span>
              <span className="ml-2 font-bold">{insights.counts.totalKeys}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Active</span>
              <span className="ml-2 font-bold">{insights.counts.activeKeys}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Revoked</span>
              <span className="ml-2 font-bold">{insights.counts.revokedKeys}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Expiring in 30 days</span>
              <span className="ml-2 font-bold">{insights.counts.expiringSoon}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {banner ? (
        <div
          className={`flex items-center gap-2 text-sm rounded-sm px-3 py-2 border ${
            banner.kind === "success"
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : banner.kind === "error"
                ? "text-destructive bg-destructive/10 border-destructive/20"
                : "text-blue-400 bg-blue-500/10 border-blue-500/20"
          }`}
        >
          {banner.kind === "success" ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
          {banner.text}
        </div>
      ) : null}

      {revealedSecret ? (
        <Card className="bg-zinc-900 border-primary/30">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">New API Secret</span>
            <code className="block mt-1 font-mono text-sm break-all">{revealedSecret}</code>
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
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Issue API Key</h3>
          <form onSubmit={onIssueKey} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Key Name</Label>
              <Input
                placeholder="Key name"
                value={issueForm.name}
                onChange={(event) => setIssueForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Description (optional)</Label>
              <Input
                placeholder="Description (optional)"
                value={issueForm.description}
                onChange={(event) => setIssueForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Scopes</Label>
              <Input
                placeholder="Scopes CSV (example: orders:read,orders:write)"
                value={issueForm.scopesCsv}
                onChange={(event) => setIssueForm((prev) => ({ ...prev, scopesCsv: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold">Expires At (optional)</Label>
              <Input
                type="datetime-local"
                value={issueForm.expiresAt}
                onChange={(event) => setIssueForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
              />
            </div>
            <Button type="submit" className="font-bold uppercase tracking-wider">
              <Plus className="w-4 h-4" /> Issue Key
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <span className="font-display font-bold uppercase tracking-tight">Keys</span>
        <Badge variant="secondary">Active: {activeKeys.length}</Badge>
      </div>

      {keys.length === 0 ? (
        <Card className="industrial-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No API keys found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key._id} className={`industrial-card ${expandedKeyId === key._id ? "border-primary/30 bg-primary/5" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      {key.name}
                      <Badge variant="outline">{key.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <code className="font-mono text-xs">{key.keyPrefix}***{key.keyLast4}</code>
                      {key.expiresAt ? (
                        <span className="ml-2">expires {new Date(key.expiresAt).toLocaleString()}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {key.status === "active" ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => onRevokeKey(key._id)}>
                        <ShieldOff className="w-4 h-4" /> Revoke
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onRegenerateKey(key._id)}>
                        <RefreshCw className="w-4 h-4" /> Regenerate
                      </Button>
                    </>
                  ) : null}
                  <Button variant="outline" size="sm" onClick={() => onToggleEvents(key._id)}>
                    <ClipboardList className="w-4 h-4" />
                    {expandedKeyId === key._id ? "Hide Audit" : "View Audit"}
                    {expandedKeyId === key._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
                {expandedKeyId === key._id ? (
                  <div className="mt-3 border-t border-border pt-3 space-y-2">
                    {(eventsByKey[key._id] ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No audit events yet.</p>
                    ) : (
                      (eventsByKey[key._id] ?? []).map((event) => (
                        <div key={event._id} className="p-2 rounded-sm bg-muted text-sm">
                          <span className="font-bold">{event.action}</span>
                          <span className="text-muted-foreground"> by {event.actorUserId}</span>
                          <span className="text-muted-foreground"> at{" "}
                            {event.createdAt ? new Date(event.createdAt).toLocaleString() : "unknown time"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
