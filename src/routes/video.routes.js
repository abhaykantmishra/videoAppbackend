import express from "express";
import {authUser} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
import {uploadVideo ,deleteVideo , getAllVideos} from "../controllers/video.controllers.js"; 

const router = express.Router();    

router.route("/uploadVideo").post(
    upload.single("videoFile"),
    uploadVideo
);
router.route("/deleteVideo").delete( deleteVideo);

router.route('/getallvideos').get(getAllVideos);

export default router;