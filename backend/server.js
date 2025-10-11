import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import fabricRoutes from "./routes/fabricRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import creatorRoutes from "./routes/creatorRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(errorHandler);
// Routes
app.use("/api/fabrics", fabricRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/creators", creatorRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
