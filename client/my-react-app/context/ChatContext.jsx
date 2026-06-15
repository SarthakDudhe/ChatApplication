import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios"
import toast from "react-hot-toast";



export const ChatContext= createContext();



export const ChatProvider = ({children})=>{
  
  
  const [messages,setMessages] =useState([]);
  const [users,setUsers]=useState([]);
  const [selectedUser,setSelectedUser]=useState(null)
  const [unseenMessages,setUnseenMessages]=useState({})
  const [typingUsers,setTypingUsers]=useState({})
  
  const {socket,axios}=useContext(AuthContext);


//function to get all users for sidebar

const getUsers = async () => {
    try {
        const {data} =await axios.get("/api/messages/users");
        if (data.success) {
            setUsers(data.users)
            setUnseenMessages(data.unseenMessages)
        }
    } catch (error) {
        toast.error(error.message)
    }
}

//function to get messages for selected user

const getMessages = async (userId) => {
    try {
        const {data} = await axios.get(`/api/messages/${userId}`);
        if (data.success) {
            setMessages(data.messages)
        }


    } catch (error) {
        toast.error(error.message)
    }
}

//Function to send message to selected user

const sendMessage =async (messageData) => {
    try {
        const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
        if (data.success){
            setMessages((prevMessages)=>[...prevMessages,data.newMessage])
        }
        else{
              toast.error(error.message)
        }
    } catch (error) {
         toast.error(error.message)
    }
}


//Functions to emit typing events

const emitTyping = (receiverId) => {
    if (socket) socket.emit("typing", { receiverId });
}

const emitStopTyping = (receiverId) => {
    if (socket) socket.emit("stopTyping", { receiverId });
}

// Function to subscribe to message for selected user

const subscribeToMessages =async ()=>{
    if(!socket) return;

    socket.on("newMessage",(newMessage)=>{
        if (selectedUser && newMessage.senderId === selectedUser._id) {
            newMessage.seen = true;
            setMessages((prevMessages)=>[...prevMessages,newMessage]);
           axios.put(`/api/messages/mark/${newMessage._id}`)
        }else{
            setUnseenMessages((prevUnseenMessages)=>({
                ...prevUnseenMessages,[newMessage.senderId] : 
                prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
            }))
        }
    })

    socket.on("userTyping",({senderId})=>{
        setTypingUsers(prev=>({...prev,[senderId]:true}))
    })

    socket.on("userStopTyping",({senderId})=>{
        setTypingUsers(prev=>{
            const updated={...prev};
            delete updated[senderId];
            return updated;
        })
    })
}

//function to unsubscribe from messages

const unsubscribeFromMessages = ()=>{
    if (socket) {
        socket.off("newMessage");
        socket.off("userTyping");
        socket.off("userStopTyping");
    }
}


useEffect(()=>{
subscribeToMessages();
return ()=>unsubscribeFromMessages();
},[socket,selectedUser])




  
  const value ={
messages,users,selectedUser,getUsers,setMessages,sendMessage,getMessages,setSelectedUser,unseenMessages,setUnseenMessages,typingUsers,emitTyping,emitStopTyping
  }

  return (<ChatContext.Provider value={value}>
             {children}
    </ChatContext.Provider>)
}