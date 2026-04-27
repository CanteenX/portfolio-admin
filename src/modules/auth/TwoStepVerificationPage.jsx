import { useRef } from "react";
import { Link } from "react-router-dom";
import { CoverAuthLayout } from "./CoverAuthLayout";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ShieldCheck } from "lucide-react";

export function TwoStepVerificationPage() {
  const inputRefs = useRef([]);

  const onSubmit = (e) => {
    e.preventDefault();
  };

  const handleDigitInput = (index, value) => {
    if (value.length > 1) return;
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <CoverAuthLayout>
      <div className="flex justify-center mb-4">
        <div className="p-3 rounded-full bg-primary/10">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h2 className="font-display text-2xl font-bold tracking-tight uppercase text-center mb-2">
        Two-Step Verification
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Enter the 6-digit code sent to your email
      </p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="w-12 h-12 text-center text-lg font-bold"
              onChange={(e) => handleDigitInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>
        <Button type="submit" className="w-full font-bold uppercase tracking-wider">
          Verify
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Didn't receive code?{" "}
        <button type="button" className="text-primary hover:underline font-medium">Resend</button>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        <Link to="/login" className="text-primary hover:underline font-medium">Back to Sign In</Link>
      </p>
    </CoverAuthLayout>
  );
}
