import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  createGroup,
  getConversations,
  addMembers,
  removeMember,
  updateGroupInfo,
  deleteGroup
} from "../controllers/conversationController.js";

const conversationRouter = express.Router();

conversationRouter.post("/create", protectRoute, createGroup);
conversationRouter.get("/list", protectRoute, getConversations);
conversationRouter.put("/add-members", protectRoute, addMembers);
conversationRouter.put("/remove-member", protectRoute, removeMember);
conversationRouter.put("/update-info", protectRoute, updateGroupInfo);
conversationRouter.delete("/delete", protectRoute, deleteGroup);

export default conversationRouter;
