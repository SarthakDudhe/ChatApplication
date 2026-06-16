import express from "express"
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUserForSidebar, markMessageAsSeen, sendMessage, deleteMessage, editMessage, reactToMessage } from "../controllers/messageController.js";


const messageRouter =express.Router();



messageRouter.get("/users",protectRoute,getUserForSidebar);
messageRouter.get("/:id",protectRoute,getMessages);
messageRouter.put("/mark/:id",protectRoute,markMessageAsSeen);
messageRouter.post("/send/:id",protectRoute,sendMessage);
messageRouter.delete("/delete/:id",protectRoute,deleteMessage);
messageRouter.put("/edit/:id",protectRoute,editMessage);
messageRouter.put("/react/:id",protectRoute,reactToMessage);
export default messageRouter;