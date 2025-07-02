import { io } from "socket.io-client";
import toast from "react-hot-toast";


const baseUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token") || import.meta.env.VITE_JWT_SECRET;

export const socket = io(baseUrl, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  extraHeaders: {
    Authorization: `Bearer ${token}`,
  },
});

// ✅ Socket connection status handlers
socket.on("connect", () => {
  socket.on("connect", () => {
    toast.success("🔌 Connected to server!");
  });
  console.log("✅ Socket.IO connected:", socket.id);

});

socket.on("disconnect", (reason) => {
  toast.error("❌ Socket.IO disconnected:", reason)
  console.warn("❌ Socket.IO disconnected:", reason);
});

socket.on("connect_error", (err) => {
  toast.error("🚨 Socket.IO connection error:", err.message);
  console.error("🚨 Socket.IO connection error:", err.message);
});
