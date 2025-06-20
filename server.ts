import express, { Application } from "express";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS Configuration - UPDATED
const allowedOrigins = ["https://www.afoda.store"];

// Filter out undefined values
const filteredOrigins = allowedOrigins.filter(Boolean);

// CORS Configuration - Add your actual Vercel URL
app.use(
  cors({
    origin: [
      "https://www.afoda.store",
      "https://afoda.store",
      // 👈 ADD YOUR REAL URL HERE
    ],
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Add debugging middleware to log requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  console.log("🌐 Origin:", req.headers.origin);
  console.log("🍪 Cookies:", req.cookies);
  next();
});

// Routes
app.use("/api/auth", authRoutes);

// Test endpoint for debugging
app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is working!",
    origin: req.headers.origin,
    cookies: req.cookies,
    headers: Object.keys(req.headers),
  });
});

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI as string;
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
