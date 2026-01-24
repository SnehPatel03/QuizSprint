import express from 'express';
import dotenv from 'dotenv'
import authRoute from './Routes/authRoutes'
import adminRoute from './Routes/adminRoutes'
import questionRoute from './Routes/questionRoutes'
import cookieParser from 'cookie-parser'
import userRoutes from './Routes/userRoutes'
dotenv.config()

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true })) 
app.use(cookieParser())

app.get("/" , (req,res) => {
    res.json({
        "messege" : "App is Running",
    })
})


app.use("/auth",authRoute)
app.use("/admin",adminRoute)
app.use("/admin/question",questionRoute)
app.use("/user",userRoutes)

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
