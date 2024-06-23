import {uploadOnCloudinary , deleteVideoFromClodinary} from "../services/cloudinary.service.js";
import Video from "../models/video.model.js";

async function uploadVideo(req,res){
    try {
        const user = req.user;
        const owner = user;
        const {title,description,tags,isPublised,category} = req.body;
        if(!(title?.trim()))
            return res.status(400).json({
                message:"title is required!"
            })
        const files = req.files;
        // console.log(files);
        if(!(files.videoFile?.[0]))
            return res.status(400).json({
                message:"video file is required!"
            })
        
        // uploading video file on cloudinary =>
        const videoFilePath = files.videoFile?.[0].path;
        const videoFile = await uploadOnCloudinary(videoFilePath);
        if(!videoFile)
            return res.status(500).json({
                message:"Something went wrong while uploading file on cloudinary!"
            })
        
        const videoInfo = {
            videoCloudinaryLink: videoFile?.url,
            cloudinaryPublicId:videoFile?.public_id,
            title:title,
            owner:owner,
            description:description,
            size:(videoFile.bytes/(10**6)),
            ratio:videoFile?.video?.dar
        }

        if(videoInfo.ratio !== "9:16"){
            const deleteFromClodinary = deleteVideoFromClodinary(videoInfo.cloudinaryPublicId);
            return res.status(400).json({
                msg:"video not uploaded due to not having 9:16 ratio!",
                info:deleteFromClodinary
            })
        }

        const uploadedVideo = await Video.create({
            owner:owner,
            ownerUsername:user.username,
            videoFile:videoFile?.url,
            title:title,
            category:category,
            description:description,
            isPublished:isPublised,
            tags:tags,
            size:(videoFile.bytes/(10**6)),
            duration:videoFile?.duration,
            cloudinaryPublicId:videoFile?.public_id,
            videoRatio:videoFile?.video?.dar
        })

        if(!uploadedVideo)
            return res.status(500).json({
                message:"Failed to upload video!"
            });

        return res.status(201).json({
            mesaage:"video uploaded successfully",
            videoInfo,
            video:{videoFile}
        })
    } 
    catch (error) {
        console.log(`uploading error : ${error}`);
    }
}

async function deleteVideo(req,res){
    const  user =  req.user;

    const {videoId} = req.body;

    if(!(videoId.trim()))
        return res.status(400).json({
            message:"videoId is required!"
        });
    
    let videoFile;
    try {
         videoFile = await Video.findById(videoId);
    } catch (error) {
        return res.status(404).json({message:"Video not found : Invalid videoId"});
    }
  
    if(user.username !== videoFile.ownerUsername)
        return res.status(404).json({
            message:"No such video exist for loggedIn user!"
        })
    const deletedVideo = await Video.findByIdAndDelete(videoId);
    const cloudinaryPublicId = deletedVideo.cloudinaryPublicId;
    const deleteFromClodinary = deleteVideoFromClodinary(cloudinaryPublicId);
    if(!deletedVideo)
        return res.status(500).json({
            message:"Something went wrong while deleting video!"
        })
    
    return res.status(200).json({
        message:"video deleted successfully"
    });
}



export {
    uploadVideo,
    deleteVideo,
}