import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import visitorRoutes from "./routes/visitorRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Set allowed origins for production/development clients (Added https:// to Netlify)
const allowedOrigins = [
  "http://localhost:5001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://safeentry-nu.vercel.app",
  "https://safeentry4home.netlify.app", // Fixed missing protocol
  process.env.CLIENT_URL,
].filter(Boolean);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // If you want strict security, change the below to callback(new Error("Not allowed by CORS"))
      return callback(null, true); 
    },
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Request logger for easy debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/users", userRoutes);
app.use("/api/deliveries", deliveryRoutes);

const PORT = process.env.PORT || 5000; // Added fallback port

// Database Connection & Server Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });