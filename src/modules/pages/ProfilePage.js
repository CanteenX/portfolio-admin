import { useState } from "react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../core/auth/AuthContext";
import { Activity, Settings, BarChart3, Ticket, CheckSquare, Clock } from "lucide-react";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Pages" },
  { label: "Profile" },
];

const ACTIVITY_ITEMS = [
  { action: "Updated system settings", time: "2 minutes ago", icon: Settings },
  { action: "Created new support ticket #1042", time: "1 hour ago", icon: Ticket },
  { action: "Completed task: Database migration", time: "3 hours ago", icon: CheckSquare },
  { action: "Reviewed audit log entries", time: "Yesterday", icon: Activity },
  { action: "Generated monthly report", time: "2 days ago", icon: BarChart3 },
];

const SUMMARY_CARDS = [
  { label: "Modules Used", value: "12", icon: BarChart3 },
  { label: "Tickets Created", value: "48", icon: Ticket },
  { label: "Tasks Completed", value: "156", icon: CheckSquare },
  { label: "Hours Logged", value: "320", icon: Clock },
];

const TIMEZONE_OPTIONS = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Tokyo",
  "Asia/Kolkata", "Australia/Sydney",
];

function getInitials(email) {
  if (!email) return "U";
  const parts = email.split("@")[0].split(/[._-]/);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("").slice(0, 2);
}

export default function ProfilePage() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    bio: "",
    timezone: "UTC",
  });

  const email = session?.user?.email || "user@example.com";
  const role = session?.user?.role || "admin";
  const initials = getInitials(email);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div>
      <Breadcrumb title="Profile" items={BREADCRUMB_ITEMS} />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold">
              {initials}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold">{email}</h3>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <Badge variant="secondary" className="uppercase">{role}</Badge>
                <span className="text-sm text-muted-foreground">Member since Jan 2024</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-6">
        {["overview", "settings"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUMMARY_CARDS.map((card) => (
              <Card key={card.label}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ACTIVITY_ITEMS.map((item) => (
                  <div key={item.action} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "settings" && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-lg">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={formData.displayName} onChange={handleChange("displayName")} placeholder="Enter display name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} readOnly className="bg-muted" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={handleChange("phone")} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={handleChange("bio")}
                placeholder="Tell us about yourself..."
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={handleChange("timezone")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
