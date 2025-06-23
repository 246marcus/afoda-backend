import express, { Application } from "express";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import orderRoutes from "./routes/orderRoutes";

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Cookie options helper function
function getCookieOptions(): import("express-serve-static-core").CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  };
}

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
  "https://www.afoda.store",
  "https://afoda.store",
  "http://localhost:8080",
  "http://localhost:3000", // Add common dev ports
  "http://localhost:5173", // Vite default port
];

app.use(
  cors({
    origin: allowedOrigins,
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
  console.log("🔒 Secure:", req.secure);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// Test endpoint for debugging
app.get("/api/test", (req, res) => {
  res.json({
    message: "Server is working!",
    origin: req.headers.origin,
    cookies: req.cookies,
    headers: Object.keys(req.headers),
  });
});

app.get("/api/cookie-test", (req, res) => {
  res.cookie("test_cookie", "works", getCookieOptions());
  res.json({
    receivedCookies: req.cookies,
    secureConnection: req.secure,
    headers: req.headers,
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
