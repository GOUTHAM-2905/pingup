import imagekit from "../configs/imagekit.js";
import fs from "fs";
import Post from "../models/Post.js";
import User from "../models/User.js";


//add post
export const addPost = async (req, res) => {
    try{
        const {userId} = req.auth();
        const { content, post_type } = req.body;
        const images = req.files
        let image_urls = [];

        if(images.length){
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const fileBuffer = fs.readFileSync(image.path);
                    const response = await imagekit.files.upload({
                                    file: fileBuffer.toString("base64"),
                                    fileName: image.originalname,
                                    folder:"posts"
                                });
                    
                               const url = `${response.url}?tr=w-512,q-auto,f-webp`;
                    
                                return url;
                })
            )
        }
        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        });
        res.json({ success: true, message: "Post added successfully" });

    }catch(error){
        res.json({ success: false, message: error.message });
    }

};

// get feed posts
export const getFeedPosts = async (req, res) => {
    try{
        const {userId} = req.auth();
        const user = await User.findById(userId);
        const userIds = [userId, ...user.following, ...user.connections];
        const posts = await Post.find({user:{$in:userIds}}).populate('user').sort({createdAt:-1});
        res.json({ success: true, posts });
    }catch(error){
        res.json({ success: false, message: error.message });
    }
}

// like post 
export const likePost = async (req, res) => {
    try{
        const {userId} = req.auth();
        const {postId} = req.body;

        const post = await Post.findById(postId);

        if(post.likes.includes(userId)){    
            post.likes = post.likes.filter(user => user !== userId);
            await post.save();
            return res.json({ success: true, message: "Post unliked" });
        }else{
            post.likes.push(userId);
            await post.save();
            return res.json({ success: true, message: "Post liked" });
        }

    }catch(error){
        res.json({ success: false, message: error.message });
    }   
}