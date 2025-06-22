// // import { useEffect, useState } from "react";
// // import axios from "axios";
// // import { io } from "socket.io-client";
// // import DisasterForm from "../components/DisasterForm";
// // import { Dialog, DialogContent } from "../components/ui/dialog"; // or use plain div modal


// // const socket = io("http://localhost:5000"); // make sure this matches backend

// // const DashboardPage = () => {
// //   const [disasters, setDisasters] = useState([]);
// //   const [filtered, setFiltered] = useState([]);
// //   const [tagFilter, setTagFilter] = useState("");
// //   const [loading, setLoading] = useState(true);

// //   const [showModal, setShowModal] = useState(false);
// //   const [editTarget, setEditTarget] = useState(null);


// //   const fetchDisasters = async () => {
// //     try {

// //       const res = await axios.get("http://localhost:5000/api/disasters", {
// //         headers: {
// //           Authorization: "Bearer 9870afe4e87f6640373778c7e2fef30bab86ea4a195bde0f14a511bb52f0e3b2", // Replace with your actual ADMIN_TOKEN
// //         },
// //       });
// //       const sorted = res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
// //       setDisasters(sorted);
// //       setFiltered(sorted);
// //       setLoading(false);
// //     } catch (err) {
// //       console.error("Fetch error:", err.message);
// //     }
// //   };

// //   // useEffect(() => {
// //   //   fetchDisasters();
// //   // }, []);

// //   useEffect(() => {
// //   fetchDisasters(); // Initial fetch

// //   socket.on("disaster_updated", (payload) => {
// //     console.log("🛰️ Real-time update received:", payload);
// //     fetchDisasters(); // 🔄 Re-fetch when disaster is created/updated
// //   });

// //   return () => {
// //     socket.off("disaster_updated"); // Clean up on unmount
// //   };
// // }, []);


// //   const handleFilter = () => {
// //     if (!tagFilter.trim()) {
// //       setFiltered(disasters);
// //     } else {
// //       setFiltered(
// //         disasters.filter(d =>
// //           d.tags?.some(tag =>
// //             tag.toLowerCase().includes(tagFilter.toLowerCase())
// //           )
// //         )
// //       );
// //     }
// //   };



// //   const formatDate = (iso) => new Date(iso).toLocaleString();

// //   return (
// //     <div className="p-6 max-w-6xl mx-auto">
// //       <div className="flex items-center justify-between mb-4">
// //         <h2 className="text-3xl font-bold">📊 Disaster Dashboard</h2>
// //         <button
// //           onClick={fetchDisasters}
// //           className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
// //         >
// //           🔄 Refresh
// //         </button>
// //       </div>

// //       <div className="flex gap-2 mb-4">
// //         <input
// //           type="text"
// //           placeholder="Filter by tag (e.g. flood, sos)"
// //           className="border px-2 py-1 rounded w-full max-w-xs"
// //           value={tagFilter}
// //           onChange={(e) => setTagFilter(e.target.value)}
// //         />
// //         <button
// //           onClick={handleFilter}
// //           className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
// //         >
// //           Filter
// //         </button>
// //         <button
// //           onClick={() => {
// //             setTagFilter("");
// //             setFiltered(disasters);
// //           }}
// //           className="border px-4 py-1 rounded"
// //         >
// //           Reset
// //         </button>
// //       </div>

// //       {loading ? (
// //         <p>Loading...</p>
// //       ) : filtered.length === 0 ? (
// //         <p>No disasters found.</p>
// //       ) : (
// //         <div className="grid gap-4">
// //           {filtered.map((d) => (
// //             <div
// //               key={d.id}
// //               className="border rounded p-4 bg-white shadow-sm hover:shadow transition"
// //             >
// //               <div className="flex justify-between items-center">
// //                 <h3 className="text-xl font-bold">{d.title}</h3>
// //                 <span className="text-sm text-gray-500">
// //                   {formatDate(d.created_at)}
// //                 </span>
// //               </div>

// //               <p className="text-gray-700 mt-1">{d.description}</p>

// //               <p className="text-sm text-gray-600 italic mt-1">📍 {d.location_name}</p>

// //               <div className="flex flex-wrap gap-2 mt-2">
// //                 {d.tags?.map((tag, idx) => (
// //                   <span
// //                     key={idx}
// //                     className={`px-2 py-0.5 rounded text-sm ${/sos|urgent|emergency/.test(tag)
// //                         ? "bg-red-600 text-white"
// //                         : "bg-gray-200 text-gray-800"
// //                       }`}
// //                   >
// //                     #{tag}
// //                   </span>
// //                 ))}
// //               </div>

