import { useEffect, useState } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { getSystemSettings, updateSystemSettings } from "@admin-platform/shared-sdk";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Settings, Loader2, Check, AlertCircle } from "lucide-react";

export default function SystemSettingsPage() {
  const { api, session } = useAuth();
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) return;
    getSystemSettings(api)
      .then((s) => { setSettings(s); setDraft(s); })
      .catch(() => setError("Failed to load system settings"))
      .finally(() => setLoading(false));
  }, [api]);

  if (session?.user?.role !== "super_admin") {
    return <div className="text-destructive p-6">Access denied. Super admin only.</div>;
  }
  if (loading) return (
    <div className="space-y-4 max-w-lg">
      <Skeleton className="h-10" />
      <Skeleton className="h-10" />
      <Skeleton className="h-10" />
    </div>
  );
  if (error && !draft) return (
    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-4 py-3 max-w-lg">
      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
    </div>
  );
  if (!draft || !settings) return null;

  const hasChanges =
    draft.timezone !== settings.timezone ||
    draft.defaultCurrency !== settings.defaultCurrency ||
    draft.locale !== settings.locale;

  const handleSave = async () => {
    if (!api) return;
    setSaving(true); setSaved(false); setError("");
    try {
      const updated = await updateSystemSettings(api, draft);
      setSettings(updated); setDraft(updated); setSaved(true);
    } catch { setError("Failed to save settings"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg space-y-6">
      <Breadcrumb title="System Settings" items={[{ label: "Home", path: "/" }, { label: "Settings" }, { label: "System" }]} />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <Card className="industrial-card">
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="uppercase tracking-wider text-xs font-bold">Timezone</Label>
            <Input
              value={draft.timezone}
              onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
              placeholder="e.g. UTC, America/New_York"
            />
          </div>
          <div className="space-y-2">
            <Label className="uppercase tracking-wider text-xs font-bold">Default Currency</Label>
            <Input
              value={draft.defaultCurrency}
              onChange={(e) => setDraft({ ...draft, defaultCurrency: e.target.value.toUpperCase().slice(0, 3) })}
              placeholder="e.g. USD, EUR, INR"
              maxLength={3}
              className="max-w-32 font-mono uppercase"
            />
          </div>
          <div className="space-y-2">
            <Label className="uppercase tracking-wider text-xs font-bold">Locale</Label>
            <Input
              value={draft.locale}
              onChange={(e) => setDraft({ ...draft, locale: e.target.value })}
              placeholder="e.g. en-US, fr-FR"
              className="max-w-40 font-mono"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={!hasChanges || saving} className="font-bold uppercase tracking-wider">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save"}
            </Button>
            {saved && <span className="text-sm text-success flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span>}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        These settings apply to all users in this tenant.
      </p>
    </div>
  );
}
