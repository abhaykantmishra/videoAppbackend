import express from "express";
import {authUser} from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
import {uploadVideo ,deleteVideo ,
       getAllVideos , getVideoById,
       likedByUser,unlikedByUser,checklike,
       getVideosByIdArray,getQueryVideos
 } from "../controllers/video.controllers.js"; 

const router = express.Router();    

router.route("/uploadVideo").post(
    upload.single("videoFile"),
    uploadVideo
);
router.route("/deleteVideo").delete( deleteVideo);

router.route('/getallvideos').get(getAllVideos);
router.route('/getvideobyid').post(getVideoById);
router.route('/likedbyuser').post(likedByUser);
router.route('/unlikedbyuser').post(unlikedByUser);
router.route('/check-like').post(checklike);


router.route('/getvideosbyidarray').post(getVideosByIdArray);
router.route('/getvideosbyquery').post(getQueryVideos)

export default router;