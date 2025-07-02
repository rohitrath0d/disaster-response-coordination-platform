import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import disasterRoutes from './routes/disasterRoutes.js';
import blueskyRoutes from './routes/blueskyRoutes.js';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import officialUpdateRoutes from './routes/officialUpdateRoutes.js' 


dotenv.config();
const app = express();
const server = http.createServer(app);

// const io = new Server(server, {
//   cors: { origin: '*' }
// });



// ✅ Define allowed origins
const allowedOrigins = [
  // "http://localhost:5173",
  "https://disaster-response-coordination-plat-bay.vercel.app",
  "https://disaster-response-coordination-plat-pi.vercel.app"
];

app.use(express.json());    // this must come before CORS/ routes setup... VERY IMPORTANT!



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

// app.use(cors());
// app.use(express.json());


const io = new Server(server, {
  cors: {
    // origin: ["http://localhost:5173", // Frontend port     // // ✅ for local dev
    // "https://disaster-response-coordination-plat-bay.vercel.app" // ✅ for Vercel
    // ],
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
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
app.use('/api/auth', authRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/bluesky', blueskyRoutes);
app.use('/api/officialupdate', officialUpdateRoutes);



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
