import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
// import commentRouter from "./routes/comment.routes.js";

const app = express();

// middlewares =>
app.use(cors({
    origin: "https://video-app-frontend-one.vercel.app/",
    credentials: true
}))
app.use(express.json({  }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes =>
app.get('/' , (req,res) => {
    res.send("Welcome to Homepage!");
})
app.use('/api/v1' , )
app.use('/api/v1/user' , userRouter);
app.use('/api/v1/video' , videoRouter);
// app.use('/api/v1/comment' , commentRouter);

export default app;