/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { io } from "socket.io-client";


// const BroadcastPanel = ({ token, baseUrl }) => {
//   const [disasters, setDisasters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [broadcasting, setBroadcasting] = useState(null);

//   const fetchDisasters = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`${baseUrl}/api/disasters`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       // Filter only verified and not yet broadcasted
//       const eligible = data.data.filter(
//         (d) => d.verification_status === "verified" && !d.broadcasted
//       );

//       setDisasters(eligible);
//     } catch (err) {
//       console.error("Error fetching disasters:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBroadcast = async (id) => {
//     if (!window.confirm("Are you sure you want to broadcast this disaster?")) return;

//     try {
//       setBroadcasting(id);
//       const { data } = await axios.post(
//         `${baseUrl}/api/disasters/${id}/broadcast`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       alert(`✅ ${data.message}`);
//       fetchDisasters(); // refresh the list
//     } catch (err) {
//       console.error("Broadcast error:", err);
//       alert(
//         err.response?.data?.message || "Broadcast failed. Make sure disaster is verified."
//       );
//     } finally {
//       setBroadcasting(null);
//     }
//   };

//   useEffect(() => {
//     fetchDisasters();
//   }, []);

//   if (loading) return <p>Loading eligible disasters...</p>;

//   return (
//     <div className="p-4 border rounded shadow-md bg-white">
//       <h2 className="text-xl font-bold mb-4">🛰️ Broadcast Eligible Disasters</h2>

//       {disasters.length === 0 && (
//         <p className="text-gray-500">No verified disasters available to broadcast.</p>
//       )}

//       <ul className="space-y-4">
//         {disasters.map((disaster) => (
//           <li
//             key={disaster.id}
//             className="p-4 border rounded bg-gray-50 flex justify-between items-center"
//           >
//             <div>
//               <h3 className="font-semibold">{disaster.title}</h3>
//               <p className="text-sm text-gray-600">{disaster.location_name}</p>
//               <p className="text-xs text-gray-400">
//                 Status: {disaster.verification_status}
//               </p>
//             </div>
//             <button
//               className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
//               disabled={broadcasting === disaster.id}
//               onClick={() => handleBroadcast(disaster.id)}
//             >
//               {broadcasting === disaster.id ? "Broadcasting..." : "📢 Broadcast"}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// ✅ BroadcastPanel.jsx (Admin View)


// IMPLEMENT SOCKET

const baseUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("authToken") || import.meta.env.VITE_JWT_SECRET;
// const socket = io(baseUrl); // Socket connected to backend
const socket = io(baseUrl, {
  withCredentials: true,
  transports: ['websocket', 'polling'], // Include both for fallback
  extraHeaders: {
    "Authorization": `Bearer ${token}`
  }
});




const AdminBroadcastPanel = ({ token, baseUrl, socket }) => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${baseUrl}/api/disasters`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const eligible = data.data.filter(
        (d) => d.verification_status === "verified" && !d.broadcasted
      );
      setDisasters(eligible);
    } catch (err) {
      console.error("Error fetching disasters:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (id) => {
    if (!window.confirm("Are you sure you want to broadcast this disaster?")) return;
    try {
      setBroadcasting(id);
      const { data } = await axios.post(
        `${baseUrl}/api/disasters/${id}/broadcast`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMsg(data.message);
      fetchDisasters();
    } catch (err) {
      alert(err.response?.data?.message || "Broadcast failed.");
    } finally {
      setBroadcasting(null);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, [token]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">🛰️ Broadcast Panel</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading eligible disasters...</p>}
          {successMsg && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
              ✅ {successMsg}
            </div>
          )}

          {disasters.length === 0 ? (
            <p className="text-gray-500">No verified disasters available to broadcast.</p>
          ) : (
            <ul className="space-y-4">
              {disasters.map((d) => (
                <li
                  key={d.id}
                  className="border p-4 rounded bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{d.title}</h3>
                    <p className="text-sm text-gray-600">📍 {d.location_name}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(d.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    disabled={broadcasting === d.id}
                    onClick={() => handleBroadcast(d.id)}
                  >
                    {broadcasting === d.id ? "Broadcasting..." : "📢 Broadcast"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBroadcastPanel;
