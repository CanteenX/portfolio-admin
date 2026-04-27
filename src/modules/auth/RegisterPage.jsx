import { useState } from "react";
import { Link } from "react-router-dom";
import { CoverAuthLayout } from "./CoverAuthLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Eye, EyeOff, Github } from "lucide-react";

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <CoverAuthLayout>
      <h2 className="font-display text-2xl font-bold tracking-tight uppercase mb-1">
        Create Account
      </h2>
      <p className="text-sm text-muted-foreground mb-6">Sign up to get started</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="uppercase tracking-wider text-xs font-bold">Full Name</Label>
          <Input id="name" placeholder="John Doe" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="uppercase tracking-wider text-xs font-bold">Email</Label>
          <Input id="email" type="email" placeholder="john@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="uppercase tracking-wider text-xs font-bold">Password</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create password" required />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="uppercase tracking-wider text-xs font-bold">Confirm Password</Label>
          <div className="relative">
            <Input id="confirm" type={showConfirm ? "text" : "password"} placeholder="Confirm password" required />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded border-border" required />
          <span>I agree to the <span className="text-primary underline">Terms of Service</span></span>
        </label>
        <Button type="submit" className="w-full font-bold uppercase tracking-wider">Sign Up</Button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 gap-2" type="button">
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          Google
        </Button>
        <Button variant="outline" className="flex-1 gap-2" type="button">
          <Github className="w-4 h-4" /> GitHub
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
      </p>
    </CoverAuthLayout>
  );
}
