import { useEffect, useState } from "react";
import axios from "axios";
// import { io } from "socket.io-client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { socket } from "../../Socket";
import toast from "react-hot-toast";



const baseUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("authToken") || import.meta.env.VITE_JWT_SECRET;

const NearbyDisasters = () => {
  const [disasters, setDisasters] = useState([]);
  // const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: "", lng: "", radius: 50 });
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNearbyDisasters = async () => {
    if (!location.lat || !location.lng) return;
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/disasters/nearby`, {
        params: location,
        headers: { Authorization: `Bearer ${token}` }
      });
      setDisasters(res.data.data || []);
    } catch (err) {
      console.error("Error fetching nearby disasters:", err);
    } finally {
      setLoading(false);
    }
  };

  const geocodeSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: searchQuery,
          format: "json"
        }
      });
      const first = res.data[0];
      if (first) {
        setLocation((prev) => ({
          ...prev,
          lat: parseFloat(first.lat),
          lng: parseFloat(first.lon)
        }));
      } else {
        // alert("Location not found");
        toast.error("Location not found")
      }
    } catch (err) {
      console.error("Geocoding error", err);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }));
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, []);

  // useEffect(() => {
  //   const newSocket = io(baseUrl, {
  //     withCredentials: true,
  //     transports: ['websocket', 'polling'],
  //     extraHeaders: { Authorization: `Bearer ${token}` }
  //   });
  //   setSocket(newSocket);
  //   return () => newSocket.disconnect();
  // }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNew = (d) => setDisasters((prev) => [d, ...prev]);
    const handleUpdate = (d) => setDisasters((prev) => prev.map((di) => di.id === d.id ? d : di));
    const handleDelete = (id) => setDisasters((prev) => prev.filter((d) => d.id !== id));

    socket.on("create", handleNew);
    socket.on("update", handleUpdate);
    socket.on("delete", handleDelete);

    return () => {
      socket.off("create", handleNew);
      socket.off("update", handleUpdate);
      socket.off("delete", handleDelete);
    };
  }, [socket]);

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocation((prev) => ({ ...prev, [name]: parseFloat(value) || "" }));
  };

  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (location.lat && location.lng) {
        map.setView([location.lat, location.lng], location.radius > 100 ? 8 : 12);
      }
    }, [location.lat, location.lng, location.radius]);
    return null;
  };

  return (
    // <div className="max-w-7xl mx-auto p-4 space-y-4">
    <div className="w-full p-4 space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>📍 Nearby Disasters</CardTitle>
          <CardDescription>Enter a location or use your coordinates</CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              placeholder="🔎 Search location (e.g., Mumbai)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline" onClick={geocodeSearch}>Search</Button>
            <Input
              name="lat"
              value={location.lat}
              onChange={handleLocationChange}
              type="number"
              placeholder="Latitude"
            />
            <Input
              name="lng"
              value={location.lng}
              onChange={handleLocationChange}
              type="number"
              placeholder="Longitude"
            />
          </div>
          <div className="flex gap-4 mb-4">
            <Input
              name="radius"
              value={location.radius}
              onChange={handleLocationChange}
              type="number"
              placeholder="Radius (km)"
              className="w-full max-w-sm"
            />
            <Button
              onClick={fetchNearbyDisasters}
              disabled={!location.lat || !location.lng}
              className="w-100 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
            >
              {loading ? "🔄 Loading..." : "📍 Find Nearby"}
            </Button>
          </div>

          {/* 🗺️ Map */}
          {location.lat && location.lng && (
            <MapContainer
              center={[location.lat || 0, location.lng || 0]}
              zoom={10}
              scrollWheelZoom={true}
              style={{ height: "300px", width: "100%", borderRadius: "0.5rem"   }}
              className="rounded shadow mb-6"
            >
              <MapUpdater />
              <TileLayer
                attribution='&copy; <a href="http://osm.org">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[location.lat, location.lng]}>
                <Popup>Your selected location</Popup>
              </Marker>
              <Circle
                center={[location.lat, location.lng]}
                radius={location.radius * 1000}
                pathOptions={{ fillColor: "blue" }}
              />
              {disasters.map((d, i) => (
                d.location?.coordinates?.length === 2 && (
                  <Marker key={i} position={[d.location.coordinates[1], d.location.coordinates[0]]}>
                    <Popup>{d.title}</Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          )}

          {/* 🧾 List */}
          <ul className=" w-full space-y-4">
            {disasters.map((d) => (
              <li key={d.id} className="p-4 border rounded bg-white shadow space-y-1">
                <h3 className="text-lg font-semibold">{d.title}</h3>
                <p className="text-sm text-gray-600">{d.description}</p>
                <p className="text-xs text-gray-500 italic">📍 {d.location_name || "Unknown"}</p>
                <div className="flex gap-2 flex-wrap">
                  {d.tags?.map((tag, i) => (
                    <span key={i} className="bg-gray-100 text-xs px-2 py-0.5 rounded">#{tag}</span>
                  ))}
                  {d.distance && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {d.distance.toFixed(2)} km away
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {!loading && disasters.length === 0 && (
            <div className="mt-6 text-center text-gray-600 italic">
              🚫 No disasters found within {location.radius}km radius.
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default NearbyDisasters;
