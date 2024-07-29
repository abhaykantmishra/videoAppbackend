import {Router} from "express";

import {upload} from "../middlewares/multer.middleware.js";

import {registerUser, loginUser, 
        logoutUser, changePassword,
        userChannel, deleteUser,
        updateUserProfile ,getAnyUser,
        verifyUser,getAllUsers,
        checkSaved,
        savedByUser,
        getAllGuestUsers,
        unSavedByUser,getSavedVideos
        } from "../controllers/user.controllers.js";

import {authUser,verifyToken} from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(authUser , logoutUser);
userRouter.route("/updateprofile").post(upload.single('userImage'), updateUserProfile);
userRouter.route("/changePassword").patch(authUser , changePassword);
userRouter.route("/userchannel").post(userChannel);
userRouter.route("/deleteAccount").delete(authUser , deleteUser);

userRouter.route('/getanyuser').post(getAnyUser);
userRouter.route('/verifyuser').post(verifyUser);
userRouter.route('/allusers').get(getAllUsers);
userRouter.route('/getguestusers').get(getAllGuestUsers);

userRouter.route('/check-saved').post(checkSaved);
userRouter.route('/savedbyuser').post(savedByUser);
userRouter.route('/unsavedbyuser').post(unSavedByUser);
userRouter.route('/getsavedvideos').post(getSavedVideos);


export default userRouter;