import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { v2 as cloudinary} from "cloudinary";

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';




import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const PORT = process.env.PORT || 5000;



//_: middle wares
app.use(express.json({ limit: '10mb' })); // note: For Parsing req.body when it's sent as raw json
app.use(express.urlencoded({limit: '10mb',extended:true})); // note: For Parsing req.body when it's sent as x-www-form-urlencoded
app.use(cookieParser());




//_: routes
app.use("/auth", authRoutes);
app.use("/users",userRoutes);
app.use("/posts",postRoutes);
app.use("/notifications",notificationRoutes);


app.listen(PORT, ()=> {
    console.log(`Server is Running on PORT ${PORT}`);
    connectMongoDB();
});