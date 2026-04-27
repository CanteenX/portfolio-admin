import { useState } from "react";
import { useLayout } from "../../core/layout/LayoutContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { HorizontalLayout } from "./HorizontalLayout";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { ThemeCustomizer } from "./ThemeCustomizer";

export function AppLayout({ children }) {
  const { layoutType, layoutWidth } = useLayout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const boxedClass = layoutWidth === "boxed" ? "max-w-7xl mx-auto w-full" : "";

  if (layoutType === "horizontal") {
    return (
      <>
        <HorizontalLayout>{children}</HorizontalLayout>
        <ThemeCustomizer />
      </>
    );
  }

  if (layoutType === "twocolumn") {
    return (
      <>
        <TwoColumnLayout>{children}</TwoColumnLayout>
        <ThemeCustomizer />
      </>
    );
  }

  // Default vertical layout
  return (
    <>
      <div className="min-h-screen bg-background flex">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header mobileOpen={mobileOpen} onToggleMobile={() => setMobileOpen((o) => !o)} />
          <main className={`flex-1 p-4 lg:p-6 overflow-auto ${boxedClass}`}>
            {children}
          </main>
        </div>
      </div>
      <ThemeCustomizer />
    </>
  );
}
