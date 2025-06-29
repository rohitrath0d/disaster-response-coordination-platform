import express from 'express';
import dotenv from 'dotenv';
import disasterRoutes from './routes/disasterRoutes.js';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();
const app = express();
const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: '*' }
// });

// ✅ Define allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://disaster-response-coordination-plat-bay.vercel.app",
];

// ✅ Setup CORS for Express
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(cors());
app.use(express.json());


const io = new Server(server, {
  cors: {
    // origin: ["http://localhost:5173", // Frontend port     // // ✅ for local dev
    // "https://disaster-response-coordination-plat-bay.vercel.app" // ✅ for Vercel
    // ],
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});


// ✅ Attach Socket.IO globally
global.io = io;

io.on('connection', (socket) => {
  console.log('🛰️ Client connected:', socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});


// app.use(cors());
// app.use(express.json());

// Routes
app.use('/api/disasters', disasterRoutes);

const PORT = process.env.PORT || 5000;


// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// http.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});