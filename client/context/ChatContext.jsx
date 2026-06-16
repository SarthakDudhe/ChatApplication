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
  const [replyingTo,setReplyingTo]=useState(null)
  
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
        const payload = {...messageData};
        if (replyingTo) {
            payload.replyTo = replyingTo._id;
        }
        const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,payload);
        if (data.success){
            setMessages((prevMessages)=>[...prevMessages,data.newMessage])
            setReplyingTo(null)
        }
        else{
              toast.error(data.message)
        }
    } catch (error) {
         toast.error(error.message)
    }
}


//Function to delete a message

const deleteMessage = async (messageId) => {
    try {
        const {data} = await axios.delete(`/api/messages/delete/${messageId}`);
        if (data.success) {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? {...msg, deleted: true, text: '', image: ''} : msg
            ))
            toast.success('Message deleted')
        } else {
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
}

//Function to edit a message

const editMessage = async (messageId, newText) => {
    try {
        const {data} = await axios.put(`/api/messages/edit/${messageId}`, {text: newText});
        if (data.success) {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? {...msg, text: newText, editedAt: new Date()} : msg
            ))
            toast.success('Message edited')
        } else {
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
}


//Function to react to a message

const reactToMessage = async (messageId, emoji) => {
    try {
        const {data} = await axios.put(`/api/messages/react/${messageId}`, {emoji});
        if (data.success) {
            setMessages(prev => prev.map(msg =>
                msg._id === messageId ? {...msg, reactions: data.reactions} : msg
            ))
        } else {
            toast.error(data.message)
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

    socket.on("messageDeleted",({messageId})=>{
        setMessages(prev=>prev.map(msg=>
            msg._id===messageId ? {...msg,deleted:true,text:'',image:''} : msg
        ))
    })

    socket.on("messageEdited",({messageId,text,editedAt})=>{
        setMessages(prev=>prev.map(msg=>
            msg._id===messageId ? {...msg,text,editedAt} : msg
        ))
    })

    socket.on("messageReaction",({messageId,reactions})=>{
        setMessages(prev=>prev.map(msg=>
            msg._id===messageId ? {...msg,reactions} : msg
        ))
    })
}

//function to unsubscribe from messages

const unsubscribeFromMessages = ()=>{
    if (socket) {
        socket.off("newMessage");
        socket.off("userTyping");
        socket.off("userStopTyping");
        socket.off("messageDeleted");
        socket.off("messageEdited");
        socket.off("messageReaction");
    }
}


useEffect(()=>{
subscribeToMessages();
return ()=>unsubscribeFromMessages();
},[socket,selectedUser])




  
  const value ={
messages,users,selectedUser,getUsers,setMessages,sendMessage,getMessages,setSelectedUser,unseenMessages,setUnseenMessages,typingUsers,emitTyping,emitStopTyping,deleteMessage,editMessage,reactToMessage,replyingTo,setReplyingTo
  }

  return (<ChatContext.Provider value={value}>
             {children}
    </ChatContext.Provider>)
}