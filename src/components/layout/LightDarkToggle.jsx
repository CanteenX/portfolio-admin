import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "../../core/theme/ThemeContext";

export default function LightDarkToggle() {
  const { mode, toggleMode } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMode}
      className="text-muted-foreground hover:text-foreground h-9 w-9"
      aria-label="Toggle theme"
    >
      {mode === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
}
