import { useState } from "react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Input } from "../../components/ui/input";
import { ChevronDown, Search } from "lucide-react";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Pages" },
  { label: "FAQ" },
];

const FAQ_DATA = {
  General: [
    { q: "What is Admin Platform?", a: "Admin Platform is a comprehensive administration dashboard that provides tools for managing users, modules, and business operations. It comes with built-in support for multiple modules including CRM, support tickets, and project management." },
    { q: "How do I get started?", a: "Getting started is easy. Simply create an account, choose your plan, and configure the modules you need. Our onboarding wizard will guide you through the initial setup process in just a few minutes." },
    { q: "Is there a free trial?", a: "Yes, we offer a 14-day free trial on all paid plans. No credit card is required to start your trial, and you can upgrade or cancel at any time during the trial period." },
    { q: "What payment methods are accepted?", a: "We accept all major credit cards including Visa, MasterCard, and American Express. We also support payments via PayPal, bank transfers, and invoicing for enterprise customers." },
  ],
  Technical: [
    { q: "What technologies does it use?", a: "Admin Platform is built with React for the frontend, Node.js with Express for the backend, and MongoDB for data storage. It uses modern tooling including Tailwind CSS for styling and JWT for authentication." },
    { q: "Can I self-host?", a: "Yes, self-hosting is available on Enterprise and Custom plans. We provide Docker images and comprehensive deployment documentation for popular cloud platforms including AWS, GCP, and Azure." },
    { q: "How do I integrate with my API?", a: "We provide a RESTful API with comprehensive documentation. You can integrate using our official SDK available for JavaScript, Python, and Go. API access is included in Professional plans and above." },
    { q: "What about data security?", a: "Security is our top priority. All data is encrypted at rest and in transit using AES-256 and TLS 1.3. We perform regular security audits and are SOC 2 Type II compliant." },
  ],
  Billing: [
    { q: "How does billing work?", a: "Billing is handled on a monthly or yearly basis depending on your chosen plan. Invoices are generated automatically at the start of each billing cycle and sent to your registered email address." },
    { q: "Can I upgrade or downgrade?", a: "Absolutely. You can change your plan at any time from the billing settings page. When upgrading, the price difference is prorated. When downgrading, the new rate applies at the next billing cycle." },
    { q: "What is the refund policy?", a: "We offer a full refund within the first 30 days of your subscription. After that, you can cancel at any time and your access will continue until the end of the current billing period." },
    { q: "Do you offer discounts?", a: "Yes, we offer a 15% discount on yearly plans. We also provide special pricing for startups, non-profits, and educational institutions. Contact our sales team for more details." },
  ],
};

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-4 pb-3 text-sm text-muted-foreground">{answer}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [search, setSearch] = useState("");

  const filteredData = Object.entries(FAQ_DATA).reduce((acc, [category, items]) => {
    const filtered = items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length > 0) {
      return { ...acc, [category]: filtered };
    }
    return acc;
  }, {});

  return (
    <div>
      <Breadcrumb title="FAQ" items={BREADCRUMB_ITEMS} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
        <p className="text-muted-foreground mb-6">Find answers to common questions about Admin Platform</p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {Object.entries(filteredData).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-lg font-bold mb-4">{category}</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <AccordionItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        ))}
        {Object.keys(filteredData).length === 0 && (
          <p className="text-center text-muted-foreground">No results found for "{search}"</p>
        )}
      </div>
    </div>
  );
}
