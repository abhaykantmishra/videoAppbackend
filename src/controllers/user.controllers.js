import User from "../models/user.model.js";
import Video from "../models/video.model.js"
import {deleteVideoFromClodinary} from "../services/cloudinary.service.js";

async function registerUser(req,res){
    try {
        const {username , email , password} = req.body;
        if(!(username.trim()) || !(email.trim()) || !(password.trim()) ){
            return res.status(400).json({msg:"all fields are required!"})
        }
        
        // check fro existed user =>
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if(existedUser){
            return res.status(400).json({msg:"user already existed!"})
        }
        
        // creating user =>
        const user = await User.create({
            username:username.trim(),
            email:email.trim(),
            password:password.trim()
        });

        return res.status(201).json({
            msg:"user created successfully",
            user:user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Something went wrong!"
        })
    }
}

async function loginUser(req,res){
    try {
        const {username , password} = req.body;
        if(!(username.trim()) || !(password.trim()) ){
            return res.status(400).json({
                msg:"all fields are required!"
            })
        }

        const user = await User.findOne({
            $or : [{username:username }, {email : username} ]
        })

        if(!user){
            return res.status(404).json({
                msg:"no such user exist!"
            })
        }
        if(password.trim() !== user.password ){
            return res.status(401).json({
                msg:"wrong password!"
            })
        }
        const accessToken = await user.generateAccessToken();

        const options = {
            HttpOnly: true,
            secure: true,
        }

        return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .json({
            msg:"user loggedIn successfuly",
            user:user
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Something went wrong!"
        })
    }
}

async function logoutUser(req,res){
    try {
        const user = req.user;
    
        const options = {
            htttpOnly: true,
            secure: true,
        }

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .json({
            message:`user ${user.username} logged out successfully`
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Something went wrong!"
        })
    }
}

async function changePassword(req,res){
    try {
        const {newPassword} = req.body;
        if( ! (newPassword.trim()) ){
            return res.status(400).json({
                msg:"all fields are required!"
            })
        }
        const user = req.user;
        if(!user){
            return res.status(401).json({
                msg:"login first to change password!"
            })
        }
        const userId = user?._id;
        let currentUser;
        try {
            currentUser = await User.findByIdAndUpdate(userId , {
                password:newPassword
            });
        } catch (err) {
            return res.send(`Something went wron while fetching user: ${err}`)
        }

        return res.status(200).json({
            message:"password changed successfully",
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Something went wrong!"
        })
    }
}

async function userChannel(req,res){
    try {
        const user = req.user;
        const username = user.username;
        const allUserVideo = await Video.find({ownerUsername:username})

        let allUserVideoLinks = new Array;
        for(let i=0 ; i<allUserVideo.length ; i++){
            allUserVideoLinks.push(allUserVideo[i].videoFile);
        }

        return res
        .status(200)
        .json({
            user:user,
            userVideos:allUserVideo,
            allUserVideoLinks:allUserVideoLinks
        })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Something went wrong!"
        })
    }
}

async function deleteUser(req,res){
    try {
        const user = req.user;
    // console.log(user);
    const userId = user?._id;
    const username = user?.username;
    let videoArray;
    try {
        videoArray = await Video.find({ownerUsername:username});
        } catch (error) {
            console.log(error);
            return res.status(500).json({message:"Something went wrong while fetching user info!"})
        };

        for(let i=0  ; i<videoArray.length ; i++){
            deleteVideoFromClodinary(videoArray[i].cloudinaryPublicId);
        };

        try {
            for(let i=0  ; i<videoArray.length ; i++){
                await Video.findByIdAndDelete(videoArray[i]._id);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({message:`Somthing went wrong while deleting videoes!`})
        }

        try {
            await User.findByIdAndDelete(userId);
        } catch (error) {
            console.log(error);
            return res.status(500).json({message:`Somthing went wrong while deleting user account!`})
        }
        const options = {
            htttpOnly: true,
            secure: true,
        }
        return res.status(200)
        .clearCookie("accessToken" ,options)
        .json({
            message:"User deleted succeefully!"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg:"Something went wrong!"
        })
    }
}


export {
    registerUser, loginUser, 
    logoutUser, changePassword,
    userChannel, deleteUser  
}