import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios"
import toast from "react-hot-toast";
import { encryptMessage, decryptMessage } from "../src/lib/encryption.js";



export const ChatContext= createContext();



export const ChatProvider = ({children})=>{
  
  
  const [messages,setMessages] =useState([]);
  const [users,setUsers]=useState([]);
  const [conversations, setConversations] = useState([]);
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
        await getConversations();
    } catch (error) {
        toast.error(error.message)
    }
}

//function to get all conversations (1:1 and groups)
const getConversations = async () => {
    try {
        const {data} = await axios.get("/api/conversations/list");
        if (data.success) {
            setConversations(data.conversations);
        }
    } catch (error) {
        toast.error(error.message);
    }
}

//function to create a group conversation
const createGroup = async (groupData) => {
    try {
        const {data} = await axios.post("/api/conversations/create", groupData);
        if (data.success) {
            setConversations(prev => [data.group, ...prev]);
            toast.success("Group created successfully");
            return data.group;
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
}

const addGroupMembers = async (conversationId, memberIds) => {
    try {
        const { data } = await axios.put("/api/conversations/add-members", { conversationId, memberIds });
        if (data.success) {
            setConversations(prev => prev.map(c => c._id === conversationId ? data.group : c));
            toast.success("Members added successfully!");
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
};

const removeGroupMember = async (conversationId, memberId) => {
    try {
        const { data } = await axios.put("/api/conversations/remove-member", { conversationId, memberId });
        if (data.success) {
            if (data.message && data.message.includes("deleted")) {
                setConversations(prev => prev.filter(c => c._id !== conversationId));
                if (selectedUser && selectedUser._id === conversationId) {
                    setSelectedUser(null);
                }
            } else {
                setConversations(prev => prev.map(c => c._id === conversationId ? data.group : c));
            }
            toast.success("Member removed/Group left successfully!");
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
};

const updateGroupInfo = async (conversationId, groupName, groupAvatar) => {
    try {
        const { data } = await axios.put("/api/conversations/update-info", { conversationId, groupName, groupAvatar });
        if (data.success) {
            setConversations(prev => prev.map(c => c._id === conversationId ? data.group : c));
            if (selectedUser && selectedUser._id === conversationId) {
                setSelectedUser(data.group);
            }
            toast.success("Group updated successfully!");
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
};

const deleteGroup = async (conversationId) => {
    try {
        const { data } = await axios.delete("/api/conversations/delete", { data: { conversationId } });
        if (data.success) {
            setConversations(prev => prev.filter(c => c._id !== conversationId));
            if (selectedUser && selectedUser._id === conversationId) {
                setSelectedUser(null);
            }
            toast.success("Group deleted successfully!");
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message);
    }
};

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
                text: decryptMessage(msg.text, msg.senderId?._id || msg.senderId, msg.receiverId?._id || msg.receiverId, msg.conversationId)
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

//function to get messages for selected user or group
const getMessages = async (chatId) => {
    try {
        const {data} = await axios.get(`/api/messages/${chatId}`);
        if (data.success) {
            // Decrypt fetched messages
            const decryptedMessages = data.messages.map(msg => ({
                ...msg,
                text: decryptMessage(msg.text, msg.senderId, msg.receiverId, msg.conversationId),
                replyTo: msg.replyTo ? {
                    ...msg.replyTo,
                    text: decryptMessage(msg.replyTo.text, msg.senderId, msg.receiverId, msg.conversationId)
                } : null
            }));
            setMessages(decryptedMessages)
        }
    } catch (error) {
        toast.error(error.message)
    }
}

//Function to send message to selected user or group
const sendMessage =async (messageData) => {
    try {
        const payload = {...messageData};
        if (payload.text && authUser && selectedUser) {
            // Encrypt message text client-side before sending
            const conversationId = selectedUser.isGroup ? selectedUser._id : null;
            payload.text = encryptMessage(payload.text, authUser._id, selectedUser._id, conversationId);
            if (conversationId) {
                payload.conversationId = conversationId;
            }
        }
        if (replyingTo) {
            payload.replyTo = replyingTo._id;
        }
        const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,payload);
        if (data.success){
            // Decrypt new message so it renders locally in plaintext
            const decryptedNewMsg = {
                ...data.newMessage,
                text: decryptMessage(
                    data.newMessage.text, 
                    data.newMessage.senderId, 
                    data.newMessage.receiverId, 
                    data.newMessage.conversationId
                ),
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
    if (socket) {
        if (selectedUser && selectedUser.isGroup) {
            socket.emit("typing", { conversationId: selectedUser._id });
        } else {
            socket.emit("typing", { receiverId });
        }
    }
}

const emitStopTyping = (receiverId) => {
    if (socket) {
        if (selectedUser && selectedUser.isGroup) {
            socket.emit("stopTyping", { conversationId: selectedUser._id });
        } else {
            socket.emit("stopTyping", { receiverId });
        }
    }
}

// Function to subscribe to message for selected user or group
const subscribeToMessages =async ()=>{
    if(!socket) return;

    socket.on("newMessage",(newMessage)=>{
        // Decrypt incoming message text immediately
        newMessage.text = decryptMessage(newMessage.text, newMessage.senderId, newMessage.receiverId, newMessage.conversationId);
        if (newMessage.replyTo) {
            newMessage.replyTo.text = decryptMessage(newMessage.replyTo.text, newMessage.replyTo.senderId, newMessage.replyTo.receiverId, newMessage.replyTo.conversationId || newMessage.conversationId);
        }

        const isChatActive = selectedUser && (
            newMessage.conversationId 
                ? selectedUser._id === newMessage.conversationId 
                : (newMessage.senderId === selectedUser._id || (typeof newMessage.senderId === "object" && newMessage.senderId._id === selectedUser._id))
        );
        
        const isSentByMe = (typeof newMessage.senderId === "object" ? newMessage.senderId._id : newMessage.senderId) === authUser?._id;

        if (isChatActive) {
            newMessage.seen = true;
            setMessages((prevMessages) => {
                if (prevMessages.some(msg => msg._id === newMessage._id)) return prevMessages;
                return [...prevMessages, newMessage];
            });
            if (!isSentByMe) {
                axios.put(`/api/messages/mark/${newMessage._id}`)
            }
        } else if (!isSentByMe) {
            const unreadKey = newMessage.conversationId || (typeof newMessage.senderId === "object" ? newMessage.senderId._id : newMessage.senderId);
            setUnseenMessages((prevUnseenMessages)=>({
                ...prevUnseenMessages,[unreadKey] : 
                prevUnseenMessages[unreadKey] ? prevUnseenMessages[unreadKey] + 1 : 1
            }))
        }

        // Trigger desktop notifications and play chime sound
        if ((!isChatActive || document.hidden) && !isSentByMe) {
            playNotificationSound();

            if (
                notificationSettings.desktop && 
                typeof window !== "undefined" && 
                "Notification" in window && 
                Notification.permission === "granted"
            ) {
                let senderName = "New Message";
                let senderPic = "";
                
                if (newMessage.conversationId) {
                    const group = conversations.find(c => c._id === newMessage.conversationId);
                    const sender = users.find(u => u._id === (typeof newMessage.senderId === "object" ? newMessage.senderId._id : newMessage.senderId));
                    senderName = group ? `${group.groupName} (${sender ? sender.fullname : "Someone"})` : "Group Message";
                    senderPic = group ? group.groupAvatar : "";
                } else {
                    const sender = users.find(u => u._id === (typeof newMessage.senderId === "object" ? newMessage.senderId._id : newMessage.senderId));
                    senderName = sender ? sender.fullname : "New Message";
                    senderPic = sender ? sender.profilePic : "";
                }

                const notification = new Notification(senderName, {
                    body: newMessage.text || "📷 Sent an image",
                    icon: senderPic || undefined,
                });

                notification.onclick = () => {
                    window.focus();
                    if (newMessage.conversationId) {
                        const group = conversations.find(c => c._id === newMessage.conversationId);
                        if (group) {
                            setSelectedUser(group);
                            setUnseenMessages(prev => ({ ...prev, [newMessage.conversationId]: 0 }));
                        }
                    } else {
                        const sender = users.find(u => u._id === (typeof newMessage.senderId === "object" ? newMessage.senderId._id : newMessage.senderId));
                        if (sender) {
                            setSelectedUser(sender);
                            setUnseenMessages(prev => ({ ...prev, [sender._id]: 0 }));
                        }
                    }
                };
            }
        }
    })

    socket.on("userTyping",({senderId, conversationId})=>{
        if (conversationId) {
            setTypingUsers(prev => ({
                ...prev,
                [conversationId]: {
                    ...(prev[conversationId] || {}),
                    [senderId]: true
                }
            }));
        } else {
            setTypingUsers(prev => ({...prev, [senderId]: true}));
        }
    })

    socket.on("userStopTyping",({senderId, conversationId})=>{
        if (conversationId) {
            setTypingUsers(prev => {
                const groupTyping = { ...(prev[conversationId] || {}) };
                delete groupTyping[senderId];
                return {
                    ...prev,
                    [conversationId]: groupTyping
                };
            });
        } else {
            setTypingUsers(prev => {
                const updated = {...prev};
                delete updated[senderId];
                return updated;
            });
        }
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
},[socket,selectedUser,conversations,users])

useEffect(() => {
    if (socket && conversations.length > 0) {
        const conversationIds = conversations.map(c => c._id);
        socket.emit("joinRooms", { conversationIds });
    }
}, [socket, conversations]);

const value ={
    messages,
    users,
    conversations,
    selectedUser,
    getUsers,
    getConversations,
    createGroup,
    addGroupMembers,
    removeGroupMember,
    updateGroupInfo,
    deleteGroup,
    setMessages,
    sendMessage,
    getMessages,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    typingUsers,
    emitTyping,
    emitStopTyping,
    deleteMessage,
    editMessage,
    reactToMessage,
    replyingTo,
    setReplyingTo,
    searchResults,
    isSearching,
    searchQuery,
    setSearchQuery,
    searchMessages,
    setSearchResults,
    highlightMessageId,
    setHighlightMessageId,
    notificationSettings,
    setNotificationSettings
}

return (<ChatContext.Provider value={value}>
             {children}
    </ChatContext.Provider>)
}