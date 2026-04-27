import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Pages" },
  { label: "Timeline" },
];

const TIMELINE_EVENTS = [
  { date: "15 Jan 2023", title: "Company Founded", description: "Admin Platform was established with the vision of creating the most developer-friendly admin dashboard.", tag: "Milestone", color: "bg-blue-500" },
  { date: "10 Mar 2023", title: "First Beta Release", description: "Launched the first beta version with core modules including user management and support tickets.", tag: "Release", color: "bg-green-500" },
  { date: "25 Jun 2023", title: "First 100 Users", description: "Reached the milestone of 100 active users on the platform within the first six months of beta testing.", tag: "Milestone", color: "bg-purple-500" },
  { date: "12 Sep 2023", title: "v1.0 Official Launch", description: "Released the stable v1.0 with full module support, role-based access control, and multi-language support.", tag: "Release", color: "bg-green-500" },
  { date: "05 Dec 2023", title: "Series A Funding", description: "Secured $5M in Series A funding to accelerate product development and expand the engineering team.", tag: "Business", color: "bg-yellow-500" },
  { date: "18 Feb 2024", title: "v2.0 Released", description: "Major upgrade with real-time collaboration, advanced analytics dashboard, and custom branding options.", tag: "Release", color: "bg-green-500" },
  { date: "25 May 2024", title: "1M Users Milestone", description: "Celebrated reaching one million registered users across all plans, marking explosive growth.", tag: "Milestone", color: "bg-purple-500" },
  { date: "10 Aug 2024", title: "Enterprise Launch", description: "Introduced the Enterprise tier with dedicated servers, SLA guarantees, and white-label solutions.", tag: "Business", color: "bg-yellow-500" },
  { date: "22 Nov 2024", title: "Global Expansion", description: "Opened offices in London and Tokyo, with localization support for 20+ languages.", tag: "Milestone", color: "bg-blue-500" },
  { date: "01 Mar 2025", title: "v3.0 Released", description: "Launched v3.0 featuring AI-powered insights, automated workflows, and an enhanced plugin ecosystem.", tag: "Release", color: "bg-green-500" },
];

function TimelineCard({ event, align }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`flex items-center gap-2 mb-2 ${align === "right" ? "md:justify-end" : ""}`}>
          <Badge variant="secondary">{event.tag}</Badge>
        </div>
        <h4 className="font-bold mb-1">{event.title}</h4>
        <p className="text-sm text-muted-foreground">{event.description}</p>
      </CardContent>
    </Card>
  );
}

export default function TimelinePage() {
  return (
    <div>
      <Breadcrumb title="Timeline" items={BREADCRUMB_ITEMS} />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Our Journey</h2>
        <p className="text-muted-foreground">Key milestones in the Admin Platform story</p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Center line - desktop only */}
        <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-border hidden md:block" />

        <div className="space-y-8">
          {TIMELINE_EVENTS.map((event, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={event.title} className="relative">
                {/* Desktop: alternating layout */}
                <div className="hidden md:grid md:grid-cols-[1fr_3rem_1fr] items-center gap-0">
                  <div className={isLeft ? "text-right pr-4" : ""}>
                    {isLeft && <TimelineCard event={event} align="right" />}
                  </div>
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-4 h-4 rounded-full ${event.color} ring-4 ring-background`} />
                    <span className="text-xs text-muted-foreground font-medium mt-1 whitespace-nowrap">{event.date}</span>
                  </div>
                  <div className={!isLeft ? "pl-4" : ""}>
                    {!isLeft && <TimelineCard event={event} align="left" />}
                  </div>
                </div>

                {/* Mobile: stacked layout */}
                <div className="md:hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${event.color} flex-shrink-0`} />
                    <span className="text-xs text-muted-foreground font-medium">{event.date}</span>
                  </div>
                  <TimelineCard event={event} align="left" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
