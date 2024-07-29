import User from "../models/user.model.js";
import Video from "../models/video.model.js"
import jwt from "jsonwebtoken";
import {deleteVideoFromClodinary,uploadImageOnCloudinary} from "../services/cloudinary.service.js";

async function registerUser(req,res){
    try {
        console.log(req.body);
        const {name, username , email , password , profileImg,isGuest} = req.body;
        if(!(name.trim()) || !(username.trim()) || !(email.trim()) || !(password.trim())  ){
            return res.status(400).json({msg:"all fields are required!"})
        }
        
        // check for existed user =>
        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if(existedUser){
            return res.status(400).json({msg:"user already existed!"})
        }
        
        // creating user =>
        if(profileImg && isGuest){
            const imguser = await User.create({
                isGuest:isGuest,
                name:name.trim(),
                username:username.trim(),
                email:email.trim(),
                password:password.trim(),
                profileImg:profileImg.trim(),
            })
            if(!imguser){
                return res.status(500).json({
                    msg:"user didn't created!"
                })}
            return res.status(200).json({
                msg:"user created successfully"
            })
        }
        const user = await User.create({
            name:name.trim(),
            username:username.trim(),
            email:email.trim(),
            password:password.trim(),
        })
        if(!user){
            return res.status(500).json({
                msg:"user didn't created!"
            })
        }
        return res.status(201).json({
            msg:"user created successfully",
            user:{_id:user._id,name:user.name, username:user.username, email:user.email}
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
            httpOnly: true,
            secure: true,
        }

        return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .json({
            msg:"user loggedIn successfuly",
            user:{
                _id:user._id,name:user.name,username:user.username,email:user.email,profileImg:user.profileImg,
            },
            accessToken:accessToken
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
        const user = req?.user ;
        const username = req.body.username;
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

async function updateUserProfile(req,res){
    try {
        const userFront = req.body.user;
        const usr = JSON.parse(userFront);
        const user = usr || req.user;
        const body = req.body;
        const file = req.file;
        console.log(file);
        if(!file){
                const newUser = await User.findByIdAndUpdate(user._id ,{
                name:body?.name,
                email:body?.email,
                })
                return res.status(200).json({
                    msg:"user updated",
                    user:newUser
                })
        }
        const filePath = file.path;
        const imageFile = await uploadImageOnCloudinary(filePath);
        if(!imageFile){
            return res.status(500).json({
                message:"Something went wrong while uploading image on cloudinary!"
             })
        }
        console.log(imageFile.url);
        const updatedUser = await User.findByIdAndUpdate(user._id ,{
            profileImg:imageFile?.url,
            name:body?.name,
            email:body?.email,
        })
        if(!updatedUser){
            return res.status(505).json({
                msg:'user did not updated!'
            })
        }
            
        // Now update user =>
        return res.status(201).json({
            mesaage:"user profile updated successfully",
            imageUrl:imageFile.url,
            user:updatedUser,  
        })
    } 
    catch (error) {
        console.log(`uploading error : ${error}`);
    }
}

async function getAnyUser(req,res){
    const id = req.body?.userId;
    if(!id){
        return res.status(400).json({
            msg:"Please provide user id"
        })
    }
    
    const user = await User.findById(id).select('-password');
    if(!user){
        return res.status(400).json({
            msg:"Invalid user id"
        })
    }
    return res.status(200).json({
        msg:"found & sent user",
        user:user
    })
}

function verifyUser(req,res){
    const givenId = req.body.userId;
    const token = req.body.token;
    if(!givenId || !token){
        return res.status(400).json({
            msg:"please provide userId and token"
        })
    }
    const decodedToken = jwt.verify(token,`${process.env.ACCESS_TOKEN_SECRET}`);
    const id = decodedToken._id;
    if(id !== givenId){
        return res.status(400).json({
            msg:"Please provide valid userId and token"
        })
    }
    return res.status(200).json({
        msg:"your access token verified"
    })
}

async function getAllUsers(req,res){

    try {
        const allUsers = await User.find({})
        return res.status(200).json({
            allUsers:allUsers
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Something went wrong!"
        })
    }
}

async function getAllGuestUsers(req,res){
   
    const allGuestUsers = await User.find({isGuest:true});
    if(!allGuestUsers){
        return res.status(500).json({
            msg:"some error accured while fetching guest users"
        })
    }
    // console.log(allGuestUsers);
    return res.status(200).json({
        allGuestUsers:allGuestUsers
    })
}

async function checkSaved(req,res){
    const userId = req.body.userId;
    const videoId = req.body.videoId;
    try {
      const user = await User.findById(req.body.userId);
    
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      const isSaved = user.savedVideos.includes(videoId);
       return res.status(200).json({ saved: isSaved });
    } catch (error) {
        res.status(500).json({ msg: 'Back-end Server Error!' });
    }
}

async function savedByUser(req,res){
    const userId = req.body.userId;
    const vidId = req.body.videoId;
    try {
        const update = await User.findByIdAndUpdate(userId,{
            $addToSet: { savedVideos: vidId }, 
        })
        if(!update){
            return res.status(400).json({
                msg:"Got some error!"
            })
        }
        return res.status(200).json({
            msg:"updated saved videos"
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg:"Got some error, while saving video!"
        })
    }
}

async function unSavedByUser(req,res){
    const userId = req.body.userId;
    const vidId = req.body.videoId;
    try {
        const update = await User.findByIdAndUpdate(userId,{
            $pull: { savedVideos: vidId }, 
        })
        if(!update){
            return res.status(400).json({
                msg:"Got some error!"
            })
        }
        return res.status(200).json({
            msg:"updated saved videos"
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg:"Got some error!"
        })
    }
}

async function getSavedVideos(req,res){
    const userId = req.body.userId;
    
    try {
        const usr = await User.findById(userId);
        if(!usr) {
            return res.status(404).json({
                msg:"user not found!"
            }) 
        }
        const savedVideos = usr.savedVideos;
        if(!savedVideos){
            return res.status(404).json({
                msg:"saved videos not found!"
            })
        }
        return res.status(200).json({
            savedVideos:savedVideos
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg:"Got some error!"
        })
    }
}

export {
    registerUser, loginUser, 
    logoutUser, changePassword,
    userChannel, deleteUser ,
    updateUserProfile ,getAnyUser,verifyUser,
    getAllUsers,getAllGuestUsers,checkSaved,
    savedByUser,unSavedByUser,getSavedVideos
}

