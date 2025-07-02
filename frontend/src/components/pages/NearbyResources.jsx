import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import toast from 'react-hot-toast';

const baseUrl = import.meta.env.VITE_API_URL;

const LocationPicker = ({ setLat, setLon }) => {
  useMapEvents({
    click(e) {
      setLat(e.latlng.lat.toFixed(6));
      setLon(e.latlng.lng.toFixed(6));
    },
  });
  return null;
};

const NearbyResources = () => {
  const id = localStorage.getItem("disasterId");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [radius, setRadius] = useState(20);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    if (!lat || !lon) return alert("Please select a location on the map.");
    // if (!lat || !lon) return toast.error("Please select a location on the map.");

    try {
      setLoading(true);
      const { data } = await axios.get(`${baseUrl}/api/disasters/${id}/resources?lat=${lat}&lon=${lon}&radius=${radius}`);
      setResources(data.data || []);
    } catch (err) {
      console.error("Nearby fetch failed", err);
      // alert("❌ Failed to fetch nearby resources");
      toast.error("❌ Failed to fetch nearby resources");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">📍 Nearby Resources</h2>

      <div className="h-80 w-full rounded overflow-hidden border">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationPicker setLat={setLat} setLon={setLon} />
          {lat && lon && <Marker position={[lat, lon]} />}
        </MapContainer>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="py-2">Latitude</Label>
          <Input 
          value={lat} 
          readOnly 
          />
        </div>
        <div>
          <Label className="py-2">Longitude</Label>
          <Input value={lon} readOnly />
        </div>
        <div>
          <Label className="py-2">Radius (km)</Label>
          <Input
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            type="number"
            min={1}
          />
        </div>
      </div>

      <Button
        className="w-225 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
        onClick={fetchResources}>
        🔍 Find Nearby Resources
      </Button>

      {loading ? (
        <p>Loading...</p>
      ) : resources.length === 0 ? (
        <p>No resources found in this area.</p>
      ) : (
        <div className="grid gap-4">
          {resources.map((res, i) => (
            <Card key={i}>
              <CardHeader className="flex justify-between">
                <span className="font-semibold">{res.name}</span>
                <span className="text-sm text-gray-600">{res.type}</span>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  📍 {res.location_name || "No label"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Coordinates: ({res.location?.coordinates?.[1]},{' '}
                  {res.location?.coordinates?.[0]})
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearbyResources;
