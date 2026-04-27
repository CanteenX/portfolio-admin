import { useState } from "react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Search } from "lucide-react";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Pages" },
  { label: "Search Results" },
];

const SEARCH_RESULTS = [
  { title: "Admin Platform - Dashboard Overview", url: "https://admin-platform.io/docs/dashboard", snippet: "The Admin Platform dashboard provides a comprehensive overview of your system metrics, user activity, and module performance in a single unified view." },
  { title: "Getting Started with Admin Platform", url: "https://admin-platform.io/docs/getting-started", snippet: "Learn how to set up your Admin Platform instance, configure modules, and invite team members. This guide covers everything from initial setup to advanced configuration." },
  { title: "Admin Platform API Reference", url: "https://admin-platform.io/api/reference", snippet: "Complete API documentation for Admin Platform REST endpoints. Includes authentication, module management, user operations, and webhook configuration." },
  { title: "Role-Based Access Control Guide", url: "https://admin-platform.io/docs/rbac", snippet: "Understand how to configure roles and permissions in Admin Platform. Set up custom roles, define module-level access, and manage user groups effectively." },
  { title: "Admin Platform Changelog v3.0", url: "https://admin-platform.io/changelog/v3", snippet: "Explore the latest features in Admin Platform v3.0 including AI-powered insights, automated workflows, enhanced plugin ecosystem, and performance improvements." },
];

const IMAGE_GRADIENTS = [
  "from-blue-400 to-indigo-500", "from-green-400 to-teal-500",
  "from-purple-400 to-pink-500", "from-orange-400 to-red-500",
  "from-cyan-400 to-blue-500", "from-yellow-400 to-orange-500",
  "from-pink-400 to-rose-500", "from-teal-400 to-emerald-500",
  "from-indigo-400 to-violet-500", "from-red-400 to-pink-500",
  "from-lime-400 to-green-500", "from-amber-400 to-yellow-500",
];

const NEWS_ITEMS = [
  { date: "Apr 10, 2026", title: "Admin Platform Launches AI-Powered Analytics", snippet: "The latest update introduces machine learning-driven analytics that automatically surface insights and anomalies in your admin data." },
  { date: "Apr 5, 2026", title: "New Integration Marketplace Now Available", snippet: "Browse and install from over 200 third-party integrations directly from your Admin Platform dashboard with one-click setup." },
  { date: "Mar 28, 2026", title: "Admin Platform Named Top SaaS Tool of 2026", snippet: "Industry analysts recognize Admin Platform for its innovative approach to enterprise administration, citing ease of use and extensibility." },
];

export default function SearchResultsPage() {
  const [query, setQuery] = useState("Admin Platform");
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div>
      <Breadcrumb title="Search Results" items={BREADCRUMB_ITEMS} />

      <div className="flex gap-2 mb-4 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            placeholder="Search..."
          />
        </div>
        <Button>Search</Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">About 24 results found</p>

      <div className="flex gap-2 mb-6">
        {["all", "images", "news"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {activeTab === "all" && (
        <div className="space-y-4 max-w-3xl">
          {SEARCH_RESULTS.map((result) => (
            <div key={result.title} className="group">
              <a href="#" className="text-primary hover:underline font-medium">{result.title}</a>
              <p className="text-xs text-green-600 dark:text-green-400">{result.url}</p>
              <p className="text-sm text-muted-foreground mt-1">{result.snippet}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === "images" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {IMAGE_GRADIENTS.map((gradient, i) => (
            <div
              key={gradient}
              className={`h-32 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity`}
            >
              <span className="text-white/80 text-2xl font-bold">{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "news" && (
        <div className="space-y-4 max-w-3xl">
          {NEWS_ITEMS.map((item) => (
            <Card key={item.title}>
              <CardContent className="p-4">
                <span className="text-xs text-muted-foreground">{item.date}</span>
                <h4 className="font-bold mt-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.snippet}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
