import { Wrench } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Wrench className="h-20 w-20 text-muted-foreground/40 mb-6" />
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
        Under Maintenance
      </h1>
      <p className="text-muted-foreground max-w-md text-center mt-3">
        We're performing scheduled maintenance. We'll be back shortly.
      </p>
      <p className="text-sm text-muted-foreground mt-4">
        Expected to be back by <span className="font-semibold text-foreground">5:00 PM UTC</span>
      </p>
      <Button variant="outline" className="mt-8" asChild>
        <a href="https://status.adminplatform.com" target="_blank" rel="noopener noreferrer">
          Go to Status Page
        </a>
      </Button>
      <p className="text-xs text-muted-foreground mt-6">
        Need urgent help? Email{" "}
        <a href="mailto:support@adminplatform.com" className="underline text-primary">
          support@adminplatform.com
        </a>
      </p>
    </div>
  );
}
