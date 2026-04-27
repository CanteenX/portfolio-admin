import { Link } from "react-router-dom";
import { CoverAuthLayout } from "./CoverAuthLayout";
import { Button } from "../../components/ui/button";
import { CheckCircle } from "lucide-react";

export function SuccessMessagePage() {
  return (
    <CoverAuthLayout>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-green-500/10">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight uppercase mb-2">
          Well Done!
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Your account has been created successfully.
        </p>
        <div className="space-y-3">
          <Button asChild className="w-full font-bold uppercase tracking-wider">
            <Link to="/">Go to Dashboard</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline font-medium">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </CoverAuthLayout>
  );
}
