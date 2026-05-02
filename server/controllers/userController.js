import imagekit from "../configs/imagekit.js"; 
import User from "../models/User.js";
import Connection from "../models/Connections.js";
import fs from "fs";
import Post from "../models/Post.js";

// get user data using userId 


export const getUserData = async (req, res) => {
    try {
        
        const { userId } = req.auth();  
        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User Not Found" });
        }

        res.json({ success: true, user });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};


// update user data using userId
export const updateUserData = async (req, res) => {
    try {
        const {userId} = req.auth();
        let { username, bio, location, full_name } = req.body;

        const tempuser = await User.findById(userId);

        if (!username) username = tempuser.username;

        if (tempuser.username !== username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                username = tempuser.username;
            }
        }

        const updateData = {
            username,
            bio,
            location,
            full_name
        };

        const profile = req.files?.profile?.[0];
        const cover = req.files?.cover?.[0];

        if (profile) {
            const buffer = fs.readFileSync(profile.path);
            // console.log("imagekit:", imagekit);
            // console.log("upload type:", typeof imagekit.upload);

            const response = await imagekit.files.upload({
                file: buffer.toString("base64"),
                fileName: profile.originalname
            });

           const url = `${response.url}?tr=w-512,q-auto,f-webp`;

            updateData.profile_picture = url;
        }

        if (cover) {
            const buffer = fs.readFileSync(cover.path);

            const response = await imagekit.files.upload({
                file: buffer.toString("base64"),
                fileName: cover.originalname
            });

        const url = `${response.url}?tr=w-1280,q-auto,f-webp`;

        updateData.cover_photo = url;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

        res.json({ success: true, user, message: "Profile updated successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// find users
export const discoverUsers = async (req, res) => {
    try {
        const {userId} = req.auth();
        const { input } = req.body;

        const allUsers = await User.find({
            $or: [
                { username: new RegExp(input, 'i') },
                { email: new RegExp(input, 'i') },
                { location: new RegExp(input, 'i') },
                { full_name: new RegExp(input, 'i') }
            ]
        });

        const filteredUsers = allUsers.filter(u => u._id.toString() !== userId);

        res.json({ success: true, users: filteredUsers });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// follow user 
export const followUser = async (req, res) => {
    try {
        const {userId} = req.auth();
        const { id } = req.body;

        const currentUser = await User.findById(userId);

        if (currentUser.following.includes(id)) {
            return res.json({ success: false, message: "Already following the user" });
        }

        currentUser.following.push(id);
        await currentUser.save();

        const toUser = await User.findById(id);
        toUser.followers.push(userId);
        await toUser.save();

        res.json({ success: true, message: "now you are following the user" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// unfollow user 
export const unfollowUser = async (req, res) => {
    try {
        const {userId} = req.auth();
        const { id } = req.body;

        const currentUser = await User.findById(userId);

        currentUser.following = currentUser.following.filter(u => u.toString() !== id);
        await currentUser.save();

        const toUser = await User.findById(id);
        toUser.followers = toUser.followers.filter(u => u.toString() !== userId);
        await toUser.save();

        res.json({ success: true, message: "you have unfollowed the user" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
// send connection request   
export const sendConnectionRequest = async (req, res) => {
    try {
        const {userId} = req.auth();
        const { id } = req.body;

        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const connectionRequest = await Connection.findOne({
            from_user_id: userId,
            createdAt: { $gt: last24Hours }
        });
        if (connectionRequest>=20) {
            return res.json({ success: false, message: "You have already sent a  more than 20 connection requests in the last 24 hours" });
        }

        const connection = await Connection.findOne({ 
            $or: [
                { from_user_id: userId, to_user_id: id },
                { from_user_id: id, to_user_id: userId }
            ]
        });
        if (!connection) {
            const newConnection = await Connection.create({ from_user_id: userId, to_user_id: id });
            await inngest.send({
                name: "app/connection-request",
                data: { connectionId: newConnection._id }
            });
            return res.json({ success: true, message: "Connection request sent successfully" });
        }else if(connection && connection.status === "accepted"){
            return res.json({ success: false, message: "You are already connected with the user" });
        } 

        return res.json({ success: false, message: "Connection request pending" });
         
    }catch (error) {
        res.json({ success: false, message: error.message });
    }
};
// get user data  
export const getUserConnections = async (req, res) => {
    try {
        const {userId} = req.auth();
        const user = await User.findById(userId).populate("connections followers following");

        const connections = user.connections
        const followers = user.followers

        const following = user.following

        const pendingConnections = await Connection.find({to_user_id: userId, status: "pending"}).populate("from_user_id").map(connection => connection.from_user_id);

        res.json({ success: true, connections, followers, following, pendingConnections });
         
    }catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const acceptUserConnections = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {id}=req.body;
        const connection = await Connection.findOne({from_user_id:id,to_user_id:userId})
        if(!connection){
            return res.json({ success: false, message: "No connection found" });
        }
        const user = await User.findById(userId);
        user.connections.push(id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.connections.push(userId);
        await toUser.save();

        connection.status = "accepted";
        await connection.save();

        res.json({ success: true, message: "Connection accepted successfully" });


         
    }catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getuserProfiles = async (req, res) => {
    try {
        const {profileId} = req.body;
        const profile = await User.findById(profileId)
        if(!profile){
            return res.json({ success: false, message: "No user found" });
        }
        const posts = await Post.find({user:profileId}).populate("user")
        res.json({ success: true, profile, posts }); 
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}