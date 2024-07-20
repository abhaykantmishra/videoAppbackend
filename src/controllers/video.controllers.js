import {uploadOnCloudinary , deleteVideoFromClodinary} from "../services/cloudinary.service.js";
import Video from "../models/video.model.js";

async function uploadVideo(req,res){
    try {
        const userFromfrontEnd = req.body?.user;
        const user  = JSON.parse(userFromfrontEnd);
        const owner = user._id
        const {title,description,tags,isPublised,category,location} = req.body;
        if(!(title?.trim()))
            return res.status(400).json({
                message:"title is required!"
            })
        const file = req.file;
        console.log(file);
        
        if(!file){
            return res.status(400).json({
                message:"video file is required"
            }) 
        }
        
        // uploading video file on cloudinary =>
        const videoFilePath = file.path;
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

        const allTags = tags[0].split(',');
        const uploadedVideo = await Video.create({
            owner:owner,
            ownerUsername:user.username,
            ownerImg:user?.profileImg,
            videoFile:videoFile?.url,
            title:title,
            category:category,
            description:description,
            isPublished:isPublised,
            tags:allTags,
            size:(videoFile.bytes/(10**6)),
            duration:videoFile?.duration,
            cloudinaryPublicId:videoFile?.public_id,
            location:location,
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

async function getAllVideos(req,res){
    // const allVideos = await Video.aggregate(
    //     [ { $sample: { size: 5 } } ]
    //  )
    const allVideos = await Video.find({});
    return res.json({
        allVideos:allVideos,
    })
}

async function getVideoById(req,res){
    try {
        const video = await Video.findById(req.body.videoId)
        if(!video){
            return res.status(500).json({
                msg:"something went wrong!"
            })
        }
        return res.status(200).json({
            video:video,
        })
    } catch (error) {
        return res.status(400).json({
            msg:"wrong video id!"
        })
    }
}

async function likedByUser(req,res){
    const userId = req.body.userId;
    const vidId = req.body.videoId;
    try {
        const update = await Video.findByIdAndUpdate(vidId,{
            $addToSet: { likedBy: userId }, 
            $inc: { likes: 1 },
        })
        if(!update){
            return res.status(400).json({
                msg:"Got some error!"
            })
        }
        return res.status(200).json({
            msg:"updated Like"
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg:"Got some error!"
        })
    }
}

async function unlikedByUser(req,res){
    const userId = req.body.userId;
    const vidId = req.body.videoId;
    try {
        const update = await Video.findByIdAndUpdate(vidId,{
            $pull: { likedBy: userId }, 
            $inc: { likes: -1 },
        })
        if(!update){
            return res.status(400).json({
                msg:"Got some error!"
            })
        }
        return res.status(200).json({
            msg:"updated Like"
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            msg:"Got some error!"
        })
    }
}

async function checklike(req,res){
    const userId = req.body.userId;
    const videoId = req.body.videoId;
    // console.log(videoId);
    // console.log(userId,' ',videoId)
    try {
      const video = await Video.findById(videoId);
    //   console.log(video);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      const isLiked = video?.likedBy?.includes(userId);
       return res.status(200).json({ liked: isLiked });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
}
    
async function getVideosByIdArray(req,res){
    try {
        const idArray = req.body.Ids;
        const videos = await Video.find({_id:idArray})
        return res.status(200).json({
            videos:videos
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg:"something went wrong while fetching videos!"
        })
    }
}

async function getQueryVideos(req,res){
    const query = req.body.query;
    // console.log(query);
    const videos = await Video.find({
        $or:[{ownerUsername:query},{category:query},{tags:query}]
    })
    return res.status(200).json({
        videos:videos
    })
}

export {
    uploadVideo,
    deleteVideo,
    getAllVideos,
    getVideoById,
    unlikedByUser,
    likedByUser,
    checklike,
    getVideosByIdArray,
    getQueryVideos,
}