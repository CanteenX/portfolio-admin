import { useEffect, useState } from "react";
import { useAuth } from "../../core/auth/AuthContext";
import { useRbacPagePermissions } from "../../components/common/RequirePermission";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { getPaymentSettings } from "@admin-platform/shared-sdk";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { CreditCard, Globe, AlertCircle } from "lucide-react";

export default function PaymentSettingsPage() {
  const { api } = useAuth();
  // Delegable read. The payload is configuration status and webhook paths —
  // never keys or secrets — so someone diagnosing a failed checkout does not
  // need the super admin to read this page aloud to them.
  const { read: canRead } = useRbacPagePermissions();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) return;
    getPaymentSettings(api)
      .then(setSettings)
      .catch(() => setError("Failed to load payment settings"))
      .finally(() => setLoading(false));
  }, [api]);

  if (!canRead) {
    return (
      <div className="text-destructive p-6">
        Access denied — you have no read permission for Payments.
      </div>
    );
  }
  if (loading) return (
    <div className="space-y-4 max-w-3xl">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-48" />
      <Skeleton className="h-32" />
    </div>
  );
  if (error) return (
    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-4 py-3 max-w-3xl">
      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
    </div>
  );
  if (!settings) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <Breadcrumb title="Payment Settings" items={[{ label: "Home", path: "/" }, { label: "Settings" }, { label: "Payments" }]} />

      {/* Providers Table */}
      <Card className="industrial-card">
        <CardContent className="p-0">
          <div className="px-6 pt-5 pb-3">
            <h3 className="font-display text-lg font-bold uppercase tracking-tight">Providers</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase tracking-wider text-xs font-bold">Provider</TableHead>
                <TableHead className="uppercase tracking-wider text-xs font-bold">Status</TableHead>
                <TableHead className="uppercase tracking-wider text-xs font-bold">Webhook Path</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.providers.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold">{p.displayName}</TableCell>
                  <TableCell>
                    <Badge variant={p.configured ? "default" : "destructive"} className="text-xs">
                      {p.configured ? "Configured" : "Not configured"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded-sm">{p.webhookPath}</code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Redirect Settings */}
      <Card className="industrial-card">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Redirect Allowlist
          </h3>
          <div className="space-y-3">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Default Success URL</span>
              <div className="mt-1">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded-sm">{settings.defaultSuccessUrl}</code>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Default Cancel URL</span>
              <div className="mt-1">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded-sm">{settings.defaultCancelUrl}</code>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Allowed Redirect Origins</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {settings.allowedRedirectOrigins.map((origin) => (
                  <Badge key={origin} variant="secondary" className="font-mono text-xs">{origin}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PayPal Mode */}
      {settings.paypalMode && (
        <Card className="industrial-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">PayPal Mode</span>
              <Badge variant={settings.paypalMode === "live" ? "default" : "secondary"} className="text-xs">
                {settings.paypalMode}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        Provider credentials are configured via environment variables. Changes require a backend restart.
      </p>
    </div>
  );
}
