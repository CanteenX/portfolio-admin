import { useState } from "react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Check } from "lucide-react";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Pages" },
  { label: "Pricing" },
];

const PLANS = [
  {
    name: "Starter",
    monthly: "Free",
    yearly: "Free",
    popular: false,
    features: ["1 User", "5 Modules", "100MB Storage", "Email Support"],
    cta: "Get Started",
  },
  {
    name: "Professional",
    monthly: "$19/mo",
    yearly: "$190/yr",
    popular: true,
    features: ["5 Users", "All Modules", "5GB Storage", "Priority Support", "API Access"],
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    monthly: "$49/mo",
    yearly: "$490/yr",
    popular: false,
    features: ["Unlimited Users", "All Modules", "50GB Storage", "24/7 Support", "API Access", "Custom Branding"],
    cta: "Contact Sales",
  },
  {
    name: "Custom",
    monthly: "Contact",
    yearly: "Contact",
    popular: false,
    features: [
      "Everything in Enterprise",
      "Dedicated Server",
      "SLA",
      "Custom Development",
    ],
    cta: "Get a Quote",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div>
      <Breadcrumb title="Pricing" items={BREADCRUMB_ITEMS} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Simple, transparent pricing</h2>
        <p className="text-muted-foreground mb-6">Choose the plan that fits your needs</p>
        <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${
              plan.popular ? "border-primary ring-2 ring-primary/20" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <p className="text-3xl font-bold mt-2">
                {isYearly ? plan.yearly : plan.monthly}
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
