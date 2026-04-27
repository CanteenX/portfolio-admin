import { useState, useEffect } from "react";
import { Rocket } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const TARGET_DATE = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

function computeTimeLeft() {
  const diff = Math.max(0, TARGET_DATE.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBox({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-bold font-display bg-primary/10 rounded-lg w-16 h-16 flex items-center justify-center">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export default function ComingSoonPage() {
  const [timeLeft, setTimeLeft] = useState(computeTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(computeTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Rocket className="h-16 w-16 text-primary/60 mb-4" />
      <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
        Coming Soon
      </h1>
      <p className="text-muted-foreground max-w-md text-center mt-3">
        We're working on something awesome. Stay tuned!
      </p>

      <div className="flex gap-4 mt-8">
        <TimeBox value={timeLeft.days} label="Days" />
        <span className="text-3xl font-bold self-start mt-3">:</span>
        <TimeBox value={timeLeft.hours} label="Hours" />
        <span className="text-3xl font-bold self-start mt-3">:</span>
        <TimeBox value={timeLeft.minutes} label="Min" />
        <span className="text-3xl font-bold self-start mt-3">:</span>
        <TimeBox value={timeLeft.seconds} label="Sec" />
      </div>

      <div className="flex gap-2 mt-10 w-full max-w-sm">
        <Input type="email" placeholder="Enter your email to get notified" className="flex-1" />
        <Button>Subscribe</Button>
      </div>
    </div>
  );
}
