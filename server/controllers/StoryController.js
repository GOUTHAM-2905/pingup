import Story from "../models/Story.js";

import User from "../models/User.js";
import imagekit from "../configs/imagekit.js"; 
import fs from "fs";
import { upload } from "../configs/multer.js";
import { inngest } from "../Inngest/index.js";


export const addUserStory = async (req, res) => {
    try{
        const {userId} = req.auth();
        const { content, media_type, background_color } = req.body;
        const media = req.file;
        let media_url = "";
        if(media_type == 'image' || media_type == 'video'){
            const fileBuffer = fs.readFileSync(media.path);
            const response = await imagekit.files.upload({
                            file: fileBuffer.toString("base64"),
                            fileName: media.originalname,
                            folder:"stories"
                        });
            media_url = response.url;
        }
        const story = await Story.create({
            user: userId,
            content,
            media_url,
            media_type,
            background_color
        }); 
        await inngest.send({
            name:"app/story.delete",
            data:{storyId:story._id}
        });
        res.json({ success: true, message: "Story added successfully"});
    }catch(error){
        res.json({ success: false, message: error.message });
    }
}

export const getStories = async (req, res) => {
    try{
        const {userId} = req.auth();
        const user = await User.findById(userId);
        const userIds = [userId, ...user.following, ...user.connections];
        const stries = await story.find({user:{$in:userIds}}).populate('user').sort({createdAt:-1});
        res.json({ success: true, stries });
    }catch(error){
        res.json({ success: false, message: error.message });
    }
}