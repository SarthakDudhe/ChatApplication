import React, { useContext, useEffect, useRef, useState } from 'react'
import assets, { messagesDummyData } from "../assets/assets"
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import EmojiPicker from 'emoji-picker-react'
const ChatContainer = () => {

const {messages,selectedUser,setSelectedUser,sendMessage,getMessages,typingUsers,emitTyping,emitStopTyping,deleteMessage,editMessage} =useContext(ChatContext);
const {authUser,onlineUser} =useContext(AuthContext);

const[input,setInput]=useState('')
const[showEmojiPicker,setShowEmojiPicker]=useState(false)
const[contextMenu,setContextMenu]=useState(null)
const[editingMsg,setEditingMsg]=useState(null)
const[editText,setEditText]=useState('')
const typingTimeoutRef=useRef(null)
const emojiPickerRef=useRef(null)

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
if (scrollEnd.current && messages) {
  scrollEnd.current.scrollIntoView({behavior : "smooth"})
}
},[messages])




  return selectedUser ?  (
    <div className='h-full overflow-scroll relative backdrop-blur-lg'>
      {/* HEADER */}
      <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
<img src={selectedUser.profilePic || assets.avatar_icon} className='w-8 rounded-full' />
<p className='flex-1 text-lg text-white flex items-center gap-2'>
{selectedUser.fullname}
{onlineUser.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
</p>
<img onClick={()=>setSelectedUser(null)} src={assets.arrow_icon} className='md:hidden max-w-7' />
<img src={assets.help_icon} alt="" className='max-md:hidden max-w-5' />
      </div>
      {/* CHAT AREA */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
        {messages.map((msg,index)=>(
          <div key={index} className={`flex items-end gap-2 justify-end group ${msg.senderId !==authUser._id && 'flex-row-reverse'}`}>
               {msg.deleted ? (
                <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-gray-500/20 text-gray-400 italic ${msg.senderId ===authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>🚫 This message was deleted</p>
               ): editingMsg===msg._id ? (
                <div className='flex flex-col gap-1 mb-8'>
                  <input value={editText} onChange={(e)=>setEditText(e.target.value)} onKeyDown={(e)=>e.key==='Enter'?handleSaveEdit():e.key==='Escape'?handleCancelEdit():null} autoFocus className='p-2 max-w-[200px] md:text-sm font-light rounded-lg bg-violet-500/50 text-white border border-violet-400 outline-none'/>
                  <div className='flex gap-1 text-xs'>
                    <button onClick={handleSaveEdit} className='text-green-400 hover:text-green-300 cursor-pointer'>Save</button>
                    <button onClick={handleCancelEdit} className='text-red-400 hover:text-red-300 cursor-pointer'>Cancel</button>
                  </div>
                </div>
               ): msg.image ? (
                <div className='relative'>
                  <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8' />
                  {msg.senderId===authUser._id && (
                    <div className='absolute top-1 right-1 hidden group-hover:flex gap-1'>
                      <button onClick={()=>handleDelete(msg._id)} className='bg-red-500/80 text-white text-xs px-2 py-0.5 rounded cursor-pointer hover:bg-red-600' title='Delete'>🗑️</button>
                    </div>
                  )}
                </div>
               ):(
                <div className='relative'>
                  <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId ===authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>{msg.text}{msg.editedAt && <span className='text-gray-400 text-[10px] ml-1'>(edited)</span>}</p>
                  {msg.senderId===authUser._id && (
                    <div className='absolute top-1 right-1 hidden group-hover:flex gap-1'>
                      <button onClick={()=>handleStartEdit(msg)} className='bg-blue-500/80 text-white text-xs px-2 py-0.5 rounded cursor-pointer hover:bg-blue-600' title='Edit'>✏️</button>
                      <button onClick={()=>handleDelete(msg._id)} className='bg-red-500/80 text-white text-xs px-2 py-0.5 rounded cursor-pointer hover:bg-red-600' title='Delete'>🗑️</button>
                    </div>
                  )}
                </div>
               )}
               <div className='text-center text-xs'>
                 <img src={msg.senderId === authUser._id ? authUser?.profilePic || assets.avatar_icon :selectedUser?.profilePic || assets.avatar_icon} className='w-7 rounded-full' alt="" />
                 <p className='text-gray-500'>{formatMessageTime(msg.createdAt) }</p>
               </div>
          </div>
        ))}
        {/* TYPING INDICATOR */}
        {selectedUser && typingUsers[selectedUser._id] && (
          <div className='flex items-end gap-2 justify-end flex-row-reverse'>
            <div className='p-2 rounded-lg mb-8 rounded-bl-none bg-violet-500/30'>
              <div className='flex items-center gap-1 px-2 py-1'>
                <span className='w-2 h-2 rounded-full bg-white/70 animate-bounce' style={{animationDelay:'0ms'}}></span>
                <span className='w-2 h-2 rounded-full bg-white/70 animate-bounce' style={{animationDelay:'150ms'}}></span>
                <span className='w-2 h-2 rounded-full bg-white/70 animate-bounce' style={{animationDelay:'300ms'}}></span>
              </div>
            </div>
            <div className='text-center text-xs'>
              <img src={selectedUser?.profilePic || assets.avatar_icon} className='w-7 rounded-full' alt='' />
              <p className='text-gray-500'>typing</p>
            </div>
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>
{/* BOTTOM AREA */}
      <div className='absolute bottom-0 left-0 right-0 p-3'>
        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className='absolute bottom-16 left-3 z-10'>
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
        <div className='flex items-center gap-3'>
          <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>
            <button onClick={()=>setShowEmojiPicker(prev=>!prev)} className='text-xl cursor-pointer mr-1 hover:scale-110 transition-transform' title='Emoji'>😊</button>
            <input onChange={handleInputChange} value={input} onKeyDown={(e)=>e.key ==="Enter"? handlesendMessage(e): null} type="text" placeholder='Send a Message' className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'/>
            <input type="file" onChange={handleSendImage} id='image' accept='image/png, image/jpeg' hidden/>
            <label htmlFor="image">
              <img src={assets.gallery_icon} alt="" className='w-5 mr-2 cursor-pointer' />
            </label>
          </div>
          <img onClick={handlesendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer' />
        </div>
      </div>






    </div>
  ):(
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img src={assets.logo_icon} className='max-w-16' alt="" />
      <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer