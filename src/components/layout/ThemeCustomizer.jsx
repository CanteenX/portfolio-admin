import { useState, useCallback } from "react";
import { useLayout } from "../../core/layout/LayoutContext";
import { useTheme } from "../../core/theme/ThemeContext";
import { FeatureGate } from "../common/FeatureGate";
import { Button } from "../ui/button";
import { Settings, X, Sun, Moon } from "lucide-react";

const LAYOUT_OPTIONS = [
  { value: "vertical", label: "Vertical" },
  { value: "horizontal", label: "Horizontal" },
  { value: "twocolumn", label: "Two Column" },
];

const WIDTH_OPTIONS = [
  { value: "fluid", label: "Fluid" },
  { value: "boxed", label: "Boxed" },
];

const SIDEBAR_THEME_OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "gradient", label: "Gradient" },
];

const SIDEBAR_SIZE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "compact", label: "Compact" },
  { value: "small-icon", label: "Small Icon" },
  { value: "small-hover", label: "Small Hover" },
];

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const {
    layoutType, sidebarTheme, sidebarSize, layoutWidth,
    setLayoutType, setSidebarTheme, setSidebarSize, setLayoutWidth,
  } = useLayout();
  const { mode, toggleMode } = useTheme();

  const toggle = useCallback(() => setOpen((o) => !o), []);

  const showSidebarOptions = layoutType !== "horizontal";

  return (
    <FeatureGate flagKey="header.themeCustomizer">
      {/* Floating gear button */}
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-[60] w-11 h-11 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-transform hover:rotate-90 duration-300"
        aria-label="Open theme customizer"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-[70]" onClick={toggle} />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[80] w-80 bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
          <h2 className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
            Theme Customizer
          </h2>
          <Button variant="ghost" size="icon" onClick={toggle} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Color Scheme */}
          <OptionSection title="Color Scheme">
            <div className="flex gap-2">
              <OptionButton
                active={mode === "light"}
                onClick={mode === "dark" ? toggleMode : undefined}
                icon={<Sun className="w-4 h-4" />}
                label="Light"
              />
              <OptionButton
                active={mode === "dark"}
                onClick={mode === "light" ? toggleMode : undefined}
                icon={<Moon className="w-4 h-4" />}
                label="Dark"
              />
            </div>
          </OptionSection>

          {/* Layout Type */}
          <OptionSection title="Layout Type">
            <div className="grid grid-cols-3 gap-2">
              {LAYOUT_OPTIONS.map((opt) => {
                if (opt.value === "horizontal") {
                  return (
                    <FeatureGate key={opt.value} flagKey="layout.horizontalOption">
                      <OptionButton
                        active={layoutType === opt.value}
                        onClick={() => setLayoutType(opt.value)}
                        label={opt.label}
                      />
                    </FeatureGate>
                  );
                }
                if (opt.value === "twocolumn") {
                  return (
                    <FeatureGate key={opt.value} flagKey="layout.twoColumnOption">
                      <OptionButton
                        active={layoutType === opt.value}
                        onClick={() => setLayoutType(opt.value)}
                        label={opt.label}
                      />
                    </FeatureGate>
                  );
                }
                return (
                  <OptionButton
                    key={opt.value}
                    active={layoutType === opt.value}
                    onClick={() => setLayoutType(opt.value)}
                    label={opt.label}
                  />
                );
              })}
            </div>
          </OptionSection>

          {/* Layout Width */}
          <OptionSection title="Layout Width">
            <div className="grid grid-cols-2 gap-2">
              {WIDTH_OPTIONS.map((opt) => (
                <OptionButton
                  key={opt.value}
                  active={layoutWidth === opt.value}
                  onClick={() => setLayoutWidth(opt.value)}
                  label={opt.label}
                />
              ))}
            </div>
          </OptionSection>

          {/* Sidebar Theme (only for vertical/twocolumn) */}
          {showSidebarOptions && (
            <FeatureGate flagKey="layout.sidebarThemes">
              <OptionSection title="Sidebar Theme">
                <div className="grid grid-cols-3 gap-2">
                  {SIDEBAR_THEME_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      active={sidebarTheme === opt.value}
                      onClick={() => setSidebarTheme(opt.value)}
                      label={opt.label}
                    />
                  ))}
                </div>
              </OptionSection>
            </FeatureGate>
          )}

          {/* Sidebar Size (only for vertical) */}
          {layoutType === "vertical" && (
            <FeatureGate flagKey="layout.sidebarSizes">
              <OptionSection title="Sidebar Size">
                <div className="grid grid-cols-2 gap-2">
                  {SIDEBAR_SIZE_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      active={sidebarSize === opt.value}
                      onClick={() => setSidebarSize(opt.value)}
                      label={opt.label}
                    />
                  ))}
                </div>
              </OptionSection>
            </FeatureGate>
          )}
        </div>
      </div>
    </FeatureGate>
  );
}

function OptionSection({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function OptionButton({ active, onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider border transition-colors
        ${active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
