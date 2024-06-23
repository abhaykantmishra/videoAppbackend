import mongoose from "mongoose";

async function connectDB(uri){
    try{
        await mongoose.connect(uri);
        console.log("MONGO DB CONNECTED")
    }
    catch(err){
        console.log(`MONGO DB ERR : ${err}`);
    }
}

export {connectDB}