// //               {d.broadcasted && (
// //                 <p className="mt-2 text-sm text-blue-600">✅ Broadcasted</p>
// //               )}
// //             </div>
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default DashboardPage;



// import { useEffect, useState } from "react";
// import axios from "axios";
// import { io } from "socket.io-client";
// import DisasterForm from "./DisasterForm";
// // import { Dialog, DialogContent } from "../../components/ui/dialog";

// const baseUrl = import.meta.env.VITE_API_URL;
// const token = import.meta.env.VITE_ADMIN_TOKEN

// // const socket = io("http://localhost:5000");

// const socket = io(baseUrl); // make sure this matches backend

// const DashboardPage = () => {
//   const [disasters, setDisasters] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [tagFilter, setTagFilter] = useState("");
//   const [loading, setLoading] = useState(true);

//   const [showModal, setShowModal] = useState(false);
//   const [editTarget, setEditTarget] = useState(null);

//   const fetchDisasters = async () => {
//     // setLoading(true);
//     try {
//       const res = await axios.get(`${baseUrl}/api/disasters`, {
//         headers: {
//           // Authorization: "Bearer 9870afe4e87f6640373778c7e2fef30bab86ea4a195bde0f14a511bb52f0e3b2",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       // const res = await axios.get(`${baseUrl}/api/disasters`);

//       const sorted = res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
//       setDisasters(sorted);
//       setFiltered(sorted);
//       setLoading(false);
//     } catch (err) {
//       console.error("Fetch error:", err.message);
//     }
//   };

//   useEffect(() => {
//     fetchDisasters(); // Initial fetch
//     socket.on("disaster_updated", (payload) => {
//       console.log("🛰️ Real-time update received", payload);
//       fetchDisasters(); // Refresh list on updates
//     });

//     return () => {
//       socket.off("disaster_updated");
//     };

//   }, []);

//   const handleFilter = () => {
//     // if (!tagFilter.trim()) {
//     // return setFiltered(disasters);
//     // } else {
//     //   setFiltered(
//     //     disasters.filter(d =>
//     //       d.tags?.some(tag =>
//     //         tag.toLowerCase().includes(tagFilter.toLowerCase())
//     //       )
//     //     )
//     //   );
//     // }

//     if (!tagFilter.trim()) return setFiltered(disasters);
//     const filteredData = disasters.filter(d =>
//       d.tags?.some(tag =>
//         tag.toLowerCase().includes(tagFilter.toLowerCase())
//       )
//     );
//     setFiltered(filteredData);

//   };

//   const formatDate = iso => new Date(iso).toLocaleString();

//   const handleDelete = async (id) => {
//     const confirmed = window.confirm("Are you sure you want to delete this disaster?");
//     if (!confirmed) return;

//     try {
//       await axios.delete(`${baseUrl}/api/disasters/${id}`, {
//         headers: {
//           // Authorization: "Bearer 9870afe4e87f6640373778c7e2fef30bab86ea4a195bde0f14a511bb52f0e3b2",
//           Authorization: `Bearer ${token}`,
//         }
//       });
//       alert("Deleted successfully.");
//     } catch (err) {
//       console.error("Delete error:", err);
//       alert("Failed to delete.");
//     }
//   };


//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-3xl font-bold">📊 Disaster Dashboard</h2>
//         <div className="flex gap-2">
//           <button
//             onClick={() => {
//               setEditTarget(null);
//               setShowModal(true);
//             }}
//             className="bg-green-700 text-white px-4 py-2 rounded"
//           >
//             ➕ Add New Disaster
//           </button>
//           <button
//             onClick={fetchDisasters}
//             className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
//           >
//             🔄 Refresh
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-2 mb-4">
//         <input
//           type="text"
//           placeholder="Filter by tag (e.g. flood, sos)"
//           className="border px-2 py-1 rounded w-full max-w-xs"
//           value={tagFilter}
//           onChange={(e) => setTagFilter(e.target.value)}
//         />
//         <button
//           onClick={handleFilter}
//           className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
//         >
//           Filter
//         </button>
//         <button
//           onClick={() => {
//             setTagFilter("");
//             setFiltered(disasters);
//           }}
//           className="border px-4 py-1 rounded"
//         >
//           Reset
//         </button>
//       </div>


//       {/* {loading ? (
//         <p>Loading...</p>
//       ) : filtered.length === 0 ? (
//         <p>No disasters found.</p>
//       ) : (
//         <div className="grid gap-4">
//           {filtered.map((d) => (
//             <div
//               key={d.id}
//               className="border rounded p-4 bg-white shadow-sm hover:shadow transition relative"
//             >
//               <div className="absolute top-2 right-2 flex gap-2">
//                 <button onClick={() => {
//                   setEditTarget(d);
//                   setShowModal(true);
//                 }} className="text-blue-600 hover:text-blue-800">📝</button>
//                 <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:text-red-800">🗑️</button>
//               </div>

