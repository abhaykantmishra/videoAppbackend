import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload file on cloudinary
        const response = await cloudinary.uploader
            .upload(localFilePath, { resource_type: 'auto' });
        // uploaded successfully on cloudinary
        fs.unlinkSync(localFilePath) 
        // remove file from server after uploading file on cloudinary.
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        // remove locally saved temporarily file from server as operation failed.
        return null;
    }
}

const deleteVideoFromClodinary = async (filePublicId) => {
    try {
        const result = cloudinary.uploader
        .destroy(filePublicId, {resource_type: 'video'})
        .then(result => console.log(result));
        console.log(result);
    } catch (error) {
        console.log("Something went wrong while deleting file from cloudinary!")
        console.log(error);
        return null;
    }
}

export { uploadOnCloudinary ,  deleteVideoFromClodinary };