import mongoose, { mongo } from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
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