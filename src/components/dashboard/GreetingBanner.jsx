export function GreetingBanner({ userName }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {greeting}, {userName || "Admin"}
        </h1>
        <p className="text-sm text-muted-foreground">{dateStr}</p>
      </div>
    </div>
  );
}
