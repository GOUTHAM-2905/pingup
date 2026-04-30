import Message from "../models/Message.js";
import imagekit from "../configs/imagekit.js"; 
import fs from "fs";
import User from "../models/User.js";
import { upload } from "../configs/multer.js";


const connection = {}

export const ssController = (req, res) => {
    const { userId } = req.params;
    console.log("New client connected", userId);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    connection[userId] = res;

    res.write('data: connected to SSE stream\n\n');

    req.on('close', () => {
        delete connection[userId];
        console.log("Client disconnected");
    });
};

// send message 
export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id, text } = req.body;
        const image = req.file;

        let media_url = "";
        let message_type = image ? "image" : "text";

        if (message_type === "image") {
            const fileBuffer = fs.readFileSync(image.path);

            const response = await imagekit.files.upload({
                file: fileBuffer.toString("base64"),
                fileName: image.originalname,
            });

            media_url = `${response.url}?tr=w-512,q-auto,f-webp`;

            // optional cleanup
            fs.unlinkSync(image.path);
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            media_url
        });

        res.json({ success: true, message });

        const messageWithUserData = await Message
            .findById(message._id)
            .populate("from_user_id");

        if (connection[to_user_id]) {
            connection[to_user_id].write(
                `data: ${JSON.stringify(messageWithUserData)}\n\n`
            );
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// get chat messages 
export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id } = req.body;
        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId }
            ]
        }).sort({ createdAt: 1 }).populate("from_user_id");
        await Message.updateMany({
            from_user_id: to_user_id,
            to_user_id: userId,
            seen: false
        }, { seen: true });

            res.json({ success: true, messages });
    }catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export const getUserRecentMessages = async (req, res) => {
    try{
        const { userId } = req.auth();
        const messages = await Message.find({to_user_id:userId}).populate('from_user_id to_user_id').sort({createdAt:-1});

        res.json({ success: true, messages });
    }catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
    