import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function Error404Page() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <AlertTriangle className="h-16 w-16 text-muted-foreground/40 mb-2" />
      <p className="text-[120px] font-display font-bold text-primary/20 leading-none select-none">
        404
      </p>
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight mt-2">
        {t("page_not_found")}
      </h1>
      <p className="text-muted-foreground max-w-md text-center mt-3">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3 mt-8">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            {t("go_home")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
