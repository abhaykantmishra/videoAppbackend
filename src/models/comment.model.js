import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
    {
        repliedBy:{
            type:mongoose.Types.ObjectId,
            ref:"User",
            required:true
        },
        repliedByUsername:{
            type:String,
            required:true,
        },
        userImg:{
            type:String,
            required:true,
        },
        reply:{
            type:String,
            required:true,
        }
    },
    {timestamps:true}
)

const commentSchema = new mongoose.Schema(
    {
        postedBy:{
            type:mongoose.Types.ObjectId,
            ref:"User",
            required:true,
        },
        postedByUsername:{
            type:String,
            required:true,
        },
        userImg:{
            type:String,
            required:true,
        },
        postedOn:{
            type:mongoose.Types.ObjectId,
            ref:"Video",
            required:true,
        },
        replies:[
            replySchema
        ],
        comment:{
            type:String,
            required:true,
        },
    },
    {timestamps:true}
);

const Comment = mongoose.model("Comment" , commentSchema);

export default Comment;