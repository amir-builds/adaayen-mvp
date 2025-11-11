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

import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/fabrics", fabricRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/creators", creatorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);

app.use(errorHandler);
app.get("/", (req, res) => {
  res.send("✅ Adaayien API is running successfully!");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));