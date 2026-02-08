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

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        // "http://localhost:5173",
        'https://quiz-sprint-client.vercel.app'
      ];
   
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "App is Running 🚀" });
});

app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/admin/question", questionRoute);
app.use("/user", userRoutes);

export default app; 