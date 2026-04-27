import { toast } from "sonner";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "UI" },
  { label: "Toasts" },
];

const TOAST_VARIANTS = [
  {
    label: "Success Toast",
    variant: "success",
    message: "Operation completed successfully!",
    description: "Your changes have been saved.",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    label: "Error Toast",
    variant: "error",
    message: "Something went wrong",
    description: "Please try again or contact support.",
    icon: XCircle,
    color: "text-red-500",
  },
  {
    label: "Warning Toast",
    variant: "warning",
    message: "Caution required",
    description: "This action may have unintended effects.",
    icon: AlertTriangle,
    color: "text-yellow-500",
  },
  {
    label: "Info Toast",
    variant: "info",
    message: "Did you know?",
    description: "You can customize toast notifications.",
    icon: Info,
    color: "text-blue-500",
  },
];

function fireToast(variant, message, description) {
  switch (variant) {
    case "success":
      toast.success(message, { description });
      break;
    case "error":
      toast.error(message, { description });
      break;
    case "warning":
      toast.warning(message, { description });
      break;
    case "info":
      toast.info(message, { description });
      break;
    default:
      toast(message, { description });
  }
}

export default function ToastsPage() {
  return (
    <div>
      <Breadcrumb title="Toasts" items={BREADCRUMB_ITEMS} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Toast Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Click the buttons below to trigger different toast notification styles.
              Powered by <span className="font-medium text-foreground">Sonner</span>.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {TOAST_VARIANTS.map((t) => (
                <Button
                  key={t.variant}
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={() => fireToast(t.variant, t.message, t.description)}
                >
                  <t.icon className={`w-4 h-4 ${t.color}`} />
                  {t.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Advanced Toasts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Additional toast patterns with actions, promises, and custom durations.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  toast("Event has been created", {
                    action: { label: "Undo", onClick: () => toast.info("Undo clicked") },
                  })
                }
              >
                Toast with Action
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const promise = new Promise((resolve) => setTimeout(resolve, 2000));
                  toast.promise(promise, {
                    loading: "Loading data...",
                    success: "Data loaded successfully!",
                    error: "Failed to load data",
                  });
                }}
              >
                Promise Toast
              </Button>
              <Button
                variant="outline"
                onClick={() => toast("This will stay for 10 seconds", { duration: 10000 })}
              >
                Long Duration Toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
