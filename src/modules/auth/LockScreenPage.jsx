import { useState } from "react";
import { Link } from "react-router-dom";
import { CoverAuthLayout } from "./CoverAuthLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export function LockScreenPage() {
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <CoverAuthLayout>
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-primary">AD</span>
        </div>
        <h2 className="font-display text-xl font-bold tracking-tight uppercase">
          Welcome Back
        </h2>
        <p className="text-sm text-muted-foreground">admin@example.com</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="uppercase tracking-wider text-xs font-bold">Password</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter password to unlock" required />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full font-bold uppercase tracking-wider">
          Unlock
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Not you?{" "}
        <Link to="/login" className="text-primary hover:underline font-medium">Sign in with different account</Link>
      </p>
    </CoverAuthLayout>
  );
}
