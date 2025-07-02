import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-geosearch/dist/geosearch.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import toast from "react-hot-toast";

const baseUrl = import.meta.env.VITE_API_URL;
// const token = localStorage.getItem("token") ;
const token = localStorage.getItem("authToken") || import.meta.env.VITE_JWT_SECRET;


const LocationMarker = ({ setLatLng }) => {
  useMapEvents({
    click(e) {
      setLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const ResourceForm = ({ initialData = null }) => {
  const id = localStorage.getItem("disasterId");
  const [form, setForm] = useState({
    name: "",
    type: "",
    location_name: "",
    lat: "",
    lng: "",
    ...initialData,
  });

  const [loading, setLoading] = useState(false);

  const setLatLng = ({ lat, lng }) => {
    setForm((prev) => ({ ...prev, lat, lng }));
  };

  useEffect(() => {
    if (!form.lat || !form.lng) return;
    const map = document.querySelector(".leaflet-container")?._leaflet_map;
    if (!map) return;

    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: false,
      showPopup: false,
    });

    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [form.lat, form.lng]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return alert("Disaster ID missing.");

    try {
      setLoading(true);
      const res = await axios.post(`${baseUrl}/api/disasters/${id}/resources`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        // alert("✅ Resource added.");
        toast.success("✅ Resource added.");
        setForm({ name: "", type: "", location_name: "", lat: "", lng: "" });
      }
    } catch (err) {
      // alert("❌ Failed: " + (err.response?.data?.message || err.message));
      toast.success("❌ Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <form onSubmit={handleSubmit} className="max-w-6xl space-y-4 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold">➕ Add Resource</h2>

        <div>
          <Label className="py-2">Name</Label>
          <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
        </div>

        <div>
          <Label className="py-2">Type</Label>
          <Select value={form.type} onValueChange={(val) => handleChange("type", val)}>
            <SelectTrigger className="h-12"> {/* 👈 Bigger height */}
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="shelter">Shelter</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="py-2">Location Name</Label>
          <Input value={form.location_name} onChange={(e) => handleChange("location_name", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="py-2">Latitude</Label>
            <Input type="number" value={form.lat} onChange={(e) => handleChange("lat", e.target.value)} required />
          </div>
          <div>
            <Label className="py-2">Longitude</Label>
            <Input type="number" value={form.lng} onChange={(e) => handleChange("lng", e.target.value)} required />
          </div>
        </div>

        <div className="h-72 mt-4 rounded overflow-hidden border">
          <MapContainer center={[form.lat || 20, form.lng || 78]} zoom={5} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {form.lat && form.lng && (
              <Marker position={[form.lat, form.lng]} />
            )}
            <LocationMarker setLatLng={setLatLng} />
          </MapContainer>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-235   bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
        >
          {loading ? "Saving..." : "Save Resource"}
        </Button>
      </form>
    </div>
  );
};

export default ResourceForm;
