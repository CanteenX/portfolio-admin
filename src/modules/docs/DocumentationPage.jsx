import { useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, BookOpen } from "lucide-react";
import DOMPurify from "dompurify";
import { DOC_TABS } from "./docs-content";

export default function DocumentationPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const contentRef = useRef(null);

  const currentTab = DOC_TABS[activeTab];

  const filteredSections = useMemo(() => {
    if (!search.trim()) return currentTab.sections;
    const q = search.toLowerCase();
    return currentTab.sections.filter(
      (s) =>
        s.heading.toLowerCase().includes(q) ||
        s.body.toLowerCase().includes(q)
    );
  }, [currentTab, search]);

  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleTabChange = useCallback((index) => {
    setActiveTab(index);
    setSearch("");
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <BookOpen className="w-5 h-5" />
          <h1 className="text-base font-bold whitespace-nowrap mr-4">
            Admin Platform — User Manual
          </h1>
          <div className="flex-1" />
          <div className="flex items-center bg-white/15 rounded px-3 py-1.5 max-w-[280px] w-full">
            <Search className="w-4 h-4 text-white/60 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search docs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder:text-white/50 outline-none w-full"
            />
          </div>
        </div>

        {/* Section tabs */}
        <div className="bg-black/10 overflow-x-auto">
          <div className="flex min-w-max">
            {DOC_TABS.map((tab, i) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(i)}
                className={`px-4 py-2 text-sm whitespace-nowrap transition-colors border-b-[3px] ${
                  activeTab === i
                    ? "text-white font-bold border-white"
                    : "text-white/60 font-medium border-transparent hover:text-white/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar TOC */}
        <aside className="hidden md:block w-60 flex-shrink-0 border-r border-border overflow-auto py-4">
          <nav>
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="block w-full text-left px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {section.heading}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main
          ref={contentRef}
          className="flex-1 overflow-auto px-4 sm:px-8 md:px-12 py-8 max-w-[900px]"
        >
          <h2 className="text-3xl font-bold mb-2">{currentTab.label}</h2>

          {activeTab === 0 && (
            <p className="text-muted-foreground mb-6">
              Welcome to the user manual for the <strong>Admin Platform</strong>.
            </p>
          )}

          {filteredSections.length === 0 && (
            <p className="text-muted-foreground mt-8">
              No results found for "{search}".
            </p>
          )}

          {filteredSections.map((section) => (
            <SectionBlock key={section.id} section={section} />
          ))}
        </main>
      </div>
    </div>
  );
}

function SectionBlock({ section }) {
  return (
    <div id={section.id} className="mb-10 scroll-mt-[120px]">
      <h3 className="text-xl font-semibold mb-3">{section.heading}</h3>
      {/* SAFETY: section.body contains static HTML from docs-content.js, not user input */}
      <div
        className="docs-content prose prose-sm max-w-none dark:prose-invert
          [&_p]:mb-3 [&_p]:leading-7
          [&_ul]:pl-6 [&_ul]:mb-3 [&_ol]:pl-6 [&_ol]:mb-3
          [&_li]:mb-1 [&_li]:leading-7
          [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.85em] [&_code]:font-mono
          [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-auto [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:mb-3
          [&_table]:w-full [&_table]:border-collapse [&_table]:mb-3
          [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:bg-muted
          [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm
          [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(section.body) }}
      />
    </div>
  );
}
