import { Link } from "react-router-dom";
import { CoverAuthLayout } from "./CoverAuthLayout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Mail } from "lucide-react";

export function ForgotPasswordPage() {
  const onSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <CoverAuthLayout>
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-primary/10">
          <Mail className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h2 className="font-display text-2xl font-bold tracking-tight uppercase text-center mb-2">
        Forgot Password?
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Enter your email and we'll send you a reset link
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="uppercase tracking-wider text-xs font-bold">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" required />
        </div>
        <Button type="submit" className="w-full font-bold uppercase tracking-wider">
          Send Reset Link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
      </p>
    </CoverAuthLayout>
  );
}
