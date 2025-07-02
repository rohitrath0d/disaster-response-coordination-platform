// 📢 UserBroadcastPage.jsx — View all broadcasted disasters
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";


const baseUrl = import.meta.env.VITE_API_URL;
// const token = import.meta.env.VITE_ADMIN_TOKEN;
const token = localStorage.getItem("authToken") || import.meta.env.VITE_JWT_SECRET;
const newSocket = io(baseUrl, {
  withCredentials: true,
  transports: ['websocket', 'polling'], // Include both for fallback
  extraHeaders: {
    "Authorization": `Bearer ${token}`
  }
});



// const UserBroadcastPage = ({ baseUrl }) => {
const BroadcastedDisasters = () => {

  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();


  const fetchBroadcastedDisasters = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/disasters/broadcasted`);
      setDisasters(res.data.data);
    } catch (err) {
      console.error("Error fetching broadcasted disasters:", err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchBroadcastedDisasters();
  // }, []);

  useEffect(() => {
    // Initialize socket connection
    // const newSocket = io(baseUrl, {
    //   withCredentials: true,
    //   transports: ['websocket', 'polling'],
    //   extraHeaders: { Authorization: `Bearer ${token}` }
    // });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Set up socket event listeners
    const handleNewBroadcast = (newDisaster) => {
      setDisasters(prev => [newDisaster, ...prev]);
    };

    const handleBroadcastUpdate = (updatedDisaster) => {
      setDisasters(prev =>
        prev.map(d => d.id === updatedDisaster.id ? updatedDisaster : d)
      );
    };

    const handleBroadcastRemoved = (disasterId) => {
      setDisasters(prev => prev.filter(d => d.id !== disasterId));
    };

    socket.on('new_broadcast', handleNewBroadcast);
    socket.on('update_broadcast', handleBroadcastUpdate);
    socket.on('remove_broadcast', handleBroadcastRemoved);

    // Initial data fetch
    fetchBroadcastedDisasters();

    return () => {
      // Clean up listeners
      socket.off('new_broadcast', handleNewBroadcast);
      socket.off('update_broadcast', handleBroadcastUpdate);
      socket.off('remove_broadcast', handleBroadcastRemoved);
    };
  }, [socket]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">

        <Card className="w-full gap-4">
          <CardHeader>
            <CardTitle className="text-xl text-center">📢 Broadcasted Disasters</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {loading ? (
              <p>Loading...</p>
            ) : disasters.length === 0 ? (
              <p className="text-gray-500">No broadcasted disasters found.</p>
            ) : (
              // <ul className="space-y-4">
              <div className="grid gap-4">
                {disasters.map((d) => (
                  <div
                    key={d.id}
                    className="border rounded bg-white shadow-sm hover:shadow transition"
                  >
                    <div className="flex p-2 justify-between items-center">
                      <h3 className="text-xl font-bold">{d.title}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(d.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm p-2 text-gray-700 mt-1">{d.description}</p>
                    <p className="text-sm p-2 text-gray-600 italic mt-1">📍 {d.location_name}</p>

                    <div className="flex flex-wrap p-2 gap-2 mt-2">
                      {d.tags?.map((tag, idx) => (
                        <span
                          key={idx}
                          // className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded"
                          className={`px-2 py-0.5 rounded text-sm ${/sos|urgent|emergency/.test(tag)
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-800"
                            }`}
                        >
                          #{tag}
                        </span>
                      ))}

                      <div>
                       <Button
                        className="ml-250"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          localStorage.setItem("disasterId", d.id);
                          navigate("/sidebar/reports");
                        }}
                      >
                        🧭 Manage Reports
                      </Button>
                      </div>

                    </div>

                    <div className="p-2 flex gap-2 mt-2">
                      <span className="text-sm font-semibold bg-green-100 text-green-700 px-2 rounded">
                        ✅ Verified
                      </span>
                      <span className="text-sm font-semibold bg-yellow-100 text-yellow-800 px-2 rounded">
                        📢 Broadcasted
                      </span>

                        
                      
                      <Button
                        className="ml-200"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          localStorage.setItem("disasterId", d.id);
                          navigate("/sidebar/resources");
                        }}
                      >
                        🧭 Manage Resources
                      </Button>

                    </div>
                    {/* </li> */}
                  </div>
                ))}
                {/* </ul> */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div >
  );
};

export default BroadcastedDisasters;
