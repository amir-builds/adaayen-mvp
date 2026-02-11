import 'dotenv/config'; // load .env early so other modules (like upload middleware) can read env vars
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import fabricRoutes from "./routes/fabricRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import creatorRoutes from "./routes/creatorRoutes.js";
import adminRoutes from "./routes/admin.js";
import cartRoutes from "./routes/cartRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

connectDB();

// CORS configuration with environment variable support
const allowedOrigins = [
  'http://localhost:5173',  // Local development
  'http://localhost:3000',  // Alternative local port
  'https://adaayein.vercel.app',  // Production frontend
  process.env.FRONTEND_ORIGIN, // Additional configured origin
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/fabrics", fabricRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/creators", creatorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/settings", settingsRoutes);

app.use(errorHandler);
app.get("/", (req, res) => {
  res.send("✅ Adaayien API is running successfully!");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));