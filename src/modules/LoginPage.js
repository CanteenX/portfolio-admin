import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../core/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Layers, Loader2, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function resolveSafeRedirect(rawRedirect) {
    if (!rawRedirect) return "/";
    try {
      const parsed = new URL(rawRedirect, window.location.origin);
      if (parsed.origin !== window.location.origin) return "/";
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return "/";
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      }
      setSubmitting(false);
      return;
    }
    try {
      await login({ email, password });
      const destination = resolveSafeRedirect(searchParams.get("redirect"));
      navigate(destination, { replace: true });
    } catch (err) {
      if (err?.response?.status === 429 || err?.status === 429) {
        setError("Too many login attempts. Please wait and try again.");
      } else {
        setError("Login failed. Check your credentials.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md industrial-card">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-sm bg-primary/10">
              <Layers className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="font-display text-3xl font-bold tracking-tight uppercase">
              Admin Platform
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground uppercase tracking-widest text-xs">
              Sign in to your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="uppercase tracking-wider text-xs font-bold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@admin.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="uppercase tracking-wider text-xs font-bold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <Button type="submit" className="w-full font-bold uppercase tracking-wider" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Seed users available when backend <code className="font-mono text-primary">ENABLE_SEED=true</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
