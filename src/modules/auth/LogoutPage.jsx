import { Link } from "react-router-dom";
import { CoverAuthLayout } from "./CoverAuthLayout";
import { Button } from "../../components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutPage() {
  return (
    <CoverAuthLayout>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            <LogOut className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight uppercase mb-2">
          You've Been Logged Out
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Thank you for using Admin Platform
        </p>
        <div className="space-y-3">
          <Button asChild className="w-full font-bold uppercase tracking-wider">
            <Link to="/login">Sign In Again</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            <Link to="/" className="text-primary hover:underline font-medium">
              Go to Home
            </Link>
          </p>
        </div>
      </div>
    </CoverAuthLayout>
  );
}
