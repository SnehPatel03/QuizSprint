import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoute from "./Routes/authRoutes";
import adminRoute from "./Routes/adminRoutes";
import questionRoute from "./Routes/questionRoutes";
import userRoutes from "./Routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ----- Middleware -----
app.use(cors({
  origin: 'https://quiz-sprint-client.vercel.app', // frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ----- Routes -----
app.get("/", (req, res) => {
  res.json({ message: "App is Running 🚀" });
});

app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/admin/question", questionRoute);
app.use("/user", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
