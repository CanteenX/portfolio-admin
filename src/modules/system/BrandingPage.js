import { useEffect, useState } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { useRbacPagePermissions } from "../../components/common/RequirePermission";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { getBranding, updateBranding } from "@admin-platform/shared-sdk";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Palette, Loader2, Check } from "lucide-react";

export default function BrandingPage() {
  const { api } = useAuth();
  // Branding is delegable: any admin granted `edit` on this screen may change
  // it. Reading is open to admins, so a viewer without the grant still sees
  // the current values — they just cannot save.
  const { edit: canEdit } = useRbacPagePermissions();
  const [branding, setBranding] = useState(null);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) return;
    getBranding(api)
      .then((b) => { setBranding(b); setDraft(b); })
      .catch(() => setError("Failed to load branding"))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) return <div className="space-y-4 max-w-lg"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!draft || !branding) return null;

  const hasChanges = draft.companyName !== branding.companyName || draft.logoUrl !== branding.logoUrl || draft.primaryColor !== branding.primaryColor;

  const handleSave = async () => {
    if (!api) return;
    setSaving(true); setSaved(false);
    try {
      const updated = await updateBranding(api, draft);
      setBranding(updated); setDraft(updated); setSaved(true);
    } catch { setError("Failed to save branding"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg space-y-6">
      <Breadcrumb title="Branding" items={[{ label: "Home", path: "/" }, { label: "Settings" }, { label: "Branding" }]} />
      <Card className="industrial-card">
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="uppercase tracking-wider text-xs font-bold">Company Name</Label>
            <Input disabled={!canEdit} value={draft.companyName} onChange={(e) => setDraft({ ...draft, companyName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="uppercase tracking-wider text-xs font-bold">Logo URL</Label>
            <Input disabled={!canEdit} value={draft.logoUrl} onChange={(e) => setDraft({ ...draft, logoUrl: e.target.value })} placeholder="https://example.com/logo.png" />
            {draft.logoUrl && <img src={draft.logoUrl} alt="Logo preview" className="max-h-16 mt-2 rounded-sm border border-border" />}
          </div>
          <div className="space-y-2">
            <Label className="uppercase tracking-wider text-xs font-bold">Primary Color</Label>
            <div className="flex items-center gap-3">
              <input disabled={!canEdit} type="color" value={draft.primaryColor} onChange={(e) => setDraft({ ...draft, primaryColor: e.target.value })} className="w-10 h-10 rounded-sm border border-border cursor-pointer" />
              <Input disabled={!canEdit} value={draft.primaryColor} onChange={(e) => setDraft({ ...draft, primaryColor: e.target.value })} className="max-w-32 font-mono" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={!canEdit || !hasChanges || saving} className="font-bold uppercase tracking-wider">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save"}
            </Button>
            {saved && <span className="text-sm text-success flex items-center gap-1"><Check className="w-4 h-4" /> Saved!</span>}
            {!canEdit && (
              <span className="text-sm text-muted-foreground">
                View only — ask for edit access on Branding to make changes.
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
