import { Router } from "express";
import {createComment,
        addReply,
        getAllVideoComment,
        deleteComment,
} from "../controllers/comment.controllers.js";

const router = Router();

router.route('/createcomment').post(createComment);
router.route('/addReply').post(addReply);
router.route('/getvideocomment').post(getAllVideoComment);
router.route('/deletecomment').post(deleteComment);

export default router;