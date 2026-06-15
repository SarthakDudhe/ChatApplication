 import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io,userSocketMap } from "../server.js";
 //Get all users except the logged in user




export const getUserForSidebar= async (req,res) => {
    try {
        const userId=req.user._id;
        const filteredUsers=await User.find({_id: {$ne: userId}}).select("-password");

    //Count number of messages not seen

    const unseenMessages= {}
    const promises=filteredUsers.map(async (user)=>{
        const messages=await Message.find({senderId:user._id,receiverId:userId,seen:false})
    
        if (messages.length>0) {
            unseenMessages[user._id]=messages.length;
            
        }
     })
     await Promise.all(promises);
     res.json({success:true,users:filteredUsers,unseenMessages})

    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}


//Get all messages for selected user

export const getMessages =async (req,res) => {
    try {
        const {id:selectedUserId}=req.params;
        const myId=req.user._id;

        const messages= await Message.find({
            $or:[
                {senderId:myId,receiverId:selectedUserId},
                {senderId:selectedUserId,receiverId:myId},
            ]
        }).populate('replyTo','text image senderId deleted')
     await Message.updateMany({senderId:selectedUserId,receiverId:myId},{seen:true});

     res.json({success:true,messages})

    } catch (error) {
         console.log(error.message)
        res.json({success:false,message:error.message})
    }
}



//api to mark message as seen using message id

export const markMessageAsSeen =async (req,res) => {
    try {
        const {id} =req.params;
        await Message.findByIdAndUpdate(id,{seen:true});
        res.json({success:true})
    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}

//Send messages to selected users

export const sendMessage=async (req,res) => {
    try {
        const {text,image,replyTo}= req.body;
        const receiverId =req.params.id;
        const senderId=req.user._id;
let imageUrl;

if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image)
    imageUrl =uploadResponse.secure_url;
}

let newMessage = await Message.create({
    senderId,
    receiverId,
    text,
    image:imageUrl,
    replyTo:replyTo || null
})

//Populate replyTo before sending
if (replyTo) {
    newMessage = await newMessage.populate('replyTo','text image senderId deleted')
}

//Emit the new messages to the receivers socket

const receiverSocketId = userSocketMap[receiverId];
if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage",newMessage)
}


res.json({success:true,newMessage})

    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}


//Delete a message (soft delete - only sender can delete)

export const deleteMessage =async (req,res) => {
    try {
        const {id} =req.params;
        const userId=req.user._id;

        const message = await Message.findById(id);
        if (!message) {
            return res.json({success:false,message:"Message not found"})
        }

        //Only sender can delete their own message
        if (message.senderId.toString() !== userId.toString()) {
            return res.json({success:false,message:"You can only delete your own messages"})
        }

        message.deleted = true;
        message.text = "";
        message.image = "";
        await message.save();

        //Emit to receiver for real-time sync
        const receiverSocketId = userSocketMap[message.receiverId.toString()];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted",{messageId:id})
        }

        res.json({success:true,message:"Message deleted"})

    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}


//Edit a message (only sender can edit, only text messages, within 15 min)

export const editMessage =async (req,res) => {
    try {
        const {id} =req.params;
        const {text} =req.body;
        const userId=req.user._id;

        if (!text || text.trim() === "") {
            return res.json({success:false,message:"Message text cannot be empty"})
        }

        const message = await Message.findById(id);
        if (!message) {
            return res.json({success:false,message:"Message not found"})
        }

        if (message.senderId.toString() !== userId.toString()) {
            return res.json({success:false,message:"You can only edit your own messages"})
        }

        if (message.deleted) {
            return res.json({success:false,message:"Cannot edit a deleted message"})
        }

        if (message.image) {
            return res.json({success:false,message:"Cannot edit image messages"})
        }

        //Check 15 minute edit window
        const timeDiff = Date.now() - new Date(message.createdAt).getTime();
        const fifteenMinutes = 15 * 60 * 1000;
        if (timeDiff > fifteenMinutes) {
            return res.json({success:false,message:"Can only edit messages within 15 minutes"})
        }

        message.text = text.trim();
        message.editedAt = new Date();
        await message.save();

        //Emit to receiver for real-time sync
        const receiverSocketId = userSocketMap[message.receiverId.toString()];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageEdited",{messageId:id,text:message.text,editedAt:message.editedAt})
        }

        res.json({success:true,message:"Message edited",updatedMessage:message})

    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})
    }
}
