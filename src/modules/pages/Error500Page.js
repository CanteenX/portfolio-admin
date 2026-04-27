import { Link } from "react-router-dom";
import { ServerCrash, Home, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function Error500Page() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <ServerCrash className="h-16 w-16 text-muted-foreground/40 mb-2" />
      <p className="text-[120px] font-display font-bold text-destructive/20 leading-none select-none">
        500
      </p>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight mt-2">
        Internal Server Error
      </h1>
      <p className="text-muted-foreground max-w-md text-center mt-3">
        Something went wrong on our end. Please try again later.
      </p>
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
