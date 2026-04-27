import { Card, CardContent } from "../ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import CountUp from "react-countup";

export function StatCard({ title, value, icon: Icon, color = "primary", subtitle, prefix = "" }) {
  return (
    <Card className="industrial-card stat-card-accent">
      <CardContent className="p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{title}</p>
        <div className="flex items-center justify-between">
          <p className="font-display text-2xl lg:text-3xl font-bold">
            {prefix}
            <CountUp end={value} separator="," duration={2} />
          </p>
          <div className={`p-2.5 bg-${color}/10 rounded-sm border border-${color}/20`}>
            <Icon className={`w-5 h-5 text-${color}`} />
          </div>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
