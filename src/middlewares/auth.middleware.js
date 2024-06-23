import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

async function authUser(req,res,next){
    const token = req.cookies?.accessToken;
    if(!token){
        return res.status(401).json({
            message:"Unauthorize access!"
        })
    }
    const decodedToken = jwt.verify(token,`${process.env.ACCESS_TOKEN_SECRET}`);
    const userId = decodedToken._id;
    const user = await User.findById(userId).select("-password");
    if(!user){
        return res.status(404).json({
            message:"no user found!"
        })
    }
    req.user = user;

    next();
}
export {authUser}