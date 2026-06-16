import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import conversationRouter from "./routes/conversationRoutes.js";
import { Server } from "socket.io";
import User from "./models/User.js";

const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(",") 
  : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"];

//Create Express app and Http server


const app=express();
const server =http.createServer(app);

//Initalize socket.io server
export const io = new Server(server,{
    cors:{origin:allowedOrigins}
})

//Store online users
export const userSocketMap ={}; //{userId:socketId}

//socket.io connection handler

io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected ",userId);
   if(userId) userSocketMap[userId]=socket.id;
//Emit online users to all connected clients
io.emit("getOnlineUsers",Object.keys(userSocketMap));

// Join room for conversations (E2EE/Group)
socket.on("joinRooms", ({ conversationIds }) => {
    if (Array.isArray(conversationIds)) {
        conversationIds.forEach(id => {
            socket.join(id.toString());
            console.log(`User ${userId} joined room: ${id}`);
        });
    }
});

socket.on("typing",({receiverId, conversationId})=>{
    if (conversationId) {
        socket.to(conversationId.toString()).emit("userTyping",{senderId:userId, conversationId});
    } else if (receiverId) {
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("userTyping",{senderId:userId});
        }
    }
});

socket.on("stopTyping",({receiverId, conversationId})=>{
    if (conversationId) {
        socket.to(conversationId.toString()).emit("userStopTyping",{senderId:userId, conversationId});
    } else if (receiverId) {
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("userStopTyping",{senderId:userId});
        }
    }
});

socket.on("disconnect", async ()=>{
    console.log("User Disconnected ",userId);
    delete userSocketMap[userId];
    //Update lastSeen timestamp
    if(userId) await User.findByIdAndUpdate(userId,{lastSeen:new Date()});
    io.emit("getOnlineUsers",Object.keys(userSocketMap))
})

})


//Middleware setup

app.use(express.json({limit :'15mb'}))
app.use(cors({origin:allowedOrigins}))


//Routes setup
app.get("/", (req, res) => res.send("QuickChat Backend API is running successfully."));
app.use("/api/status",(re,res)=>res.send("Server is Live"));
app.use("/api/auth", userRouter)
app.use("/api/messages",messageRouter)
app.use("/api/conversations",conversationRouter)


//Connect to Mongodb

await connectDB();

if (!process.env.VERCEL) {
  const PORT=process.env.PORT || 5000;
  server.listen(PORT,()=>console.log("Server is running on PORT : ",PORT));
}

//Export server for vercel
export default server;