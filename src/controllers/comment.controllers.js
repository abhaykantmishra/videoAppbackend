import Comment from "../models/comment.model.js";

async function createComment(req,res){
   try {
        const {postedBy,postedByUsername,postedOn,comment,userImg} = req?.body;
        const newComment = await Comment.create({
            postedBy:postedBy,
            postedByUsername:postedByUsername,
            postedOn:postedOn,
            comment:comment,
            userImg:userImg,
        });

        if(!newComment){
            return res.status(500).json({
                msg:"something went wrong while creating new comment!"
            })
        }

        return res.status(201).json({
            newComment:newComment,
            msg:"new comment added"
        })
   } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Something went wrong!"
        })
   }
}

async function addReply(req,res){
    try {

        const {commentId,postedBy,postedByUsername,userImg,reply} = req.body;

        const comment = await Comment.findById(commentId);
        if(!comment){
            return res.status(404).json({
                msg:"not found any comment with give commentId"
            })
        }
        const replyData = {
            repliedBy:postedBy,
            repliedByUsername:postedByUsername,
            userImg:userImg,
            reply:reply,
        }
        const updateComment = await Comment.findByIdAndUpdate(commentId,{
            $addToSet :{
                replies:replyData
            }
        })

        if(!updateComment){
            return res.status(500).json({
                msg:"Something went wrong while adding reply!"
            })
        }
        
        return res.status(202).json({
            msg:"reply added"
        }) 
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Something went wrong!"
        })
    }
}

async function getAllVideoComment(req,res){
    try {
        const videoId = req.body.videoId;
        if(!videoId){
            return res.status(400).json({
                msg:"Please provide videoId"
            })
        }
        const allVideoComment = await Comment.find({postedOn:videoId});

        return res.status(200).json({
            comments:allVideoComment,
        }) 
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Something went wrong!"
        })
    }
}

async function deleteComment(req,res){
    try {
        const {commentId} = req.body;
        if(!commentId){
            return res.status(400).json({
                msg:"Please provide commentId!"
            })
        }
        const comment = await Comment.findById(commentId);
        if(!comment){
            return res.status(404).json({
                msg:"please provide a valid commentId!"
            })
        }
        const deletedComment = await Comment.findByIdAndDelete(commentId);
        if(!deletedComment){
            return res.status(500).json({
                msg:"Something went wrong while deleting comment!"
            })
        }
        return res.status(200).json({
            msg:"Comment Deleted successfully"
        }) 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg:"Something went wrong!"
        })
    }
}

export {
    createComment,
    addReply,
    getAllVideoComment,
    deleteComment,
}
