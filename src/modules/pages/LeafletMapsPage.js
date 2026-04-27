import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Maps" },
  { label: "Leaflet" },
];

const EUROPEAN_CITIES = [
  { name: "London", lat: 51.505, lng: -0.09 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin", lat: 52.52, lng: 13.405 },
  { name: "Rome", lat: 41.9028, lng: 12.4964 },
  { name: "Madrid", lat: 40.4168, lng: -3.7038 },
];

const SF_POLYGON = [
  [37.78, -122.43],
  [37.77, -122.41],
  [37.76, -122.43],
];

const OSM_TILE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const DARK_TILE = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const DARK_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

function BasicMap() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Basic Map</CardTitle></CardHeader>
      <CardContent>
        <div style={{ height: 350 }} className="rounded-md overflow-hidden">
          <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url={OSM_TILE} attribution={OSM_ATTR} />
            <Marker position={[51.505, -0.09]}>
              <Popup>Admin Platform HQ</Popup>
            </Marker>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MultipleMarkersMap() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Multiple Markers</CardTitle></CardHeader>
      <CardContent>
        <div style={{ height: 350 }} className="rounded-md overflow-hidden">
          <MapContainer center={[48.5, 8.0]} zoom={4} style={{ height: "100%", width: "100%" }}>
            <TileLayer url={OSM_TILE} attribution={OSM_ATTR} />
            {EUROPEAN_CITIES.map((city) => (
              <Marker key={city.name} position={[city.lat, city.lng]}>
                <Popup>{city.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function DarkThemeMap() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Custom Styled Map (Dark)</CardTitle></CardHeader>
      <CardContent>
        <div style={{ height: 350 }} className="rounded-md overflow-hidden">
          <MapContainer center={[40.7128, -74.006]} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer url={DARK_TILE} attribution={DARK_ATTR} />
            <Marker position={[40.7128, -74.006]}>
              <Popup>New York City</Popup>
            </Marker>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ShapesMap() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Map with Circle & Polygon</CardTitle></CardHeader>
      <CardContent>
        <div style={{ height: 350 }} className="rounded-md overflow-hidden">
          <MapContainer center={[37.7749, -122.4194]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url={OSM_TILE} attribution={OSM_ATTR} />
            <Circle center={[37.7749, -122.4194]} radius={1000} pathOptions={{ color: "blue" }} />
            <Polygon positions={SF_POLYGON} pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.2 }} />
            <Marker position={[37.7749, -122.4194]}>
              <Popup>San Francisco</Popup>
            </Marker>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeafletMapsPage() {
  return (
    <div>
      <Breadcrumb title="Leaflet Maps" items={BREADCRUMB_ITEMS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicMap />
        <MultipleMarkersMap />
        <DarkThemeMap />
        <ShapesMap />
      </div>
    </div>
  );
}
