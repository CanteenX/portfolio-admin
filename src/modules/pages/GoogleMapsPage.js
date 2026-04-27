import { AlertCircle, MapPin } from "lucide-react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Maps" },
  { label: "Google Maps" },
];

export default function GoogleMapsPage() {
  return (
    <div>
      <Breadcrumb title="Google Maps" items={BREADCRUMB_ITEMS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Google Maps</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 rounded-md bg-blue-500/10 border border-blue-500/20">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Google Maps integration requires an API key
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Google Maps cannot be displayed without a valid API key.
                  Once configured, this page will render an interactive Google Map
                  with markers, directions, and other features.
                </p>
              </div>
            </div>
            <div
              style={{ height: 350 }}
              className="mt-4 rounded-md border border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3"
            >
              <MapPin className="w-12 h-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Map will render here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Setup Instructions</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To enable Google Maps, follow these steps:
              </p>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>
                  Go to the{" "}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Cloud Console
                  </a>
                </li>
                <li>Create or select a project</li>
                <li>Enable the Maps JavaScript API</li>
                <li>Create an API key</li>
                <li>
                  Add your API key to the environment variable:
                </li>
              </ol>
              <div className="p-3 rounded-md bg-muted font-mono text-xs">
                REACT_APP_GOOGLE_MAPS_KEY=your_api_key_here
              </div>
              <p className="text-xs text-muted-foreground">
                The page uses the <code className="px-1 py-0.5 rounded bg-muted text-xs">@react-google-maps/api</code> package.
                Install it when ready to integrate.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
