/* eslint-disable no-unused-vars */

import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
// import DisasterForm from "./DisasterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import BroadcastedDisasters from "../pages/BroadcastedDisasters";
import NearbyDisasters from "./NearbyDisasters";
import ListedDisasters from "./ListedDisasters";
import { Button } from "../ui/button";
import DisasterForm from "./DisasterForm";
import ErrorBoundary from "../ErrorBoundary";
import SocialMediaFeed from "./SocialMediaFeed";
import OfficialUpdatesPanel from "./OfficialUpdatesPanel";



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

// Instead of repeating headers in each call:

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   headers: {
//     Authorization: `Bearer ${import.meta.env.VITE_ADMIN_TOKEN}`
//   }
// });


const DashboardPage = () => {
  // const [disasters, setDisasters] = useState([]);
  // const [filtered, setFiltered] = useState([]);
  // const [filteredDisasters, setFilteredDisasters] = useState([]);
  const [tagFilter, setTagFilter] = useState("");
  // const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);


  // const fetchDisasters = async () => {
  //   try {
  //     const res = await axios.get(`${baseUrl}/api/disasters`,
  //       // {
  //       // headers: {
  //       //   "Authorization": `Bearer ${token}`,
  //       // },
  //       // }
  //     );
  //     // console.log(res);

  //     const sorted = res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  //     setDisasters(sorted);
  //     // setFiltered(sorted);
  //     setLoading(false);
  //   } catch (err) {
  //     console.error("Fetch error:", err.message);
  //   }
  // };

  // code: socket.off("disaster_updated") (removes all listeners for this event). : Doesn't track connection status
  // useEffect(() => {
  //   fetchDisasters();
  //   // socket.on("disaster_updated", (payload) => {
  //   //   console.log("🛰️ Real-time update received", payload);
  //   //   fetchDisasters();
  //   // });

  //   if (socket) {
  //     // socket.on("disaster_updated", ({ action, data }) => {
  //     // socket.on("disaster_updated", (updateData) => {
  //     socket.on("disaster_updated", (eventData) => {
  //       // const listener = ({ action, data }) => {

  //       // updateData will be { action: 'delete', id: 'some-id' }
  //       // console.log("🛰️ Real-time update received", action, data);
  //       // console.log("🛰️ Real-time update received", updateData.action, updateData.data);   // This log will now show the ID
  //       console.log("🛰️ Real-time update received", eventData.action, eventData.data);   // This log will now show the ID

  //       // if (action === "create") {
  //       //   setDisasters(prev => [data, ...prev]);
  //       // } else if (action === "update") {
  //       //   setDisasters(prev => prev.map(d => d.id === data.id ? data : d));
  //       // } else if (action === "delete") {
  //       //   setDisasters(prev => prev.filter(d => d.id !== data.id));
  //       // }

  //       // // re-apply filter if any tagFilter is active
  //       // handleFilter();

  //       setDisasters(prev => {
  //         let updated;

  //         const { action, id, data: disasterData } = eventData; // Destructure eventData correctly

  //         // if (action === "create") {
  //         if (action === "create") {
  //           updated = [disasterData, ...prev];      // Assuming updateData.data contains the new object
  //           // } else if (action === "update") {
  //         } else if (action === "update") {
  //           updated = prev.map(d => d.id === disasterData.id ? disasterData : d);     // Assuming updateData.data contains the updated object
  //         } else if (action === "delete") {
  //           // updated = prev.filter(d => d.id !== data.id);
  //           updated = prev.filter(d => d.id !== id);     // Here, updateData.id is used directly
  //         } else {
  //           updated = prev;
  //         }

  //         // // Apply tag filter again
  //         // if (!tagFilter.trim()) {
  //         //   setFiltered(updated);
  //         // } else {
  //         //   const filteredAgain = updated.filter(d =>
  //         //     d.tags?.some(tag =>
  //         //       tag.toLowerCase().includes(tagFilter.toLowerCase())
  //         //     )
  //         //   );
  //         //   setFiltered(filteredAgain);
  //         // }

  //         // Live tag filter
  //         // const result = !tagFilter.trim()
  //         //   ? updated
  //         //   : updated.filter(d =>
  //         //     d.tags?.some(tag =>
  //         //       tag.toLowerCase().includes(tagFilter.toLowerCase())
  //         //     )
  //         //   );

  //         // setFiltered(result);

  //         return updated;
  //       });
  //     });

  //     // socket.on("disaster_updated", listener);

  //     // return () => socket.off("disaster_updated", listener);
  //     return () => { socket.off("disaster_updated") };
  //     // }, [tagFilter]);      // <-- include this only if you want the latest tagFilter to reflect always
  //   }
  // }, [setDisasters]);      // Removed tagFilter dependency

  // useEffect(() => {
  //   fetchDisasters();
  // }, []);



  // // code: socket.off("disaster_updated", handleDisasterUpdate) (more precise removal). This version is better because it specifically removes only the handler we added.
  // useEffect(() => {
  //   fetchDisasters();

  //   const handleDisasterUpdate = (eventData) => {
  //     console.log("🛰️ Real-time update received", eventData.action, eventData.data);

  //     // // Only process if we have valid data
  //     // if (!eventData?.action || !eventData.data) {
  //     //   console.error("Invalid socket event data:", eventData);
  //     //   return;
  //     // }

  //     const { action, data, id } = eventData;

  //     if (!action || !data) return;

  //     setDisasters(prev => {
  //       // const { action, id, data: disasterData } = eventData;

  //       // if (action === "create") return [disasterData, ...prev];
  //       if (action === "create") return [data, ...prev];

  //       // if (action === "update") return prev.map(d => d.id === disasterData.id ? disasterData : d);
  //       if (action === "update") return prev.map(d => d.id === data.id ? data : d);

  //       if (action === "delete") return prev.filter(d => d.id !== id);
  //       return prev;
  //     });

  //     if (showModal) setShowModal(false); // Optional: still close modal

  //   };

  //   // Connection monitoring
  //   const onConnect = () => console.log("✅ Socket connected");
  //   const onDisconnect = () => console.log("❌ Socket disconnected");

  //   socket.on("disaster_updated", handleDisasterUpdate);
  //   socket.on("connect", onConnect);
  //   socket.on("disconnect", onDisconnect);

  //   return () => {
  //     socket.off("disaster_updated", handleDisasterUpdate);
  //     socket.off("connect", onConnect);
  //     socket.off("disconnect", onDisconnect);
  //   };
  //   // }, []);  // Empty dependency array is safe here
  // }, [showModal]);  // keep showModal only if you want modal to auto-close


  // This duplicates what your main real-time socket handler already does better — and it forces a full fetchDisasters() call, even though you're already getting the updated disaster via the socket event.
  // real-time updates without full refresh:
  // useEffect(() => {
  //   const handleDisasterUpdate = (eventData) => {
  //     if (eventData.action === 'create' || eventData.action === 'update') {
  //       fetchDisasters(); // Refresh data
  //       if (showModal) setShowModal(false); // Close modal if open
  //     }
  //   };

  //   socket.on('disaster_updated', handleDisasterUpdate);
  //   return () => socket.off('disaster_updated', handleDisasterUpdate);
  // }, [showModal]);



  // Separate useEffect for filtering bcoz on updating/creating, the web page was not getting updated, with updated data, until clicking on refresh
  // The issue is in how you're handling the socket updates and state management. The problem occurs because the tagFilter dependency in the useEffect is causing the socket listener to be recreated when the filter changes, which might lead to inconsistent behavior.
  // useEffect(() => {
  //   if (!tagFilter.trim()) {
  //     // setFiltered(disasters);
  //     setFilteredDisasters(disasters);
  //   } else {
  //     const filteredData = disasters.filter((d) =>
  //       d.tags?.some((tag) =>
  //         tag.toLowerCase().includes(tagFilter.toLowerCase())
  //       )
  //     );
  //     // setFiltered(filteredData);
  //     setFilteredDisasters(filteredData);
  //   }
  // }, [tagFilter, disasters]); // Now this handles filtering whenever tagFilter or disasters change

  // const handleFilter = () => {
  //   if (!tagFilter.trim()) return setFiltered(disasters);
  //   const filteredData = disasters.filter((d) =>
  //     d.tags?.some((tag) =>
  //       tag.toLowerCase().includes(tagFilter.toLowerCase())
  //     )
  //   );
  //   setFiltered(filteredData);
  // };


  // const formatDate = (iso) => new Date(iso).toLocaleString();      // use date-fns format instead


  // const handleDelete = async (id) => {
  //   const confirmed = window.confirm("Are you sure you want to delete this disaster?");

  //   if (!confirmed) return;

  //   try {
  //     const response = await axios.delete(`${baseUrl}/api/disasters/${id}`, {
  //       headers: {
  //         "Authorization": `Bearer ${token}`,
  //       },
  //     });

  //     if (response.data.success) {
  //       // Let the socket.io event handle the state update

  //       setDisasters(prev => prev.filter(d => d.id !== id));
  //       setFiltered(prev => prev.filter(d => d.id !== id));

  //       alert("Deleted successfully.");
  //     }
  //     //  else {
  //     //   alert(`Delete failed: ${response.data.message}`);
  //     // }

  //     // setDisasters(prev => prev.filter(d => d.id !== id));
  //     // setFiltered(prev => prev.filter(d => d.id !== id));

  //     // alert("Deleted successfully.");
  //   } catch (err) {
  //     console.error("Delete error:", err);
  //     alert(`Failed to delete: ${err.response?.data?.message || err.message}`);
  //   }
  // };

  // This will handle both create and update scenarios



  // Function to check if a disaster matches the current tag filter
  const matchesFilter = (disaster) => {
    if (!tagFilter.trim()) return true;
    return disaster.tags?.some(tag =>
      tag.toLowerCase().includes(tagFilter.toLowerCase())
    );
  };


  const handleModalClose = () => {
    setShowModal(false);
    setEditTarget(null);
    // fetchDisasters(); // Refresh the data
  };


  return (
    // <div className="p-6 max-w-7xl mx-auto">
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold">📊 Disaster Dashboard</h2>
        <div className="flex gap-2">


          <Button
            onClick={() => {
              setEditTarget(null);
              setShowModal(true);
            }}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            ➕ Add New Disaster
          </Button>

          {/* <Button
            // onClick={fetchDisasters}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            🔄 Refresh
          </Button> */}

        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Filter by tag (e.g. flood, sos)"
          className="border px-2 py-1 rounded w-full max-w-xs"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        />
        <Button
          // onClick={handleFilter}
          onClick={matchesFilter}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Filter
        </Button>
        <Button
          onClick={() => {
            setTagFilter("");
            // setFiltered(disasters);
            // setFilteredDisasters(disasters);
          }}
          className="border px-4 py-1 rounded"
        >
          Reset
        </Button>
      </div>

      <div>
        <Tabs defaultValue="listed" className="w-full gap-6">
          <TabsList className="bg-gray-100 p-1 gap-2 rounded-lg">
            <TabsTrigger value="listed">📄 Listed Disasters</TabsTrigger>
            <TabsTrigger value="broadcasted">📢 Broadcasted Disasters</TabsTrigger>
            <TabsTrigger value="social-media">Social Media Feed</TabsTrigger>
            <TabsTrigger value="nearby">📍 Nearby Disasters</TabsTrigger>
            <TabsTrigger value="official">📜 Official Updates</TabsTrigger>
          </TabsList>


          <TabsContent value="listed">
            <ListedDisasters
              // disasters={tagFilter.trim() ? filteredDisasters : disasters}
              // loading={loading}
              tagFilter={tagFilter}
              // onEdit={(d) => {
              //   setEditTarget(d);
              //   setShowModal(true);
              // }}

              onAddDisaster={() => setShowModal(true)}

            />
          </TabsContent>


          {/* <TabsContent value="listed"> */}

          {/* Disaster List */}

          {/* {loading ? (
              <p>Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500">No disasters found.</p>
            ) : (
              <div className="grid gap-4">
                {filtered.map((d) => (
                  <div
                    key={d.id}
                    className="border rounded p-4 bg-white shadow-sm hover:shadow transition"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">{d.title}</h3>
                      <span className="text-sm text-gray-500">{formatDate(d.created_at)}</span>
                    </div>

                    <p className="text-gray-700 mt-1">{d.description}</p>
                    <p className="text-sm text-gray-600 italic mt-1">📍 {d.location_name}</p>

                    <div className="flex flex-wrap gap-2 mt-2">
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

                    {d.broadcasted && (
                      <p className="mt-2 text-sm text-blue-600">✅ Broadcasted</p>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => {
                          setEditTarget(d);
                          setShowModal(true);
                        }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(d.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        ❌ Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )} */}

          {/* Modal for Create / Edit */}
          {/* {showModal && (
              // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow max-w-xl w-full">

                  <DisasterForm
                    initialData={editTarget}

                    // onClose={() => {
                    //   setShowModal(false);
                    //   setEditTarget(null);
                    // }}

                    onClose={handleModalClose}
                  />
                </div>
              </div>
            )} */}
          {/* </TabsContent> */}

          <TabsContent value="broadcasted">
            <BroadcastedDisasters
              // disasters={tagFilter.trim() ? filteredDisasters.filter(d => d.broadcasted) : disasters.filter(d => d.broadcasted)}
              // loading={loading}

              tagFilter={tagFilter}
              onAddDisaster={() => setShowModal(true)}

            />
          </TabsContent>

          <TabsContent value="social-media">
            <SocialMediaFeed
              tagFilter={tagFilter}
              onAddDisaster={() => setShowModal(true)}
            />
          </TabsContent>

          <TabsContent value="nearby">
            <NearbyDisasters
              // disasters={tagFilter.trim() ? filteredDisasters : disasters}
              // loading={loading}
              tagFilter={tagFilter}
              onAddDisaster={() => setShowModal(true)}
            />
          </TabsContent>

          <TabsContent value="official">
            <OfficialUpdatesPanel />
          </TabsContent>

        </Tabs>




        {/* Modal for Create / Edit */}
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
    </div >
  );
};


export default DashboardPage;