//               <div className="flex justify-between items-center">
//                 <h3 className="text-xl font-bold">{d.title}</h3>
//                 <span className="text-sm text-gray-500">
//                   {formatDate(d.created_at)}  
//                 </span>
//               </div>

//               <p className="text-gray-700 mt-1">{d.description}</p>
//               <p className="text-sm text-gray-600 italic mt-1">📍 {d.location_name}</p>

//               <div className="flex flex-wrap gap-2 mt-2">
//                 {d.tags?.map((tag, idx) => (
//                   <span
//                     key={idx}
//                     className={`px-2 py-0.5 rounded text-sm ${/sos|urgent|emergency/.test(tag)
//                       ? "bg-red-600 text-white"
//                       : "bg-gray-200 text-gray-800"
//                       }`}
//                   >
//                     #{tag}
//                   </span>
//                 ))}
//               </div>

//               {d.broadcasted && (
//                 <p className="mt-2 text-sm text-blue-600">✅ Broadcasted</p>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//        <div className="flex gap-2 mt-3">
//                 <button
//                   onClick={() => {
//                     setEditTarget(d);
//                     setShowModal(true);
//                   }}
//                   className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
//                 >
//                   ✏️ Edit
//                 </button>
//                 <button
//                   onClick={async () => {
//                     const ok = confirm("Delete this disaster?");
//                     if (!ok) return;
//                     try {
//                       await axios.delete(`${baseUrl}/api/disasters/${d.id}`);
//                       fetchDisasters();
//                     } catch (err) {
//                       console.error("Delete failed:", err);
//                       alert("Delete failed");
//                     }
//                   }}
//                   className="bg-red-600 text-white px-3 py-1 rounded text-sm"
//                 >
//                   ❌ Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )} */}


//        {loading ? (
//         <p>Loading...</p>
//       ) : filtered.length === 0 ? (
//         <p>No disasters found.</p>
//       ) : (
//         <div className="grid gap-4">
//           {filtered.map((d) => (
//             <div
//               key={d.id}
//               className="border rounded p-4 bg-white shadow-sm hover:shadow transition"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className="text-xl font-bold">{d.title}</h3>
//                 <span className="text-sm text-gray-500">{formatDate(d.created_at)}</span>
//               </div>

//               <p className="text-gray-700 mt-1">{d.description}</p>
//               <p className="text-sm text-gray-600 italic mt-1">📍 {d.location_name}</p>

//               <div className="flex flex-wrap gap-2 mt-2">
//                 {d.tags?.map((tag, idx) => (
//                   <span
//                     key={idx}
//                     className={`px-2 py-0.5 rounded text-sm ${
//                       /sos|urgent|emergency/.test(tag)
//                         ? "bg-red-600 text-white"
//                         : "bg-gray-200 text-gray-800"
//                     }`}
//                   >
//                     #{tag}
//                   </span>
//                 ))}
//               </div>

//               {d.broadcasted && (
//                 <p className="mt-2 text-sm text-blue-600">✅ Broadcasted</p>
//               )}

//               <div className="flex gap-2 mt-3">
//                 <button
//                   onClick={() => {
//                     setEditTarget(d);
//                     setShowModal(true);
//                   }}
//                   className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
//                 >
//                   ✏️ Edit
//                 </button>
//                 <button
//                   onClick={async () => {
//                     const ok = confirm("Delete this disaster?");
//                     if (!ok) return;
//                     try {
//                       await axios.delete(`${baseUrl}/api/disasters/${d.id}`);
//                       fetchDisasters();
//                     } catch (err) {
//                       console.error("Delete failed:", err);
//                       alert("Delete failed");
//                     }
//                   }}
//                   className="bg-red-600 text-white px-3 py-1 rounded text-sm"
//                 >
//                   ❌ Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}


//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded shadow max-w-xl w-full">

//             {/* <Dialog open={showModal} onOpenChange={setShowModal}> */}
//             {/* // <div open={showModal} onOpenChange={setShowModal}> */}
//             {/* <DialogContent> */}

//             <DisasterForm
//               // defaultValues={editTarget || {}}
//               // isEdit={!!editTarget}
//               // onSuccess={() => {
//               //   fetchDisasters();
//               //   setShowModal(false);
//               //   setEditTarget(null);
//               // }}

