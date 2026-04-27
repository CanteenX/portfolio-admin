import { useEffect, useState } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { getUIFeatureFlags, updateUIFeatureFlags } from "@admin-platform/shared-sdk";
import { UI_FEATURE_FLAG_KEYS } from "@admin-platform/shared-types";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * Groups flag keys by their category prefix (e.g. "header", "layout", "sidebar").
 * @param {readonly string[]} keys
 * @returns {Record<string, string[]>}
 */
function groupByCategory(keys) {
  const groups = {};
  for (const key of keys) {
    const dotIndex = key.indexOf(".");
    const category = dotIndex > -1 ? key.slice(0, dotIndex) : "other";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category] = [...groups[category], key];
  }
  return groups;
}

/**
 * Formats a category key into a display label.
 * @param {string} category
 * @returns {string}
 */
function formatCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Formats a flag key into a readable label.
 * @param {string} key
 * @returns {string}
 */
function formatFlagLabel(key) {
  const dotIndex = key.indexOf(".");
  const name = dotIndex > -1 ? key.slice(dotIndex + 1) : key;
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export default function UIFeatureFlagsPage() {
  const { api, session } = useAuth();
  const [flags, setFlags] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!api) return;
    getUIFeatureFlags(api)
      .then((data) => {
        setFlags(data);
        setDraft(data);
      })
      .catch(() => setError("Failed to load feature flags"))
      .finally(() => setLoading(false));
  }, [api]);

  if (session?.user?.role !== "super_admin") {
    return <div className="text-destructive p-6">Access denied. Super admin only.</div>;
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-10" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive p-6">{error}</div>;
  }

  if (!draft || !flags) return null;

  const groups = groupByCategory(UI_FEATURE_FLAG_KEYS);
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(flags);

  const handleToggle = (key) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!api) return;
    setSaving(true);
    try {
      const updated = await updateUIFeatureFlags(api, draft);
      setFlags(updated);
      setDraft(updated);
      toast.success("Feature flags saved successfully");
    } catch {
      toast.error("Failed to save feature flags");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Breadcrumb
        title="Feature Toggles"
        items={[
          { label: "Home", path: "/" },
          { label: "Settings" },
          { label: "Feature Toggles" },
        ]}
      />

      {Object.entries(groups).map(([category, keys]) => (
        <Card key={category} className="industrial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-widest">
              {formatCategory(category)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {keys.map((key) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 px-1 rounded-sm hover:bg-muted/50 transition-colors"
              >
                <label
                  htmlFor={`flag-${key}`}
                  className="text-sm font-medium cursor-pointer select-none"
                >
                  {formatFlagLabel(key)}
                  <span className="ml-2 text-xs text-muted-foreground font-mono">{key}</span>
                </label>
                <button
                  id={`flag-${key}`}
                  type="button"
                  role="switch"
                  aria-checked={draft[key] ?? true}
                  onClick={() => handleToggle(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    ${draft[key] ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform
                      ${draft[key] ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="font-bold uppercase tracking-wider"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        {!hasChanges && flags && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Check className="w-4 h-4" /> Up to date
          </span>
        )}
      </div>
    </div>
  );
}
