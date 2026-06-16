import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios"
import toast from "react-hot-toast";
import { encryptMessage, decryptMessage } from "../src/lib/encryption.js";



export const ChatContext= createContext();



export const ChatProvider = ({children})=>{
  
  
  const [messages,setMessages] =useState([]);
  const [users,setUsers]=useState([]);
  const [selectedUser,setSelectedUser]=useState(null)
  const [unseenMessages,setUnseenMessages]=useState({})
  const [typingUsers,setTypingUsers]=useState({})
  const [replyingTo,setReplyingTo]=useState(null)
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightMessageId, setHighlightMessageId] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("chat_notification_settings");
      return stored ? JSON.parse(stored) : { sound: true, desktop: true };
    } catch {
      return { sound: true, desktop: true };
    }
  });

  // Save settings to localStorage on change
  useEffect(() => {
    localStorage.setItem("chat_notification_settings", JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const playNotificationSound = () => {
    if (!notificationSettings.sound) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playTone = (frequency, startTime, duration) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        gainNode.gain.setValueAtTime(0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.08, 0.25); // E5
    } catch (error) {
      console.error("Failed to play notification sound", error);
    }
  };
  
  const {socket,axios,authUser}=useContext(AuthContext);


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

//function to search messages
const searchMessages = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim() === "") {
        setSearchResults([]);
        return;
    }
    setIsSearching(true);
    try {
        // Fetch recent messages securely (E2EE Client Search)
        const { data } = await axios.get("/api/messages/recent");
        if (data.success) {
            // Decrypt all messages locally
            const decrypted = data.messages.map(msg => ({
                ...msg,
                text: decryptMessage(msg.text, msg.senderId._id, msg.receiverId._id)
            }));
            
            // Search client-side on decrypted text
            const filtered = decrypted.filter(msg => 
                msg.text && msg.text.toLowerCase().includes(query.toLowerCase())
            );
            
            setSearchResults(filtered);
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    } finally {
        setIsSearching(false);
    }
}

//function to get messages for selected user

const getMessages = async (userId) => {
    try {
        const {data} = await axios.get(`/api/messages/${userId}`);
        if (data.success) {
            // Decrypt fetched messages
            const decryptedMessages = data.messages.map(msg => ({
                ...msg,
                text: decryptMessage(msg.text, msg.senderId, msg.receiverId),
                replyTo: msg.replyTo ? {
                    ...msg.replyTo,
                    text: decryptMessage(msg.replyTo.text, msg.replyTo.senderId, msg.senderId === userId ? msg.receiverId : msg.senderId)
                } : null
            }));
            setMessages(decryptedMessages)
        }
    } catch (error) {
        toast.error(error.message)
    }
}

//Function to send message to selected user

const sendMessage =async (messageData) => {
    try {
        const payload = {...messageData};
        if (payload.text && authUser && selectedUser) {
            // Encrypt message text client-side before sending
            payload.text = encryptMessage(payload.text, authUser._id, selectedUser._id);
        }
        if (replyingTo) {
            payload.replyTo = replyingTo._id;
        }
        const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,payload);
        if (data.success){
            // Decrypt new message so it renders locally in plaintext
            const decryptedNewMsg = {
                ...data.newMessage,
                text: decryptMessage(data.newMessage.text, data.newMessage.senderId, data.newMessage.receiverId),
                replyTo: replyingTo ? {
                    ...replyingTo,
                    text: replyingTo.text
                } : null
            };
            setMessages((prevMessages)=>[...prevMessages,decryptedNewMsg])
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
        // Decrypt incoming message text immediately
        newMessage.text = decryptMessage(newMessage.text, newMessage.senderId, newMessage.receiverId);
        if (newMessage.replyTo) {
            newMessage.replyTo.text = decryptMessage(newMessage.replyTo.text, newMessage.replyTo.senderId, newMessage.replyTo.receiverId || (newMessage.replyTo.senderId === newMessage.senderId ? newMessage.receiverId : newMessage.senderId));
        }

        const isChatActive = selectedUser && newMessage.senderId === selectedUser._id;
        
        if (isChatActive) {
            newMessage.seen = true;
            setMessages((prevMessages)=>[...prevMessages,newMessage]);
            axios.put(`/api/messages/mark/${newMessage._id}`)
        } else {
            setUnseenMessages((prevUnseenMessages)=>({
                ...prevUnseenMessages,[newMessage.senderId] : 
                prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
            }))
        }

        // Trigger desktop notifications and play chime sound
        if (!isChatActive || document.hidden) {
            playNotificationSound();

            if (
                notificationSettings.desktop && 
                typeof window !== "undefined" && 
                "Notification" in window && 
                Notification.permission === "granted"
            ) {
                const sender = users.find(u => u._id === newMessage.senderId);
                const senderName = sender ? sender.fullname : "New Message";
                const senderPic = sender ? sender.profilePic : "";

                const notification = new Notification(senderName, {
                    body: newMessage.text || "📷 Sent an image",
                    icon: senderPic || undefined,
                });

                notification.onclick = () => {
                    window.focus();
                    if (sender) {
                        setSelectedUser(sender);
                        setUnseenMessages(prev => ({ ...prev, [sender._id]: 0 }));
                    }
                };
            }
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
messages,users,selectedUser,getUsers,setMessages,sendMessage,getMessages,setSelectedUser,unseenMessages,setUnseenMessages,typingUsers,emitTyping,emitStopTyping,deleteMessage,editMessage,reactToMessage,replyingTo,setReplyingTo,searchResults,isSearching,searchQuery,setSearchQuery,searchMessages,setSearchResults,highlightMessageId,setHighlightMessageId,notificationSettings,setNotificationSettings
  }

  return (<ChatContext.Provider value={value}>
             {children}
    </ChatContext.Provider>)
}