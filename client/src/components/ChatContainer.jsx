import React, { useContext, useEffect, useRef, useState } from 'react'
import assets, { messagesDummyData } from "../assets/assets"
import { formatMessageTime, formatDateHeader } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import EmojiPicker from 'emoji-picker-react'
const ChatContainer = () => {

const {messages,selectedUser,setSelectedUser,sendMessage,getMessages,typingUsers,emitTyping,emitStopTyping,deleteMessage,editMessage,reactToMessage,replyingTo,setReplyingTo,highlightMessageId,setHighlightMessageId} =useContext(ChatContext);
const {authUser,onlineUser} =useContext(AuthContext);

const[input,setInput]=useState('')
const[showEmojiPicker,setShowEmojiPicker]=useState(false)
const[contextMenu,setContextMenu]=useState(null)
const[editingMsg,setEditingMsg]=useState(null)
const[editText,setEditText]=useState('')
const typingTimeoutRef=useRef(null)
const emojiPickerRef=useRef(null)
const reactionEmojis=['👍','❤️','😂','😮','🙏']

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
    <div className='h-full flex flex-col relative bg-[#0a0612]/30 backdrop-blur-md overflow-hidden'>
      {/* HEADER */}
      <div className='flex items-center justify-between p-4 px-6 border-b border-white/5 bg-[#16112c]/35 backdrop-blur-md shadow-sm flex-shrink-0'>
        <div className='flex items-center gap-3.5'>
          <div className='relative'>
            <img src={selectedUser.profilePic || assets.avatar_icon} className='w-10 h-10 rounded-full object-cover border border-white/10' />
            {onlineUser.includes(selectedUser._id) && (
              <span className='absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#16112c] animate-pulse'></span>
            )}
          </div>
          <div>
            <p className='text-md font-semibold text-gray-100'>{selectedUser.fullname}</p>
            <p className='text-xs text-neutral-400 font-normal'>
              {onlineUser.includes(selectedUser._id) ? "Active now" : "Offline"}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <img onClick={()=>setSelectedUser(null)} src={assets.arrow_icon} className='md:hidden max-w-7 cursor-pointer opacity-80 hover:opacity-100 transition-opacity' />
          <button className='p-2 rounded-full hover:bg-white/5 transition-colors max-md:hidden text-gray-300 hover:text-white' title='Info'>
            ℹ️
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className='flex-1 overflow-y-auto p-4 pb-6 space-y-4'>
        {messages.map((msg,index)=>{
          const prevMsg = messages[index - 1];
          const showDivider = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
          return (
            <React.Fragment key={msg._id || index}>
              {showDivider && (
                <div className='flex justify-center my-5 w-full'>
                  <span className='bg-[#282142]/85 text-gray-200 text-[11px] px-3.5 py-1 rounded-full border border-violet-500/20 shadow-sm font-medium backdrop-blur-md tracking-wide'>
                    {formatDateHeader(msg.createdAt)}
                  </span>
                </div>
              )}
              <div 
                id={`msg-${msg._id}`} 
                className={`flex items-end gap-3.5 my-3 group px-4 py-2 rounded-2xl transition-all duration-500 relative ${msg.senderId !==authUser._id ? 'flex-row-reverse' : ''} ${highlightMessageId === msg._id ? 'bg-violet-500/20 ring-2 ring-violet-500/50 border border-violet-400/50 shadow-xl scale-[1.01]' : ''}`}
              >
                   {/* Hover Action Panel */}
                   <div className={`absolute top-0 -translate-y-[85%] hidden group-hover:flex items-center gap-1.5 p-1 px-1.5 bg-[#140f28]/95 border border-white/10 rounded-full shadow-2xl backdrop-blur-md z-20 ${msg.senderId === authUser._id ? 'right-4' : 'left-4'}`}>
                     <div className='flex gap-0.5'>
                       {reactionEmojis.map(em=>(
                         <button key={em} onClick={()=>reactToMessage(msg._id,em)} className='text-sm p-1 rounded-full hover:bg-white/10 active:scale-125 transition-transform duration-200 cursor-pointer' title={em}>{em}</button>
                       ))}
                     </div>
                     <div className='h-3 w-[1px] bg-white/10 mx-1'></div>
                     <button onClick={()=>setReplyingTo(msg)} className='p-1 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 text-xs transition-colors cursor-pointer' title='Reply'>↩️</button>
                     {msg.senderId===authUser._id && (
                       <>
                         <button onClick={()=>handleStartEdit(msg)} className='p-1 rounded-full text-neutral-400 hover:text-blue-400 hover:bg-white/10 text-xs transition-colors cursor-pointer' title='Edit'>✏️</button>
                         <button onClick={()=>handleDelete(msg._id)} className='p-1 rounded-full text-neutral-400 hover:text-red-400 hover:bg-white/10 text-xs transition-colors cursor-pointer' title='Delete'>🗑️</button>
                       </>
                     )}
                   </div>

                   {/* Deleted message bubble */}
                   {msg.deleted ? (
                     <p className={`p-3 max-w-[280px] text-sm rounded-2xl italic break-words bg-white/5 border border-white/5 text-gray-500 ${msg.senderId ===authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                       🚫 This message was deleted
                     </p>
                   ): editingMsg===msg._id ? (
                     <div className='flex flex-col gap-1.5 min-w-[180px]'>
                       <input 
                         value={editText} 
                         onChange={(e)=>setEditText(e.target.value)} 
                         onKeyDown={(e)=>e.key==='Enter'?handleSaveEdit():e.key==='Escape'?handleCancelEdit():null} 
                         autoFocus 
                         className='p-2.5 w-full text-sm rounded-xl bg-violet-600/40 text-white border border-violet-500/50 outline-none focus:ring-1 focus:ring-violet-400'
                       />
                       <div className='flex gap-2 text-[11px] px-1 font-semibold'>
                         <button onClick={handleSaveEdit} className='text-green-400 hover:text-green-300 cursor-pointer'>Save</button>
                         <button onClick={handleCancelEdit} className='text-neutral-400 hover:text-neutral-300 cursor-pointer'>Cancel</button>
                       </div>
                     </div>
                   ): msg.image ? (
                     <div className='relative'>
                       {msg.replyTo && !msg.replyTo.deleted && (
                         <div className='bg-white/5 border-l-2 border-violet-500 rounded-lg px-2.5 py-1.5 mb-1.5 text-xs text-gray-300 max-w-[230px] backdrop-blur-md'>
                           <p className='text-violet-400 text-[10px] font-semibold mb-0.5'>{msg.replyTo.senderId===authUser._id?'You':selectedUser.fullname}</p>
                           {msg.replyTo.image ? <span>🖼️ Photo</span> : <span className='line-clamp-1'>{msg.replyTo.text}</span>}
                         </div>
                       )}
                       <img src={msg.image} alt="" className='max-w-[230px] border border-white/10 rounded-2xl overflow-hidden shadow-md transition-transform duration-300 hover:scale-[1.01]' />
                       
                       {/* Floating Reactions overlay */}
                       {msg.reactions && msg.reactions.length>0 && (
                         <div className={`absolute -bottom-2.5 flex gap-1 flex-wrap z-10 ${msg.senderId === authUser._id ? 'right-2' : 'left-2'}`}>
                           {Object.entries(msg.reactions.reduce((acc,r)=>{acc[r.emoji]=(acc[r.emoji]||0)+1;return acc},{})).map(([emoji,count])=>(
                             <button key={emoji} onClick={()=>reactToMessage(msg._id,emoji)} className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1.5 transition-all shadow-md ${msg.reactions.some(r=>r.userId===authUser._id && r.emoji===emoji) ? 'bg-violet-600/60 border-violet-400 text-white' : 'bg-[#18122c]/90 border-white/10 text-gray-300 hover:border-white/20'}`}>
                               <span>{emoji}</span>
                               {count>1 && <span className='font-bold'>{count}</span>}
                             </button>
                           ))}
                         </div>
                       )}
                     </div>
                   ):(
                     <div className='relative'>
                       {msg.replyTo && !msg.replyTo.deleted && (
                         <div className='bg-white/5 border-l-2 border-violet-500 rounded-lg px-2.5 py-1.5 mb-1.5 text-xs text-gray-300 max-w-[250px] md:max-w-[300px] backdrop-blur-md'>
                           <p className='text-violet-400 text-[10px] font-semibold mb-0.5'>{msg.replyTo.senderId===authUser._id?'You':selectedUser.fullname}</p>
                           {msg.replyTo.image ? <span>🖼️ Photo</span> : <span className='line-clamp-1'>{msg.replyTo.text}</span>}
                         </div>
                       )}
                       <p className={`p-3 px-4 max-w-[250px] md:max-w-[340px] text-sm leading-relaxed rounded-2xl shadow-md break-words border transition-all ${msg.senderId === authUser._id ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 border-violet-500/20 text-white rounded-br-none font-medium' : 'bg-white/5 border-white/8 text-gray-100 rounded-bl-none'}`}>
                         {msg.text}
                         {msg.editedAt && <span className='text-gray-400/70 text-[9px] font-normal italic ml-1.5'>(edited)</span>}
                       </p>
                       
                       {/* Floating Reactions overlay */}
                       {msg.reactions && msg.reactions.length>0 && (
                         <div className={`absolute -bottom-2.5 flex gap-1 flex-wrap z-10 ${msg.senderId === authUser._id ? 'right-2' : 'left-2'}`}>
                           {Object.entries(msg.reactions.reduce((acc,r)=>{acc[r.emoji]=(acc[r.emoji]||0)+1;return acc},{})).map(([emoji,count])=>(
                             <button key={emoji} onClick={()=>reactToMessage(msg._id,emoji)} className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1.5 transition-all shadow-md ${msg.reactions.some(r=>r.userId===authUser._id && r.emoji===emoji) ? 'bg-violet-600/60 border-violet-400 text-white' : 'bg-[#18122c]/90 border-white/10 text-gray-300 hover:border-white/20'}`}>
                               <span>{emoji}</span>
                               {count>1 && <span className='font-bold'>{count}</span>}
                             </button>
                           ))}
                         </div>
                       )}
                     </div>
                   )}
                   <div className='flex flex-col items-center gap-1 flex-shrink-0 leading-none mb-1'>
                     <img src={msg.senderId === authUser._id ? authUser?.profilePic || assets.avatar_icon :selectedUser?.profilePic || assets.avatar_icon} className='w-7 h-7 rounded-full object-cover border border-white/10' alt="" />
                     <span className='text-[9px] text-gray-500/80 font-medium'>{formatMessageTime(msg.createdAt) }</span>
                   </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* TYPING INDICATOR */}
        {selectedUser && typingUsers[selectedUser._id] && (
          <div className='flex items-end gap-3.5 my-3 px-4 py-1.5 flex-row-reverse'>
            <div className='p-3.5 rounded-2xl rounded-bl-none bg-white/5 border border-white/8 shadow-md'>
              <div className='flex items-center gap-1 px-1.5 py-0.5'>
                <span className='w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce' style={{animationDelay:'0ms'}}></span>
                <span className='w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce' style={{animationDelay:'150ms'}}></span>
                <span className='w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce' style={{animationDelay:'300ms'}}></span>
              </div>
            </div>
            <div className='flex flex-col items-center gap-1 flex-shrink-0 leading-none mb-1'>
              <img src={selectedUser?.profilePic || assets.avatar_icon} className='w-7 h-7 rounded-full object-cover border border-white/10' alt='' />
              <span className='text-[9px] text-gray-500/80 font-medium'>typing</span>
            </div>
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* BOTTOM AREA */}
      <div className='p-4 bg-[#0a0612]/35 border-t border-white/5 backdrop-blur-md flex-shrink-0'>
        {/* Reply Preview */}
        {replyingTo && (
          <div className='flex items-center justify-between bg-violet-500/15 border-l-2 border-violet-500 rounded-xl px-4 py-2 mb-3 text-sm text-gray-300 backdrop-blur-md max-w-6xl mx-auto'>
            <div className='flex-1 min-w-0'>
              <p className='text-violet-400 text-xs font-semibold'>Replying to {replyingTo.senderId===authUser._id?'yourself':selectedUser.fullname}</p>
              <p className='truncate text-xs mt-0.5 text-neutral-300'>{replyingTo.image ? '🖼️ Photo' : replyingTo.text}</p>
            </div>
            <button onClick={()=>setReplyingTo(null)} className='text-gray-400 hover:text-white ml-2 text-md cursor-pointer p-1'>✕</button>
          </div>
        )}
        
        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className='absolute bottom-20 left-6 z-10'>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme='dark'
              width={300}
              height={400}
              searchDisabled={false}
              skinTonesDisabled
              previewConfig={{showPreview:false}}
            />
          </div>
        )}

        <div className='flex items-center gap-3 max-w-6xl mx-auto'>
          <div className='flex-1 flex items-center glass-input px-4 rounded-full ring-1 ring-white/5 focus-within:ring-violet-500/30'>
            <button onClick={()=>setShowEmojiPicker(prev=>!prev)} className='text-lg cursor-pointer mr-2.5 opacity-85 hover:opacity-100 hover:scale-110 transition-all' title='Emoji'>😊</button>
            <input 
              onChange={handleInputChange} 
              value={input} 
              onKeyDown={(e)=>e.key ==="Enter"? handlesendMessage(e): null} 
              type="text" 
              placeholder='Type your message here...' 
              className='flex-1 text-sm py-3 bg-transparent border-none outline-none text-white placeholder-neutral-400'
            />
            <input type="file" onChange={handleSendImage} id='image' accept='image/png, image/jpeg' hidden/>
            <label htmlFor="image" className='cursor-pointer opacity-85 hover:opacity-100 hover:scale-105 transition-all p-1'>
              <img src={assets.gallery_icon} alt="" className='w-5' />
            </label>
          </div>
          <button 
            onClick={handlesendMessage} 
            className='w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/10 hover:scale-105 active:scale-95 transition-all flex-shrink-0'
          >
            <img src={assets.send_button} alt="" className='w-4 ml-0.5' />
          </button>
        </div>
      </div>
    </div>
  ):(
    <div className='flex-1 flex flex-col items-center justify-center gap-3 text-neutral-500 bg-[#0a0612]/15 max-md:hidden backdrop-blur-sm'>
      <div className='p-6 rounded-3xl bg-white/2 border border-white/5 shadow-2xl backdrop-blur-md flex flex-col items-center gap-4 text-center max-w-sm'>
        <img src={assets.logo_icon} className='max-w-14 filter drop-shadow-[0_2px_10px_rgba(139,92,246,0.25)] animate-pulse' alt="" />
        <div>
          <p className='text-lg font-bold text-gray-200 tracking-wide'>QuickChat E2EE</p>
          <p className='text-xs text-neutral-400 leading-relaxed mt-1'>Select a contact from the sidebar list to start chatting. Your conversations are secured with client-side end-to-end encryption.</p>
        </div>
      </div>
    </div>
  )
}

export default ChatContainer