//               // ✅ DisasterForm Required Props:
//               // null or existing disaster object
//               initialData={editTarget}      // null or existing disaster object
//               onClose={() => {              //  // callback to close modal after submit
//                 setShowModal(false);
//                 setEditTarget(null);
//               }}
//             />
//           </div>
//           {/* </Dialog> */}
//         </div>

//       )}

//       {loading ? (
//         <p>Loading...</p>
//       ) : filtered.length === 0 ? (
//         <p>No disasters found.</p>
//       ) : (
//         <div className="grid gap-4">
//           {filtered.map((d) => (
//             <div
//               key={d.id}
//               className="border rounded p-4 bg-white shadow-sm hover:shadow transition"
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className="text-xl font-bold">{d.title}</h3>
//                 <span className="text-sm text-gray-500">
//                   {formatDate(d.created_at)}
//                 </span>
//               </div>

//               <p className="text-gray-700 mt-1">{d.description}</p>
//               <p className="text-sm text-gray-600 italic mt-1">📍 {d.location_name}</p>

//               <div className="flex flex-wrap gap-2 mt-2">
//                 {d.tags?.map((tag, idx) => (
//                   <span
//                     key={idx}
//                     className={`px-2 py-0.5 rounded text-sm ${/sos|urgent|emergency/.test(tag)
//                       ? "bg-red-600 text-white"
//                       : "bg-gray-200 text-gray-800"
//                       }`}
//                   >
//                     #{tag}
//                   </span>
//                 ))}
//               </div>

//               {d.broadcasted && (
//                 <p className="mt-2 text-sm text-blue-600">✅ Broadcasted</p>
//               )}

//               <div className="flex gap-2 mt-3">
//                 <button
//                   onClick={() => {
//                     setEditTarget(d);
//                     setShowModal(true);
//                   }}
//                   className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
//                 >
//                   ✏️ Edit
//                 </button>
//                 <button
//                   onClick={async () => {
//                     const ok = confirm("Delete this disaster?");
//                     if (!ok) return;

//                     try {
//                       await axios.delete(`http://localhost:5000/api/disasters/${d.id}`, {
//                         headers: {
//                           Authorization: "Bearer 9870afe4e87f6640373778c7e2fef30bab86ea4a195bde0f14a511bb52f0e3b2",
//                         },
//                       });
//                       fetchDisasters();
//                     } catch (err) {
//                       console.error("Delete failed:", err);
//                       alert("Delete failed");
//                     }
//                   }}
//                   className="bg-red-600 text-white px-3 py-1 rounded text-sm"
//                 >
//                   ❌ Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DashboardPage;







import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import DisasterForm from "./DisasterForm";


const baseUrl = import.meta.env.VITE_API_URL;
const token = import.meta.env.VITE_ADMIN_TOKEN;
const socket = io(baseUrl); // Socket connected to backend

const DashboardPage = () => {
  const [disasters, setDisasters] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tagFilter, setTagFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetchDisasters = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/disasters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sorted = res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setDisasters(sorted);
      setFiltered(sorted);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err.message);
    }
  };

  useEffect(() => {
    fetchDisasters();
    socket.on("disaster_updated", (payload) => {
      console.log("🛰️ Real-time update received", payload);
      fetchDisasters();
    });
    return () => socket.off("disaster_updated");
  }, []);

  const handleFilter = () => {
    if (!tagFilter.trim()) return setFiltered(disasters);
    const filteredData = disasters.filter((d) =>
      d.tags?.some((tag) =>
        tag.toLowerCase().includes(tagFilter.toLowerCase())
      )
    );
    setFiltered(filteredData);
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this disaster?");
    if (!confirmed) return;

    try {
      await axios.delete(`${baseUrl}/api/disasters/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold">📊 Disaster Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditTarget(null);
              setShowModal(true);
            }}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            ➕ Add New Disaster
          </button>
          <button
            onClick={fetchDisasters}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            🔄 Refresh
          </button>
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
        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Filter
        </button>
        <button
          onClick={() => {
            setTagFilter("");
            setFiltered(disasters);
          }}
          className="border px-4 py-1 rounded"
        >
          Reset
        </button>
      </div>

      {/* Disaster List */}
      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No disasters found.</p>
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
                    className={`px-2 py-0.5 rounded text-sm ${
                      /sos|urgent|emergency/.test(tag)
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
                <button
                  onClick={() => {
                    setEditTarget(d);
                    setShowModal(true);
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  ❌ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create / Edit */}
      {showModal && (
        // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-xl w-full">
            <DisasterForm
              initialData={editTarget}
              onClose={() => {
                setShowModal(false);
                setEditTarget(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
