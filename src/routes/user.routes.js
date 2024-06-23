import {Router} from "express";

import {registerUser, loginUser, 
        logoutUser, changePassword,
        userChannel, deleteUser 
        } from "../controllers/user.controllers.js";

import {authUser} from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(authUser , logoutUser);
userRouter.route("/changePassword").patch(authUser , changePassword);
userRouter.route("/myChannel").get(authUser , userChannel);
userRouter.route("/deleteAccount").delete(authUser , deleteUser);

export default userRouter;