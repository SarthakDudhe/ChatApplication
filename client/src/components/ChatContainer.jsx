import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from "../assets/assets"
import { formatMessageTime, formatDateHeader, compressImage } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import EmojiPicker from 'emoji-picker-react'

const ChatContainer = () => {

  const {
    messages,
    users,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    typingUsers,
    emitTyping,
    emitStopTyping,
    deleteMessage,
    editMessage,
    reactToMessage,
    replyingTo,
    setReplyingTo,
    highlightMessageId,
    setHighlightMessageId,
    addGroupMembers,
    removeGroupMember,
    updateGroupInfo
  } = useContext(ChatContext);

  const {authUser,onlineUser} =useContext(AuthContext);

  const[input,setInput]=useState('')
  const[showEmojiPicker,setShowEmojiPicker]=useState(false)
  const[contextMenu,setContextMenu]=useState(null)
  const[editingMsg,setEditingMsg]=useState(null)
  const[editText,setEditText]=useState('')
  const typingTimeoutRef=useRef(null)
  const emojiPickerRef=useRef(null)
  const reactionEmojis=['👍','❤️','😂','😮','🙏']

  // Group Details Modal states
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAvatar, setNewGroupAvatar] = useState("");
  const [selectedAddUsers, setSelectedAddUsers] = useState([]);

  // Sync edit states when group changes
  useEffect(() => {
    if (selectedUser && selectedUser.isGroup) {
      setNewGroupName(selectedUser.groupName);
      setNewGroupAvatar(selectedUser.groupAvatar || "");
    }
    setIsGroupInfoOpen(false);
    setIsAddMembersOpen(false);
  }, [selectedUser]);

  const isAdmin = selectedUser && selectedUser.isGroup && selectedUser.admin && (
    typeof selectedUser.admin === "object" 
      ? selectedUser.admin._id === authUser?._id 
      : selectedUser.admin === authUser?._id
  );

  const getSenderName = (senderIdObjOrStr) => {
    const id = typeof senderIdObjOrStr === "object" ? senderIdObjOrStr._id : senderIdObjOrStr;
    if (id === authUser?._id) return "You";
    const found = users.find(u => u._id === id) || (selectedUser && selectedUser.participants && selectedUser.participants.find(p => p._id === id));
    return found ? found.fullname : "Someone";
  };

  const getSenderPic = (msg) => {
    const isMe = msg.senderId === authUser?._id || (typeof msg.senderId === "object" && msg.senderId._id === authUser?._id);
    if (isMe) {
      return authUser.profilePic || assets.avatar_icon;
    }
    return (typeof msg.senderId === "object" && msg.senderId.profilePic) ? msg.senderId.profilePic : assets.avatar_icon;
  };

  const getTypingInfo = () => {
    if (!selectedUser) return null;
    if (selectedUser.isGroup) {
      const groupTyping = typingUsers[selectedUser._id] || {};
      const typingIds = Object.keys(groupTyping).filter(id => groupTyping[id]);
      if (typingIds.length === 0) return null;
      
      const names = typingIds.map(id => {
        const u = users.find(user => user._id === id);
        return u ? u.fullname : "Someone";
      }).join(", ");
      
      const firstTypingUser = users.find(user => user._id === typingIds[0]);
      return {
        name: names,
        avatar: firstTypingUser?.profilePic || assets.avatar_icon,
        text: `${names} typing...`
      };
    } else {
      if (!typingUsers[selectedUser._id]) return null;
      return {
        name: selectedUser.fullname,
        avatar: selectedUser.profilePic || assets.avatar_icon,
        text: "typing..."
      };
    }
  };

  const typingInfo = getTypingInfo();

  //Handle delete message
  const handleDelete=(msgId)=>{
    deleteMessage(msgId)
    setContextMenu(null)
  }

  //Handle start editing
  const handleStartEdit=(msg)=>{
    setEditingMsg(msg._id)
    setEditText(msg.text)
    setContextMenu(null)
  }

  //Handle save edit
  const handleSaveEdit=()=>{
    if(editText.trim()!==''){
      editMessage(editingMsg,editText.trim())
    }
    setEditingMsg(null)
    setEditText('')
  }

  //Handle cancel edit
  const handleCancelEdit=()=>{
    setEditingMsg(null)
    setEditText('')
  }

  //Handle emoji selection
  const handleEmojiClick=(emojiData)=>{
    setInput(prev=>prev+emojiData.emoji)
    setShowEmojiPicker(false)
  }

  //Close emoji picker when clicking outside
  useEffect(()=>{
    const handleClickOutside=(e)=>{
      if(emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)){
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown',handleClickOutside)
    return ()=>document.removeEventListener('mousedown',handleClickOutside)
  },[])

  //Handle input change with typing indicator
  const handleInputChange=(e)=>{
    setInput(e.target.value)
    if(selectedUser){
      emitTyping(selectedUser._id)
      if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current=setTimeout(()=>{
        emitStopTyping(selectedUser._id)
      },1000)
    }
  }

  //Handle sending a message
  const handlesendMessage=async(e)=>{
    e.preventDefault();
    if (input.trim() ==="")return null;
    if(selectedUser){
      emitStopTyping(selectedUser._id)
      if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
    await sendMessage({text:input.trim()});
    setInput('')
  }

  //Handle sending a image
  const handleSendImage =async(e)=>{
    const file =e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file !")
      return
    }
    const reader =new FileReader();
    reader.onloadend =async ()=>{
      await sendMessage({image:reader.result})
      e.target.value =""
    }
    reader.readAsDataURL(file)
  }

  useEffect(()=>{
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  },[selectedUser])

  const scrollEnd =useRef()
  useEffect(()=>{
    if (scrollEnd.current && messages && !highlightMessageId) {
      scrollEnd.current.scrollIntoView({behavior : "smooth"})
    }
  },[messages, highlightMessageId])

  // Handle scrolling to and highlighting a searched message
  useEffect(() => {
    if (highlightMessageId && messages.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`msg-${highlightMessageId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200);

      const clearTimer = setTimeout(() => {
        setHighlightMessageId(null);
      }, 2500);

      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [highlightMessageId, messages]);

  return selectedUser ?  (
    <div className='h-full flex flex-col relative bg-[#F5F5F0] overflow-hidden select-none'>
      {/* HEADER */}
      <div className='flex items-center justify-between h-16 px-6 border-b border-[#E8E8E2] bg-[#F5F5F0] flex-shrink-0'>
        <div className='flex items-center gap-3'>
          <div className='relative'>
            <img src={selectedUser.isGroup ? selectedUser.groupAvatar || assets.avatar_icon : selectedUser.profilePic || assets.avatar_icon} className='w-[38px] h-[38px] rounded-full object-cover border border-[#E8E8E2] shadow-sm' />
            {!selectedUser.isGroup && onlineUser.includes(selectedUser._id) && (
              <span className='absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#F5F5F0] animate-pulse'></span>
            )}
          </div>
          <div className='flex flex-col leading-tight text-left'>
            <p className='text-sm font-semibold text-[#1A1A1A]'>{selectedUser.isGroup ? selectedUser.groupName : selectedUser.fullname}</p>
            <p className='text-[10px] text-[#6B7280] font-medium mt-0.5 flex items-center gap-1'>
              {!selectedUser.isGroup && onlineUser.includes(selectedUser._id) && <span className='w-1.5 h-1.5 bg-green-500 rounded-full inline-block'></span>}
              {selectedUser.isGroup 
                ? `${selectedUser.participants.length} members`
                : (onlineUser.includes(selectedUser._id) ? "Active now" : "Offline")
              }
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button onClick={()=>setSelectedUser(null)} className='md:hidden p-2 rounded-lg hover:bg-black/5 text-[#6B7280] hover:text-[#1A1A1A] transition-all'>
            <img src={assets.arrow_icon} className='max-w-5 opacity-80 filter invert' />
          </button>
          {selectedUser.isGroup && (
            <button onClick={() => setIsGroupInfoOpen(true)} className='p-2 rounded-lg hover:bg-black/5 text-[#6B7280] hover:text-[#1A1A1A] transition-all' title='Group Details'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className='flex-1 overflow-y-auto p-5 pb-6 space-y-6'>
        {messages.map((msg,index)=>{
          const prevMsg = messages[index - 1];
          const showDivider = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
          const isSentByMe = msg.senderId === authUser?._id || (typeof msg.senderId === "object" && msg.senderId._id === authUser?._id);
          
          return (
            <React.Fragment key={msg._id || index}>
              {showDivider && (
                <div className='flex justify-center my-6 w-full'>
                  <span className='bg-white border border-[#E8E8E2] text-[#6B7280] text-[10px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-lg shadow-sm'>
                    {formatDateHeader(msg.createdAt)}
                  </span>
                </div>
              )}
              
              <div 
                id={`msg-${msg._id}`} 
                className={`flex items-start gap-3.5 my-4 group relative w-full ${isSentByMe ? 'justify-end' : 'justify-start'} ${highlightMessageId === msg._id ? 'bg-[#1C2B3A]/5 p-2 rounded-2xl ring-1 ring-[#1C2B3A]/30 shadow-xl transition-all duration-300' : ''}`}
              >
                {/* Hover Action Menu */}
                <div className={`absolute top-0 -translate-y-[85%] hidden group-hover:flex items-center gap-1.5 p-1.5 bg-white border border-[#E8E8E2] rounded-xl shadow-2xl z-20 ${isSentByMe ? 'right-4' : 'left-4'}`}>
                  <div className='flex gap-0.5'>
                    {reactionEmojis.map(em=>(
                      <button key={em} onClick={()=>reactToMessage(msg._id,em)} className='text-xs p-1 rounded hover:bg-[#F5F5F0] active:scale-125 transition-transform duration-200 cursor-pointer' title={em}>{em}</button>
                    ))}
                  </div>
                  <div className='h-3 w-[1px] bg-[#E8E8E2] mx-1'></div>
                  <button onClick={()=>setReplyingTo(msg)} className='p-1 rounded text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F5F0] text-[10px] transition-colors cursor-pointer' title='Reply'>Reply ↩️</button>
                  {isSentByMe && (
                    <>
                      <button onClick={()=>handleStartEdit(msg)} className='p-1 rounded text-[#6B7280] hover:text-[#1C2B3A] hover:bg-[#F5F5F0] text-[10px] transition-colors cursor-pointer' title='Edit'>Edit ✏️</button>
                      <button onClick={()=>handleDelete(msg._id)} className='p-1 rounded text-[#6B7280] hover:text-red-500 hover:bg-[#F5F5F0] text-[10px] transition-colors cursor-pointer' title='Delete'>Delete 🗑️</button>
                    </>
                  )}
                </div>

                {/* Received Message Avatar (Left) */}
                {!isSentByMe && (
                  <img src={getSenderPic(msg)} className='w-8 h-8 rounded-full object-cover border border-[#E8E8E2] shadow-sm mt-0.5' alt="" />
                )}

                {/* Message Bubble Container */}
                <div className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'} max-w-[65%]`}>
                  {/* Sender Name in group */}
                  {selectedUser.isGroup && !isSentByMe && (
                    <span className='text-[10px] text-[#1C2B3A] font-bold mb-1 ml-1'>{getSenderName(msg.senderId)}</span>
                  )}

                  {/* Deleted message bubble */}
                  {msg.deleted ? (
                    <p className={`p-3 text-xs italic bg-[#FAFAFA] border border-[#E8E8E2] text-[#9CA3AF] rounded-xl ${isSentByMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                      🚫 This message was deleted
                    </p>
                  ) : editingMsg===msg._id ? (
                    <div className='flex flex-col gap-1.5 min-w-[200px]'>
                      <input 
                        value={editText} 
                        onChange={(e)=>setEditText(e.target.value)} 
                        onKeyDown={(e)=>e.key==='Enter'?handleSaveEdit():e.key==='Escape'?handleCancelEdit():null} 
                        autoFocus 
                        className='p-2.5 w-full text-sm rounded-xl bg-white text-[#1A1A1A] border border-[#E8E8E2] outline-none focus:border-[#1C2B3A] focus:ring-1 focus:ring-[#1C2B3A]'
                      />
                      <div className='flex gap-2 text-[10px] px-1 font-semibold'>
                        <button onClick={handleSaveEdit} className='text-green-600 hover:text-green-500 cursor-pointer'>Save</button>
                        <button onClick={handleCancelEdit} className='text-[#6B7280] hover:text-neutral-500 cursor-pointer'>Cancel</button>
                      </div>
                    </div>
                  ) : msg.image ? (
                    <div className='relative'>
                      {msg.replyTo && !msg.replyTo.deleted && (
                        <div className='bg-white/80 border-l-2 border-[#1C2B3A] rounded-lg px-2.5 py-1.5 mb-1.5 text-xs text-[#6B7280] max-w-[230px] backdrop-blur-md border border-[#E8E8E2]'>
                          <p className='text-[#1C2B3A] text-[10px] font-semibold mb-0.5'>{getSenderName(msg.replyTo.senderId)}</p>
                          {msg.replyTo.image ? <span>🖼️ Photo</span> : <span className='line-clamp-1'>{msg.replyTo.text}</span>}
                        </div>
                      )}
                      <img src={msg.image} alt="" className='max-w-[240px] border border-[#E8E8E2] rounded-xl overflow-hidden shadow-sm transition-transform duration-300 hover:scale-[1.01]' />
                      
                      {/* Floating Reactions overlay */}
                      {msg.reactions && msg.reactions.length>0 && (
                        <div className={`absolute -bottom-2 flex gap-1 flex-wrap z-10 ${isSentByMe ? 'right-2' : 'left-2'}`}>
                          {Object.entries(msg.reactions.reduce((acc,r)=>{acc[r.emoji]=(acc[r.emoji]||0)+1;return acc},{})).map(([emoji,count])=>(
                            <button key={emoji} onClick={()=>reactToMessage(msg._id,emoji)} className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all shadow-sm ${msg.reactions.some(r=>r.userId===authUser?._id && r.emoji===emoji) ? 'bg-[#1C2B3A]/10 border-[#1C2B3A]/25 text-[#1C2B3A] font-medium' : 'bg-white border-[#E8E8E2] text-[#6B7280] hover:border-[#6B7280]'}`}>
                              <span>{emoji}</span>
                              {count>1 && <span className='font-bold ml-1'>{count}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='relative group/bubble'>
                      {msg.replyTo && !msg.replyTo.deleted && (
                        <div className='bg-[#FAFAFA] border-l-2 border-[#1C2B3A] rounded-lg px-2.5 py-1.5 mb-1.5 text-xs text-[#6B7280] max-w-[280px] md:max-w-[320px] border border-[#E8E8E2]'>
                          <p className='text-[#1C2B3A] text-[10px] font-bold mb-0.5'>{getSenderName(msg.replyTo.senderId)}</p>
                          {msg.replyTo.image ? <span>🖼️ Photo</span> : <span className='line-clamp-1 text-[11px]'>{msg.replyTo.text}</span>}
                        </div>
                      )}
                      <p className={`p-3 px-4 text-[13px] leading-relaxed rounded-2xl shadow-sm break-words border transition-all ${isSentByMe ? 'bg-[#1C2B3A] border-transparent text-white rounded-tr-none' : 'bg-white border-[#E8E8E2] text-[#1A1A1A] rounded-tl-none'}`}>
                        {msg.text}
                        {msg.editedAt && <span className={`text-[9px] italic ml-1.5 ${isSentByMe ? 'text-white/70' : 'text-neutral-400'}`}>(edited)</span>}
                      </p>
                      
                      {/* Floating Reactions overlay */}
                      {msg.reactions && msg.reactions.length>0 && (
                        <div className={`absolute -bottom-2.5 flex gap-1 flex-wrap z-10 ${isSentByMe ? 'right-2' : 'left-2'}`}>
                          {Object.entries(msg.reactions.reduce((acc,r)=>{acc[r.emoji]=(acc[r.emoji]||0)+1;return acc},{})).map(([emoji,count])=>(
                            <button key={emoji} onClick={()=>reactToMessage(msg._id,emoji)} className={`text-[9px] px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all shadow-sm ${msg.reactions.some(r=>r.userId===authUser?._id && r.emoji===emoji) ? 'bg-[#1C2B3A]/15 border-[#1C2B3A]/25 text-[#1C2B3A] font-semibold' : 'bg-white border-[#E8E8E2] text-[#6B7280] hover:border-[#6B7280]'}`}>
                              <span>{emoji}</span>
                              {count>1 && <span className='font-bold ml-1'>{count}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp underneath bubble */}
                  <span className='text-[9px] text-[#9CA3AF] font-semibold mt-1 px-1'>{formatMessageTime(msg.createdAt)}</span>
                </div>

                {/* Sent Message Avatar (Right) */}
                {isSentByMe && (
                  <img src={getSenderPic(msg)} className='w-8 h-8 rounded-full object-cover border border-[#E8E8E2] shadow-sm mt-0.5' alt="" />
                )}
              </div>
            </React.Fragment>
          );
        })}

        {/* TYPING INDICATOR */}
        {typingInfo && (
          <div className='flex items-start gap-3 px-4 py-1 flex-row'>
            <img src={typingInfo.avatar} className='w-8 h-8 rounded-full object-cover border border-[#E8E8E2] shadow-sm' alt='' />
            <div className='flex flex-col items-start'>
              <div className='p-3.5 rounded-2xl rounded-tl-none bg-white border border-[#E8E8E2] shadow-sm'>
                <div className='flex items-center gap-1 px-1'>
                  <span className='w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce' style={{animationDelay:'0ms'}}></span>
                  <span className='w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce' style={{animationDelay:'150ms'}}></span>
                  <span className='w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce' style={{animationDelay:'300ms'}}></span>
                </div>
              </div>
              <span className='text-[9px] text-[#9CA3AF] font-semibold mt-1 px-1'>{typingInfo.name} typing</span>
            </div>
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* BOTTOM AREA */}
      <div className='p-4 bg-[#F5F5F0] border-t border-[#E8E8E2] flex-shrink-0'>
        {/* Reply Preview */}
        {replyingTo && (
          <div className='flex items-center justify-between bg-white border border-[#E8E8E2] border-l-2 border-l-[#1C2B3A] rounded-xl px-4 py-2 mb-3 text-sm text-[#1A1A1A] backdrop-blur-md max-w-5xl mx-auto'>
            <div className='flex-1 min-w-0 text-left'>
              <p className='text-[#1C2B3A] text-xs font-bold'>Replying to {getSenderName(replyingTo.senderId)}</p>
              <p className='truncate text-xs mt-0.5 text-[#6B7280]'>{replyingTo.image ? '🖼️ Photo' : replyingTo.text}</p>
            </div>
            <button onClick={()=>setReplyingTo(null)} className='text-[#6B7280] hover:text-[#1A1A1A] ml-2 text-md cursor-pointer p-1'>✕</button>
          </div>
        )}
        
        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className='absolute bottom-20 left-6 z-10 shadow-2xl border border-[#E8E8E2] rounded-xl overflow-hidden'>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme='light'
              width={300}
              height={400}
              searchDisabled={false}
              skinTonesDisabled
              previewConfig={{showPreview:false}}
            />
          </div>
        )}

        <div className='flex items-center gap-3.5 max-w-5xl mx-auto'>
          <div className='flex-1 flex items-center bg-white border border-[#E8E8E2] px-4.5 rounded-xl transition-all focus-within:border-[#1C2B3A] focus-within:ring-1 focus-within:ring-[#1C2B3A]'>
            <button onClick={()=>setShowEmojiPicker(prev=>!prev)} className='text-lg cursor-pointer mr-3 opacity-70 hover:opacity-100 hover:scale-105 transition-all' title='Emoji'>😊</button>
            <input 
              onChange={handleInputChange} 
              value={input} 
              onKeyDown={(e)=>e.key ==="Enter"? handlesendMessage(e): null} 
              type="text" 
              placeholder='Type your message here...' 
              className='flex-1 text-sm py-3 bg-transparent border-none outline-none text-[#1A1A1A] placeholder-[#9CA3AF]'
            />
            <input type="file" onChange={handleSendImage} id='image' accept='image/png, image/jpeg' hidden/>
            <label htmlFor="image" className='cursor-pointer opacity-70 hover:opacity-100 hover:scale-105 transition-all p-1'>
              <img src={assets.gallery_icon} alt="" className='w-5 filter invert opacity-80' />
            </label>
          </div>
          <button 
            onClick={handlesendMessage} 
            className='w-11 h-11 rounded-xl bg-[#1C2B3A] hover:bg-[#253545] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0'
          >
            <img src={assets.send_button} alt="" className='w-4 ml-0.5' />
          </button>
        </div>
      </div>

      {/* Group Info Modal */}
      {isGroupInfoOpen && selectedUser && selectedUser.isGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white border border-[#E8E8E2] w-full max-w-md p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-[#1A1A1A] mx-4 animate-fade-in-scale">
            <div className="flex justify-between items-center border-b border-[#E8E8E2] pb-3">
              <h3 className="text-lg font-bold font-headline text-[#1C2B3A]">Group Details</h3>
              <button onClick={() => setIsGroupInfoOpen(false)} className="text-[#6B7280] hover:text-[#1A1A1A] text-sm">✕</button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Avatar & Info */}
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  <img 
                    src={newGroupAvatar || assets.avatar_icon} 
                    alt="Group Avatar" 
                    className="w-20 h-20 rounded-full object-cover border border-[#E8E8E2] shadow-lg"
                  />
                  {isAdmin && (
                    <label htmlFor="edit-group-avatar" className="absolute bottom-0 right-0 bg-[#1C2B3A] text-white rounded-full p-1.5 cursor-pointer text-xs shadow-md transition-colors border border-white/20">
                      📸
                      <input 
                        type="file" 
                        id="edit-group-avatar" 
                        accept="image/*" 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const compressed = await compressImage(file, 200);
                              setNewGroupAvatar(compressed);
                              updateGroupInfo(selectedUser._id, newGroupName, compressed);
                            } catch (err) {
                              toast.error("Error processing image");
                            }
                          }
                        }} 
                        hidden 
                      />
                    </label>
                  )}
                </div>

                {isAdmin ? (
                  <div className="flex items-center gap-2 w-full max-w-xs justify-center">
                    <input 
                      type="text" 
                      value={newGroupName} 
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onBlur={() => {
                        if (newGroupName.trim() && newGroupName !== selectedUser.groupName) {
                          updateGroupInfo(selectedUser._id, newGroupName.trim(), newGroupAvatar);
                        }
                      }}
                      className="bg-[#FAFAFA] border border-[#E8E8E2] rounded-lg p-1.5 px-2.5 text-sm text-center font-bold outline-none focus:ring-1 focus:ring-[#1C2B3A] w-full"
                    />
                  </div>
                ) : (
                  <h4 className="text-md font-bold text-[#1A1A1A]">{selectedUser.groupName}</h4>
                )}
                <p className="text-xs text-[#6B7280]">Created by {typeof selectedUser.admin === "object" ? selectedUser.admin.fullname : "Admin"}</p>
              </div>

              {/* Member list section */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-[#6B7280] font-semibold uppercase tracking-wider mb-1">
                  <span>Members ({selectedUser.participants.length})</span>
                  {isAdmin && (
                    <button 
                      onClick={() => setIsAddMembersOpen(true)}
                      className="text-[#1C2B3A] hover:text-[#253545] font-bold transition-colors cursor-pointer text-[11px]"
                    >
                      ➕ Add Members
                    </button>
                  )}
                </div>
                
                <div className="max-h-48 overflow-y-auto border border-[#E8E8E2] rounded-xl bg-[#FAFAFA] p-2 flex flex-col gap-1.5">
                  {selectedUser.participants.map((p) => {
                    const isMemberAdmin = typeof selectedUser.admin === "object" ? selectedUser.admin._id === p._id : selectedUser.admin === p._id;
                    return (
                      <div key={p._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F5F0] transition-colors">
                        <div className="flex items-center gap-2.5">
                          <img src={p.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full object-cover border border-[#E8E8E2]" />
                          <span className="text-sm font-medium text-[#1A1A1A]">{p.fullname}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isMemberAdmin && <span className="text-[10px] font-bold text-[#1C2B3A] bg-[#1C2B3A]/10 border border-[#1C2B3A]/20 rounded px-1.5 py-0.5">Admin</span>}
                          {isAdmin && p._id !== authUser?._id && !isMemberAdmin && (
                            <button 
                              onClick={() => removeGroupMember(selectedUser._id, p._id)}
                              className="text-[10px] font-bold text-red-500 hover:text-red-650 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-4 pt-3 border-t border-[#E8E8E2]">
              <button 
                onClick={() => {
                  removeGroupMember(selectedUser._id, authUser?._id);
                  setIsGroupInfoOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-semibold transition-colors animate-pulse"
              >
                Leave Group
              </button>
              <button 
                onClick={() => setIsGroupInfoOpen(false)} 
                className="px-6 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E8E8E2] text-sm font-semibold transition-colors text-[#1A1A1A] border border-[#E8E8E2]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Members Sub-Modal */}
      {isAddMembersOpen && selectedUser && selectedUser.isGroup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white border border-[#E8E8E2] w-full max-w-sm p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-[#1A1A1A] mx-4 animate-fade-in-scale">
            <div className="flex justify-between items-center border-b border-[#E8E8E2] pb-3">
              <h3 className="text-md font-bold text-[#1C2B3A]">Add Members</h3>
              <button onClick={() => setIsAddMembersOpen(false)} className="text-[#6B7280] hover:text-[#1A1A1A] text-sm">✕</button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-[#E8E8E2] rounded-xl bg-[#FAFAFA] p-2 flex flex-col gap-1.5">
              {users.filter(u => !selectedUser.participants.some(p => p._id === u._id)).length === 0 ? (
                <p className="text-xs text-neutral-500 p-2 text-center">All contacts are already members.</p>
              ) : (
                users.filter(u => !selectedUser.participants.some(p => p._id === u._id)).map((user) => (
                  <label key={user._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F5F0] cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <img src={user.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full object-cover border border-[#E8E8E2]" />
                      <span className="text-sm font-medium text-[#1A1A1A]">{user.fullname}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={selectedAddUsers.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAddUsers(prev => [...prev, user._id]);
                        } else {
                          setSelectedAddUsers(prev => prev.filter(id => id !== user._id));
                        }
                      }}
                      className="w-4 h-4 rounded border-[#E8E8E2] text-[#1C2B3A] focus:ring-[#1C2B3A]"
                    />
                  </label>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-[#E8E8E2]">
              <button 
                onClick={() => {
                  setIsAddMembersOpen(false);
                  setSelectedAddUsers([]);
                }}
                className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E8E8E2] text-sm font-semibold transition-colors text-[#1A1A1A] border border-[#E8E8E2]"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (selectedAddUsers.length > 0) {
                    addGroupMembers(selectedUser._id, selectedAddUsers);
                    setIsAddMembersOpen(false);
                    setSelectedAddUsers([]);
                  }
                }}
                disabled={selectedAddUsers.length === 0}
                className="px-4 py-2 rounded-xl bg-[#1C2B3A] hover:bg-[#253545] disabled:opacity-50 text-sm font-semibold transition-colors text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ):(
    <div className='flex-1 flex flex-col items-center justify-center gap-4 text-[#6B7280] bg-[#F5F5F0] max-md:hidden'>
      <div className='p-8 rounded-2xl bg-white border border-[#E8E8E2] shadow-sm flex flex-col items-center gap-4 text-center max-w-sm animate-fade-in'>
        <img src={assets.logo_icon} className='max-w-12 filter opacity-90' alt="" />
        <div>
          <p className='text-md font-bold text-[#1A1A1A] font-headline tracking-wide'>QuickChat Enterprise</p>
          <p className='text-xs text-[#6B7280] leading-relaxed mt-2'>Select a contact or group conversation from the sidebar to start messaging. All conversations are secured with client-side end-to-end encryption.</p>
        </div>
      </div>
    </div>
  )
}

export default ChatContainer