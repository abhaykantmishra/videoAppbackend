import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
    {
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        ownerUsername:{
            type:String,
            required:true,
        },
        videoFile:{  // cloudinary link
            type:String,
            required:true,
        },
        title:{
            type:String,
            required:true,
        },
        category:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        isPublished:{
            type:Boolean,
            required:true,
        },
        tags:[
            {
                type:String,
            }
        ],
        size:{
            type:Number,
            required:true,
        },
        views:{
            type:Number,
            default:0,
        },
        likes:{
            type:Number,
            default:0,
        },
        dislikes:{
            type:Number,
            default:0,
        },
        language:{
            type:String,
        },
        duration:{
            type:Number,
            required:true,
        },
        region:{
            type:String,
            default:"India",
        },
        cloudinaryPublicId:{
            type:String,
            required:true,
        },
        videoRatio:{
            type:String,
            required:true,
        }
    },
    {
        timestamps:true
    }
)

const Video = mongoose.model("Video" , videoSchema);

export default Video;