import { useState } from "react";
import { Check } from "lucide-react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Forms" },
  { label: "Wizard" },
];

const STEPS = ["Personal Info", "Address", "Payment", "Review"];

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany",
  "France", "India", "Japan", "Brazil", "Mexico",
];

const INITIAL_DATA = {
  name: "", email: "", phone: "",
  street: "", city: "", state: "", zip: "", country: "",
  cardNumber: "", expiry: "", cvv: "", cardHolder: "",
};

function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, i) => {
        const completed = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                  ${completed ? "bg-green-500 border-green-500 text-white" : ""}
                  ${active ? "bg-primary border-primary text-primary-foreground" : ""}
                  ${!completed && !active ? "border-border text-muted-foreground bg-muted" : ""}`}
              >
                {completed ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium hidden sm:block ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-2 ${completed ? "bg-green-500" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function PersonalInfoStep({ data, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="wiz-name">Full Name</Label>
        <Input id="wiz-name" value={data.name} onChange={(e) => onChange("name", e.target.value)} placeholder="John Doe" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="wiz-email">Email</Label>
        <Input id="wiz-email" type="email" value={data.email} onChange={(e) => onChange("email", e.target.value)} placeholder="john@example.com" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="wiz-phone">Phone</Label>
        <Input id="wiz-phone" type="tel" value={data.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="+1 (555) 123-4567" className="mt-1" />
      </div>
    </div>
  );
}

function AddressStep({ data, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="wiz-street">Street</Label>
        <Input id="wiz-street" value={data.street} onChange={(e) => onChange("street", e.target.value)} placeholder="123 Main St" className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="wiz-city">City</Label>
          <Input id="wiz-city" value={data.city} onChange={(e) => onChange("city", e.target.value)} placeholder="New York" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="wiz-state">State / Province</Label>
          <Input id="wiz-state" value={data.state} onChange={(e) => onChange("state", e.target.value)} placeholder="NY" className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="wiz-zip">Zip Code</Label>
          <Input id="wiz-zip" value={data.zip} onChange={(e) => onChange("zip", e.target.value)} placeholder="10001" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="wiz-country">Country</Label>
          <select
            id="wiz-country"
            value={data.country}
            onChange={(e) => onChange("country", e.target.value)}
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select country</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function PaymentStep({ data, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="wiz-card">Card Number</Label>
        <Input id="wiz-card" value={data.cardNumber} onChange={(e) => onChange("cardNumber", e.target.value)} placeholder="4111 1111 1111 1111" className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="wiz-expiry">Expiry</Label>
          <Input id="wiz-expiry" value={data.expiry} onChange={(e) => onChange("expiry", e.target.value)} placeholder="MM/YY" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="wiz-cvv">CVV</Label>
          <Input id="wiz-cvv" value={data.cvv} onChange={(e) => onChange("cvv", e.target.value)} placeholder="123" className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="wiz-holder">Cardholder Name</Label>
        <Input id="wiz-holder" value={data.cardHolder} onChange={(e) => onChange("cardHolder", e.target.value)} placeholder="John Doe" className="mt-1" />
      </div>
    </div>
  );
}

function ReviewStep({ data }) {
  const sections = [
    { title: "Personal Info", fields: [["Name", data.name], ["Email", data.email], ["Phone", data.phone]] },
    { title: "Address", fields: [["Street", data.street], ["City", data.city], ["State", data.state], ["Zip", data.zip], ["Country", data.country]] },
    { title: "Payment", fields: [["Card Number", data.cardNumber ? `**** **** **** ${data.cardNumber.slice(-4)}` : ""], ["Expiry", data.expiry], ["Cardholder", data.cardHolder]] },
  ];

  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <div key={s.title} className="p-4 rounded-lg bg-muted/50 border border-border">
          <h4 className="font-semibold text-sm mb-2">{s.title}</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {s.fields.map(([label, value]) => (
              <div key={label} className="flex justify-between py-0.5">
                <span className="text-muted-foreground">{label}:</span>
                <span className="font-medium">{value || "-"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FormWizardPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(INITIAL_DATA);
  const [completed, setCompleted] = useState(false);

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    setCompleted(true);
  };

  if (completed) {
    return (
      <div>
        <Breadcrumb title="Form Wizard" items={BREADCRUMB_ITEMS} />
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Submission Successful!</h3>
            <p className="text-muted-foreground mb-6">Your form has been submitted successfully.</p>
            <Button onClick={() => { setCompleted(false); setStep(0); setData(INITIAL_DATA); }}>
              Start Over
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb title="Form Wizard" items={BREADCRUMB_ITEMS} />
      <Card>
        <CardContent className="pt-6">
          <StepIndicator current={step} steps={STEPS} />
          <div className="max-w-lg mx-auto">
            {step === 0 && <PersonalInfoStep data={data} onChange={handleChange} />}
            {step === 1 && <AddressStep data={data} onChange={handleChange} />}
            {step === 2 && <PaymentStep data={data} onChange={handleChange} />}
            {step === 3 && <ReviewStep data={data} />}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handlePrev} disabled={step === 0}>
                Previous
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button onClick={handleSubmit}>Submit</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
