import { useState, useMemo } from "react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Home, User, Settings, Bell, Search, Mail, Phone, Camera, Heart, Star,
  Shield, Lock, Unlock, Check, X, Plus, Minus, Edit, Trash, Download,
  Upload, Cloud, Sun, Moon, Globe, Bookmark, Calendar, Clock, Map, Filter,
  BarChart, PieChart, Activity, Zap, Award, Target, Coffee, Gift, Flag, Briefcase,
} from "lucide-react";
import DashboardLineIcon from "remixicon-react/DashboardLineIcon";
import UserLineIcon from "remixicon-react/UserLineIcon";
import Settings3LineIcon from "remixicon-react/Settings3LineIcon";
import Notification2LineIcon from "remixicon-react/Notification2LineIcon";
import Search2LineIcon from "remixicon-react/Search2LineIcon";
import MailLineIcon from "remixicon-react/MailLineIcon";
import PhoneLineIcon from "remixicon-react/PhoneLineIcon";
import CameraLineIcon from "remixicon-react/CameraLineIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import StarLineIcon from "remixicon-react/StarLineIcon";
import ShieldLineIcon from "remixicon-react/ShieldLineIcon";
import LockLineIcon from "remixicon-react/LockLineIcon";
import CheckLineIcon from "remixicon-react/CheckLineIcon";
import CloseLineIcon from "remixicon-react/CloseLineIcon";
import AddLineIcon from "remixicon-react/AddLineIcon";
import SubtractLineIcon from "remixicon-react/SubtractLineIcon";
import EditLineIcon from "remixicon-react/EditLineIcon";
import DeleteBin2LineIcon from "remixicon-react/DeleteBin2LineIcon";
import DownloadLineIcon from "remixicon-react/DownloadLineIcon";
import UploadLineIcon from "remixicon-react/UploadLineIcon";
import CloudLineIcon from "remixicon-react/CloudLineIcon";
import SunLineIcon from "remixicon-react/SunLineIcon";
import MoonLineIcon from "remixicon-react/MoonLineIcon";
import GlobalLineIcon from "remixicon-react/GlobalLineIcon";
import Bookmark2LineIcon from "remixicon-react/Bookmark2LineIcon";
import CalendarLineIcon from "remixicon-react/CalendarLineIcon";
import TimeLineIcon from "remixicon-react/TimeLineIcon";
import MapPinLineIcon from "remixicon-react/MapPinLineIcon";
import FilterLineIcon from "remixicon-react/FilterLineIcon";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "UI" },
  { label: "Icons" },
];

const LUCIDE_ICONS = [
  { name: "Home", Icon: Home }, { name: "User", Icon: User },
  { name: "Settings", Icon: Settings }, { name: "Bell", Icon: Bell },
  { name: "Search", Icon: Search }, { name: "Mail", Icon: Mail },
  { name: "Phone", Icon: Phone }, { name: "Camera", Icon: Camera },
  { name: "Heart", Icon: Heart }, { name: "Star", Icon: Star },
  { name: "Shield", Icon: Shield }, { name: "Lock", Icon: Lock },
  { name: "Unlock", Icon: Unlock }, { name: "Check", Icon: Check },
  { name: "X", Icon: X }, { name: "Plus", Icon: Plus },
  { name: "Minus", Icon: Minus }, { name: "Edit", Icon: Edit },
  { name: "Trash", Icon: Trash }, { name: "Download", Icon: Download },
  { name: "Upload", Icon: Upload }, { name: "Cloud", Icon: Cloud },
  { name: "Sun", Icon: Sun }, { name: "Moon", Icon: Moon },
  { name: "Globe", Icon: Globe }, { name: "Bookmark", Icon: Bookmark },
  { name: "Calendar", Icon: Calendar }, { name: "Clock", Icon: Clock },
  { name: "Map", Icon: Map }, { name: "Filter", Icon: Filter },
  { name: "BarChart", Icon: BarChart }, { name: "PieChart", Icon: PieChart },
  { name: "Activity", Icon: Activity }, { name: "Zap", Icon: Zap },
  { name: "Award", Icon: Award }, { name: "Target", Icon: Target },
  { name: "Coffee", Icon: Coffee }, { name: "Gift", Icon: Gift },
  { name: "Flag", Icon: Flag }, { name: "Briefcase", Icon: Briefcase },
];

const REMIX_ICONS = [
  { name: "Dashboard", Icon: DashboardLineIcon },
  { name: "User", Icon: UserLineIcon },
  { name: "Settings", Icon: Settings3LineIcon },
  { name: "Notification", Icon: Notification2LineIcon },
  { name: "Search", Icon: Search2LineIcon },
  { name: "Mail", Icon: MailLineIcon },
  { name: "Phone", Icon: PhoneLineIcon },
  { name: "Camera", Icon: CameraLineIcon },
  { name: "Heart", Icon: HeartLineIcon },
  { name: "Star", Icon: StarLineIcon },
  { name: "Shield", Icon: ShieldLineIcon },
  { name: "Lock", Icon: LockLineIcon },
  { name: "Check", Icon: CheckLineIcon },
  { name: "Close", Icon: CloseLineIcon },
  { name: "Add", Icon: AddLineIcon },
  { name: "Subtract", Icon: SubtractLineIcon },
  { name: "Edit", Icon: EditLineIcon },
  { name: "DeleteBin", Icon: DeleteBin2LineIcon },
  { name: "Download", Icon: DownloadLineIcon },
  { name: "Upload", Icon: UploadLineIcon },
  { name: "Cloud", Icon: CloudLineIcon },
  { name: "Sun", Icon: SunLineIcon },
  { name: "Moon", Icon: MoonLineIcon },
  { name: "Global", Icon: GlobalLineIcon },
  { name: "Bookmark", Icon: Bookmark2LineIcon },
  { name: "Calendar", Icon: CalendarLineIcon },
  { name: "Time", Icon: TimeLineIcon },
  { name: "MapPin", Icon: MapPinLineIcon },
  { name: "Filter", Icon: FilterLineIcon },
];

function IconCard({ name, children }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all">
      <div className="w-[60px] h-[60px] flex items-center justify-center text-muted-foreground">
        {children}
      </div>
      <span className="text-xs text-muted-foreground mt-1 text-center truncate w-full">{name}</span>
    </div>
  );
}

export default function IconsPage() {
  const [tab, setTab] = useState("lucide");
  const [search, setSearch] = useState("");

  const filteredLucide = useMemo(
    () => LUCIDE_ICONS.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const filteredRemix = useMemo(
    () => REMIX_ICONS.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const icons = tab === "lucide" ? filteredLucide : filteredRemix;

  return (
    <div>
      <Breadcrumb title="Icons" items={BREADCRUMB_ITEMS} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setTab("lucide")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  tab === "lucide"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Lucide Icons
              </button>
              <button
                type="button"
                onClick={() => setTab("remix")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  tab === "remix"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                Remix Icons
              </button>
            </div>
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {icons.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No icons match your search.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {icons.map((item) => (
                <IconCard key={item.name} name={item.name}>
                  <item.Icon className="w-6 h-6" />
                </IconCard>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Showing {icons.length} of {tab === "lucide" ? LUCIDE_ICONS.length : REMIX_ICONS.length} icons
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
