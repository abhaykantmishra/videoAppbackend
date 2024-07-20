import mongoose, { mongo } from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        isGuest:{
            type:Boolean,
            default:false,
        },
        username:{
            type:String,
            unique:true,
            required:true,
        },
        email:{
            type:String,
            unique:true,
            required:true,
        },
        password:{
            type:String,
            required:true,
        },
        name:{
            type:String,
            required:true,
        },
        profileImg:{
            type:String, // cloudinary img url
            default:'http://res.cloudinary.com/dcqgytpzz/image/upload/v1719572744/posmb21ih5ajzyxxrw3h.jpg',
        },
        savedVideos:[
            {
                type:mongoose.Schema.Types.ObjectId, 
                ref: 'Video',
            }
        ]
    },
    {
        timestamps:true
    }
);

userSchema.methods.generateAccessToken = function () {
    const jwtToken = jwt.sign(
        {
            _id:this._id,
            username:this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:`${process.env.ACCESS_TOKEN_EXPIRE}`}
    );

    return jwtToken;
}

const User = mongoose.model("User" , userSchema);

export default User;