import express from "express";
import {authUser} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
import {uploadVideo ,deleteVideo} from "../controllers/video.controllers.js"; 

const router = express.Router();    

router.route("/uploadVideo").post(
    authUser,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        }
    ]),
    uploadVideo
);

router.route("/deleteVideo").delete(authUser , deleteVideo);

export default router;