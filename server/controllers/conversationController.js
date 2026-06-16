import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

// Create a new group conversation
export const createGroup = async (req, res) => {
    try {
        const { groupName, participants, groupAvatar } = req.body;
        const adminId = req.user._id;

        if (!groupName || groupName.trim() === "") {
            return res.json({ success: false, message: "Group name is required" });
        }

        if (!participants || !Array.isArray(participants) || participants.length < 2) {
            return res.json({ success: false, message: "A group must have at least 2 other members" });
        }

        let uploadedAvatarUrl = "";
        if (groupAvatar) {
            const uploadResponse = await cloudinary.uploader.upload(groupAvatar);
            uploadedAvatarUrl = uploadResponse.secure_url;
        }

        // Include admin as a participant
        const allParticipants = Array.from(new Set([adminId.toString(), ...participants]));

        const newGroup = await Conversation.create({
            participants: allParticipants,
            isGroup: true,
            groupName: groupName.trim(),
            groupAvatar: uploadedAvatarUrl,
            admin: adminId
        });

        const populatedGroup = await newGroup.populate("participants", "fullname profilePic bio lastSeen");

        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all conversations (1:1 and group) for the logged-in user
export const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({
            participants: userId
        })
        .populate("participants", "fullname profilePic bio lastSeen")
        .populate("admin", "fullname profilePic")
        .sort({ updatedAt: -1 });

        res.json({ success: true, conversations });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Add members to an existing group
export const addMembers = async (req, res) => {
    try {
        const { conversationId, memberIds } = req.body;
        const userId = req.user._id;

        if (!conversationId || !memberIds || !Array.isArray(memberIds)) {
            return res.json({ success: false, message: "Invalid parameters" });
        }

        const group = await Conversation.findById(conversationId);
        if (!group) {
            return res.json({ success: false, message: "Group not found" });
        }

        if (!group.isGroup) {
            return res.json({ success: false, message: "This is not a group conversation" });
        }

        // Only group admin can add members
        if (group.admin.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Only the group admin can add members" });
        }

        // Merge existing and new participants
        const updatedParticipants = Array.from(new Set([
            ...group.participants.map(p => p.toString()),
            ...memberIds
        ]));

        group.participants = updatedParticipants;
        await group.save();

        const populatedGroup = await group.populate("participants", "fullname profilePic bio lastSeen");
        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Leave or remove a member from a group
export const removeMember = async (req, res) => {
    try {
        const { conversationId, memberId } = req.body;
        const userId = req.user._id;

        if (!conversationId || !memberId) {
            return res.json({ success: false, message: "Invalid parameters" });
        }

        const group = await Conversation.findById(conversationId);
        if (!group) {
            return res.json({ success: false, message: "Group not found" });
        }

        if (!group.isGroup) {
            return res.json({ success: false, message: "This is not a group conversation" });
        }

        const isSelfLeaving = memberId.toString() === userId.toString();
        const isAdmin = group.admin.toString() === userId.toString();

        if (!isAdmin && !isSelfLeaving) {
            return res.json({ success: false, message: "Only the group admin can remove members" });
        }

        group.participants = group.participants.filter(p => p.toString() !== memberId.toString());

        if (isSelfLeaving && isAdmin && group.participants.length > 0) {
            group.admin = group.participants[0];
        }

        if (group.participants.length === 0) {
            await Conversation.findByIdAndDelete(conversationId);
            return res.json({ success: true, message: "Group deleted since all members left" });
        }

        await group.save();
        const populatedGroup = await group.populate("participants", "fullname profilePic bio lastSeen");
        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Update group info (name or avatar)
export const updateGroupInfo = async (req, res) => {
    try {
        const { conversationId, groupName, groupAvatar } = req.body;
        const userId = req.user._id;

        const group = await Conversation.findById(conversationId);
        if (!group) {
            return res.json({ success: false, message: "Group not found" });
        }

        if (!group.isGroup) {
            return res.json({ success: false, message: "This is not a group conversation" });
        }

        if (group.admin.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Only the group admin can edit group details" });
        }

        if (groupName && groupName.trim() !== "") {
            group.groupName = groupName.trim();
        }

        if (groupAvatar) {
            const uploadResponse = await cloudinary.uploader.upload(groupAvatar);
            group.groupAvatar = uploadResponse.secure_url;
        }

        await group.save();
        const populatedGroup = await group.populate("participants", "fullname profilePic bio lastSeen");
        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message });
    }
};
