import { format } from "date-fns";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { io } from "socket.io-client";
import { useState, useEffect } from "react";
import axios from "axios";
import ErrorBoundary from "../ErrorBoundary";
import DisasterForm from "./DisasterForm";
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Megaphone } from 'lucide-react';
import { Switch } from "../ui/switch";
import toast from "react-hot-toast";

const baseUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("authToken") || import.meta.env.VITE_JWT_SECRET;
const socket = io(baseUrl, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  extraHeaders: {
    "Authorization": `Bearer ${token}`
  }
});

// const ListedDisasters = ({ initialDisasters = [], onEdit, loading: initialLoading = true }) => {
const ListedDisasters = () => {

  // const [disasters, setDisasters] = useState(initialDisasters);
  const [disasters, setDisasters] = useState([]);

  // const [loading, setLoading] = useState(initialLoading);
  const [loading, setLoading] = useState(true);

  // const [socket, setSocket] = useState(null);

  // const [disasters, setDisasters] = useState([]);
  // const [filtered, setFiltered] = useState([]);  
  // eslint-disable-next-line no-unused-vars
  const [tagFilter, setTagFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  // const [verifyingId, setVerifyingId] = useState(null);
  // const [broadcastingId, setBroadcastingId] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchDisasters = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/disasters`,
        // {
        // headers: {
        //   "Authorization": `Bearer ${token}`,
        // },
        // }
      );
      // console.log(res);

      const sorted = res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setDisasters(sorted);
      // setFiltered(sorted);
      setLoading(false);
      // setDisasters(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError(err.response?.data?.message || "Failed to load disasters");
    }
    finally {
      setLoading(false);
    }
  };


  // useEffect(() => {
  //   fetchDisasters();
  // }, []);



  // useEffect(() => {
  //   // Initialize socket connection
  //   setSocket(newSocket);

  //   return () => {
  //     newSocket.disconnect(); // Cleanup on unmount
  //   };
  // }, []);


  // const handleVerifyImage = async (disasterId, imageUrl) => {
  //   if (!imageUrl) {
  //     setError("No image URL provided for this disaster");
  //     return;
  //   }

  //   try {
  //     setVerifyingId(disasterId);
  //     setError(null);

  //     const response = await axios.post(
  //       `${baseUrl}/api/disasters/${disasterId}/verify-image`,
  //       { image_url: imageUrl },
  //       { headers: { "Authorization": `Bearer ${token}` } }
  //     );

  //     // Update local state
  //     setDisasters(prev => prev.map(d =>
  //       d.id === disasterId ? {
  //         ...d,
  //         verification_status: response.data.verification_status,
  //         verification_result: response.data.result
  //       } : d
  //     ));

  //   } catch (err) {
  //     console.error("Verification failed:", err);
  //     setError(err.response?.data?.message || "Verification failed");
  //   } finally {
  //     setVerifyingId(null);
  //   }
  // };

  // const handleVerifyImage = async (disasterId) => {
  //   try {
  //     setVerifyingId(disasterId);
  //     setError(null);

  //     const disaster = disasters.find(d => d.id === disasterId);
  //     if (!disaster?.image_url) {
  //       throw new Error("No image URL provided");
  //     }

  //     const response = await axios.post(
  //       `${import.meta.env.VITE_API_URL}/api/disasters/${disasterId}/verify-image`,
  //       { image_url: disaster.image_url },
  //       { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  //     );

  //     setDisasters(prev => prev.map(d =>
  //       d.id === disasterId ? {
  //         ...d,
  //         verification_status: response.data.verification_status,
  //         verification_result: response.data.result
  //       } : d
  //     ));
  //   } catch (err) {
  //     setError(err.response?.data?.message || err.message);
  //   } finally {
  //     setVerifyingId(null);
  //   }
  // };


  // const handleBroadcast = async (disasterId) => {
  //   const confirm = window.confirm("Broadcast this verified disaster to all users?");
  //   if (!confirm) return;

  //   try {
  //     setBroadcastingId(disasterId);

  //     const { data } = await axios.post(
  //       `${baseUrl}/api/disasters/${disasterId}/broadcast`,
  //       {},
  //       { headers: { "Authorization": `Bearer ${token}` } }
  //     );

  //     // Update local state
  //     setDisasters(prev => prev.map(d =>
  //       d.id === disasterId ? { ...d, broadcasted: true } : d
  //     ));

  //     alert(data.message || "Broadcast successful");
  //   } catch (err) {
  //     console.error("Broadcast error:", err);
  //     setError(err.response?.data?.message || "Broadcast failed");
  //   } finally {
  //     setBroadcastingId(null);
  //   }
  // };

  // const handleBroadcastToggle = async (disasterId, shouldBroadcast) => {
  //   try {
  //     setBroadcastingId(disasterId);

  //     if (shouldBroadcast) {
  //       const { data } = await axios.post(
  //         `${import.meta.env.VITE_API_URL}/api/disasters/${disasterId}/broadcast`,
  //         {},
  //         { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
  //       );

  //       setDisasters(prev => prev.map(d =>
  //         d.id === disasterId ? { ...d, broadcasted: true } : d
  //       ));
  //       alert(data.message || "Broadcast successful");
  //     }
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Broadcast failed");
  //   } finally {
  //     setBroadcastingId(null);
  //   }
  // };

  useEffect(() => {
    fetchDisasters();

    const handleDisasterUpdate = (eventData) => {
      console.log("🛰️ Real-time update received", eventData.action, eventData.data);

      // // Only process if we have valid data
      // if (!eventData?.action || !eventData.data) {
      //   console.error("Invalid socket event data:", eventData);
      //   return;
      // }

      const { action, data, id } = eventData;

      if (!action || !data) return;

      setDisasters(prev => {
        // const { action, id, data: disasterData } = eventData;

        // if (action === "create") return [disasterData, ...prev];
        if (action === "create") return [data, ...prev];

        // if (action === "update") return prev.map(d => d.id === disasterData.id ? disasterData : d);
        if (action === "update") return prev.map(d => d.id === data.id ? data : d);

        if (action === "delete") return prev.filter(d => d.id !== id);
        return prev;
      });

      if (showModal) setShowModal(false); // Optional: still close modal

    };

    // Connection monitoring
    const onConnect = () => console.log("✅ Socket connected");
    const onDisconnect = () => console.log("❌ Socket disconnected");

    socket.on("disaster_updated", handleDisasterUpdate);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("disaster_updated", handleDisasterUpdate);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
    // }, []);  // Empty dependency array is safe here
  }, [showModal]);  // keep showModal only if you want modal to auto-close



  // useEffect(() => {
  //   if (!tagFilter.trim()) {
  //     setFiltered(disasters);
  //   } else {
  //     const filteredData = disasters.filter((d) =>
  //       d.tags?.some((tag) =>
  //         tag.toLowerCase().includes(tagFilter.toLowerCase())
  //       )
  //     );
  //     setFiltered(filteredData);
  //   }
  // }, [tagFilter, disasters]); // Now this handles filtering whenever tagFilter or disasters change



  // const formatDate = (iso) => new Date(iso).toLocaleString();      --> using date-fns format instead

  const handleDelete = async (id) => {

    const confirmed = window.confirm("Are you sure you want to delete this disaster?");

    if (!confirmed) return;

    try {
      const response = await axios.delete(`${baseUrl}/api/disasters/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Let the socket.io event handle the state update

        setDisasters(prev => prev.filter(d => d.id !== id));
        // setFiltered(prev => prev.filter(d => d.id !== id));

        // alert("Deleted successfully.");
        toast.success("Deleted Successfully!", {position: 'bottom-right'})
      }
      //  else {
      //   alert(`Delete failed: ${response.data.message}`);
      // }

      // setDisasters(prev => prev.filter(d => d.id !== id));
      // setFiltered(prev => prev.filter(d => d.id !== id));

      // alert("Deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);
      // alert(`Failed to delete: ${err.response?.data?.message || err.message}`);
      toast.error(`Failed to delete: ${err.response?.data?.message || err.message}`, {position: 'top-right'})
    }
  };

  // This will handle both create and update scenarios
  const handleModalClose = () => {
    setShowModal(false);
    setEditTarget(null);
    fetchDisasters(); // Refresh the data
  };

  // // Filter disasters based on the tagFilter prop
  // const filteredDisasters = disasters.filter(disaster => {
  //   if (!tagFilter.trim()) return true;
  //   return disaster.tags?.some(tag =>
  //     tag.toLowerCase().includes(tagFilter.toLowerCase())
  //   );
  // });


  return (
    <ErrorBoundary>
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          {/* <h2 className="text-2xl font-bold">⚠️ Listed Disasters</h2> */}

          <Card className="w-full gap-4">
            <CardHeader>
              <CardTitle className="text-xl text-center">⚠️ Listed Disasters</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                // <p>Loading...</p>
                <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-4 text-sm animate-pulse"> Server might be waking up... Please wait or refresh if stuck. </div>
              ) : disasters.length === 0 ? (
                <p className="text-gray-500">No disasters found.</p>
              ) : (
                <div className="grid gap-4">
                  {disasters.map((d) => (
                    <div
                      key={d.id}
                      className="border rounded p-4 bg-white shadow-sm hover:shadow transition"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">{d.title}</h3>
                        <span className="text-sm text-gray-500">
                          {format(new Date(d.created_at), 'PPpp')}
                        </span>
                      </div>

                      <p className="text-gray-700 mt-1">{d.description}</p>
                      <p className="text-sm text-gray-600 italic">📍 {d.location_name}</p>

                      <div className="flex items-center gap-3 mt-1">

                        {/* Verification Status Display */}
                        {d.verification_status && (
                            <span className={`px-2 py-0.5 text-sm rounded font-medium 
                            ${d.verification_status === "verified"
                              ? "bg-green-100 text-green-700"
                              : d.verification_status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                              }`}>
                             <strong> Status:</strong> {d.verification_status}
                            </span>
                        )}

                        {d.broadcasted && (
                          <span className="flex py-1 items-center text-sm text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" /> Broadcasted
                          </span>
                        )}
                      </div>


                      {d.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {d.tags?.map((tag, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-sm ${/sos|urgent|emergency/.test(tag)
                                ? "bg-red-600 text-white"
                                : "bg-gray-200 text-gray-800"
                                }`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}


                      
                       <Button
                          className="ml-245"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            localStorage.setItem("disasterId", d.id);
                            navigate("/sidebar/reports");
                          }}
                        >
                          🧭 Manage Reports
                        </Button>


                      {/* 
                      {d.verification_result && (
                        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md text-xs">
                          <strong>Verification Result:</strong> {d.verification_result}
                        </div>
                      )} */}

                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-yellow-400 text-white px-3 py-1 rounded text-sm"
                          onClick={() => {
                            setEditTarget(d);
                            setShowModal(true);
                          }}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(d.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          ❌ Delete
                        </Button>
                       
                        
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow max-w-xl w-full">
                <DisasterForm
                  initialData={editTarget}
                  onClose={handleModalClose}
                />
              </div>
            </div>

          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default ListedDisasters;
