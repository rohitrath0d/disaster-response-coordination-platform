import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import L from "leaflet";
import { io } from "socket.io-client";

const baseUrl = import.meta.env.VITE_API_URL;


// const socket = io("http://localhost:5000"); // make sure this matches backend
const socket = io(baseUrl); // make sure this matches backend


const MapPage = () => {
  const [disasters, setDisasters] = useState([]);

  const fetchDisasters = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/disasters`, {
        headers: {
          Authorization: "Bearer 9870afe4e87f6640373778c7e2fef30bab86ea4a195bde0f14a511bb52f0e3b2", // 🔐 Use your admin token here
        },
      });
      setDisasters(res.data.data);
    } catch (err) {
      console.error("Failed to fetch disasters:", err);
    }
  };

  // useEffect(() => {
  //   fetchDisasters();
  // }, []);

  useEffect(() => {
    fetchDisasters(); // Initial fetch

    socket.on("disaster_updated", (payload) => {
      console.log("🛰️ Real-time update received:", payload);
      fetchDisasters(); // 🔄 Re-fetch when disaster is created/updated
    });

    return () => {
      socket.off("disaster_updated"); // Clean up on unmount
    };
  }, []);

  // const parseLocation = (pgPoint) => {
  //   if (!pgPoint) return null;

  //   const hex = pgPoint.slice(16); // remove WKB header
  //   const buf = Buffer.from(hex, "hex");

  //   const lng = buf.readDoubleLE(0);
  //   const lat = buf.readDoubleLE(8);
  //   return [lat, lng];
  // };

  const parseLocation = (pgPoint) => {
    if (!pgPoint) return null;

    try {
      const hex = pgPoint.slice(16); // skip WKB header
      const bytes = new Uint8Array(hex.length / 2);

      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
      }

      const dataView = new DataView(bytes.buffer);
      const lng = dataView.getFloat64(0, true);  // little endian
      const lat = dataView.getFloat64(8, true);

      return [lat, lng];
    } catch (err) {
      console.error("Failed to parse location:", err);
      return null;
    }
  };

  const handleBroadcast = async (id) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/disasters/${id}/broadcast`,
        {},
        {
          headers: {
            Authorization: "Bearer netrunnerX999",
          },
        }
      );
      alert(res.data.message);
    } catch (err) {
      console.error("Broadcast error:", err);
      alert("Failed to broadcast.");
    }
  };

  const handleVerify = async (id) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/disasters/${id}/verify-image`,
        {
          image_url: "https://example.com/fake.jpg", // 🔄 optional/fake for mockup
        },
        {
          headers: {
            Authorization: "Bearer netrunnerX999",
          },
        }
      );
      alert(`Verification: ${res.data.verification_status}`);
    } catch (err) {
      console.error("Verify error:", err);
      alert("Verification failed.");
    }
  };



  return (
    <div className="h-screen w-full">
      <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {disasters.map((disaster) => {
          const coords = parseLocation(disaster.location);
          if (!coords) return null;

          return (
            <Marker key={disaster.id} position={coords} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] })}>
              <Popup>
                <strong>{disaster.title}</strong><br />
                <small>{disaster.location_name}</small><br />
                <small>{new Date(disaster.created_at).toLocaleString()}</small><br />
                <em>{disaster.tags.join(", ")}</em>

                <div className="mt-2 flex flex-col gap-1">
                  <button
                    onClick={() => handleBroadcast(disaster.id)}
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    📢 Broadcast
                  </button>
                  <button
                    onClick={() => handleVerify(disaster.id)}
                    className="text-sm bg-green-600 text-white px-2 py-1 rounded"
                  >
                    ✅ Verify
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapPage;
