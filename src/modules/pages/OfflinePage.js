import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <WifiOff className="h-20 w-20 text-muted-foreground/40 mb-6" />
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
        You're Offline
      </h1>
      <p className="text-muted-foreground max-w-md text-center mt-3">
        Please check your internet connection and try again.
      </p>
      <Button className="mt-8" onClick={() => window.location.reload()}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}
