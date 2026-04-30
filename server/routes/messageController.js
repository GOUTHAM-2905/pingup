import expres from "express";
import { sendMessage, ssController, getChatMessages } from "../controllers/messageController.js";
import { protect } from "../middlewares/auth.js";
import {upload} from "../configs/multer.js";

const messageRouter = expres.Router();

messageRouter.get("/:userId",ssController);
messageRouter.post("/send",upload.single("image"),protect,sendMessage);
messageRouter.post("/get",protect,getChatMessages);

export default messageRouter;