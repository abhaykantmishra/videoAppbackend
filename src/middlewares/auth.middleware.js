import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

async function authUser(req,res,next){
    console.log(req.body);
    const token = req.body.token
    
    if(!token){
        return res.status(401).json({
            message:"No token provided!"
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

async function verifyToken(req,res,next){
    const userId = req.body.userId;
    const token = req.body.token;
    if(!token){
        return res.status(401).json({
            message:"No token provided!"
        })
    }
    const decodedToken = jwt.verify(token,`${process.env.ACCESS_TOKEN_SECRET}`);
    if(userId !== decodedToken._id){
        res.status(401).json({
            msg:"invalid access token!"
        })
    }
    next();
}

export {authUser,verifyToken};