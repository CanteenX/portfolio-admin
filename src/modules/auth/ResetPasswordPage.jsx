import { useState } from "react";
import { Link } from "react-router-dom";
import { CoverAuthLayout } from "./CoverAuthLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <CoverAuthLayout>
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-primary/10">
          <KeyRound className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h2 className="font-display text-2xl font-bold tracking-tight uppercase text-center mb-2">
        Reset Password
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Enter your new password below
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="uppercase tracking-wider text-xs font-bold">New Password</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter new password" required />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="uppercase tracking-wider text-xs font-bold">Confirm Password</Label>
          <div className="relative">
            <Input id="confirm" type={showConfirm ? "text" : "password"} placeholder="Confirm new password" required />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full font-bold uppercase tracking-wider">
          Reset Password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/login" className="text-primary hover:underline font-medium">Back to Sign In</Link>
      </p>
    </CoverAuthLayout>
  );
}
