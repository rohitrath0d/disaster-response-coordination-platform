
// import { mockUsers } from '../utils/mockUsers.js';
// import jwt from 'jsonwebtoken'; // for real users (optional)


// export const requireAuth = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   console.log("Received Auth Header:", authHeader);
//   console.log("Expected:", `Bearer ${process.env.ADMIN_TOKEN}`);


//   if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
//     return res.status(401).json({ success: false, message: 'Unauthorized (invalid token)' });
//   }


//   // ✅ 1. Check Mock Users
//   if (mockUsers[authHeader]) {
//     req.user = mockUsers[authHeader];
//     return next();
//   }


//   // ✅ 2. Real JWT Token (if you add real auth later)
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET); // e.g., Supabase/Firebase/Clerk
//     req.user = {
//       id: decoded.sub || decoded.id,
//       role: decoded.role || 'contributor',
//     };
//     return next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: "Invalid token" });
//   }

//   // next();
// };



import { mockUsers } from '../utils/mockAuth.js';
import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  // const authHeader = req.headers.authorization;
  const authHeader = req.header('Authorization');

  // if (!authHeader || !authHeader.startsWith(`Bearer ${process.env.VITE_JWT_SECRET }`)) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing or invalid token format" });
  }

  // const token = authHeader.replace("Bearer ", "");
  const token = authHeader.split(' ')[1]; // Extract token from Bearer


  // 2. Verify token structure
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    return res.status(401).json({
      success: false,
      message: "Invalid token structure"
    });
  }


  // ✅ 1. Mock Users (dev/demo mode)
  // ✅ 1. Check if token is a mock token
  // const mockUser = mockUsers[token];
  // if (mockUsers[token]) {
  // if (mockUsers) {
  //   // req.user = mockUsers[token];
  //   req.user = mockUsers;
  //   console.log("🧪 Authenticated as mock user:", req.user);
  //   return next();
  // }

  // 2. First check mock users (for development)
  if (process.env.NODE_ENV === 'development' && mockUsers[token]) {
    req.user = mockUsers[token];
    console.log("🧪 Authenticated as mock user:", req.user);
    return next();
  }

  // ✅ 2. Real JWT Token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user to request
    req.user = {
      id: decoded.sub || decoded.id,
      role: decoded.role || "contributor",
    };
    console.log("🔐 Authenticated real user:", req.user);
    return next();
  } catch (err) {
    console.error("JWT Verification failed:", err.message);


    const errorMessage = err.name === 'TokenExpiredError'
      ? "Token expired"
      : "Invalid token";

    return res.status(401).json({ success: false, message: "Invalid token" });
  }   
};
