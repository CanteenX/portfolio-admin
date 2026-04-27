import { useState } from "react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Pages" },
  { label: "Gallery" },
];

const CATEGORIES = ["All", "Nature", "Business", "Design", "Technology"];

const GRADIENTS = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-emerald-600",
  "from-purple-400 to-purple-600",
  "from-orange-400 to-red-500",
  "from-cyan-400 to-teal-600",
  "from-pink-400 to-rose-600",
  "from-indigo-400 to-indigo-600",
  "from-amber-400 to-orange-600",
  "from-teal-400 to-cyan-600",
  "from-red-400 to-pink-600",
  "from-violet-400 to-purple-600",
  "from-lime-400 to-green-600",
];

const GALLERY_ITEMS = [
  { id: 1, title: "Mountain Sunrise", category: "Nature" },
  { id: 2, title: "Office Space", category: "Business" },
  { id: 3, title: "UI Components", category: "Design" },
  { id: 4, title: "Server Room", category: "Technology" },
  { id: 5, title: "Forest Path", category: "Nature" },
  { id: 6, title: "Team Meeting", category: "Business" },
  { id: 7, title: "Color Palette", category: "Design" },
  { id: 8, title: "Circuit Board", category: "Technology" },
  { id: 9, title: "Ocean Waves", category: "Nature" },
  { id: 10, title: "Analytics Dashboard", category: "Business" },
  { id: 11, title: "Typography Set", category: "Design" },
  { id: 12, title: "Code Editor", category: "Technology" },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div>
      <Breadcrumb title="Gallery" items={BREADCRUMB_ITEMS} />

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="overflow-hidden group cursor-pointer">
            <div
              className={`h-48 bg-gradient-to-br ${GRADIENTS[(item.id - 1) % GRADIENTS.length]} flex items-center justify-center transition-transform group-hover:scale-105`}
            >
              <span className="text-white/80 text-5xl font-bold">{item.id}</span>
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{item.title}</h4>
                <Badge variant="secondary" className="text-xs">{item.category}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
