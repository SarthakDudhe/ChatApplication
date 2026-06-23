import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { formatLastSeen } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'

const RightSidebar = () => {

  const {selectedUser,messages} =useContext(ChatContext)
  const {logout,authUser,onlineUser}=useContext(AuthContext)
  const [msgImages,setMsgImages]=useState([])

  //Get all images from the messages and set them to state
  useEffect(()=>{
    setMsgImages(
      messages.filter(msg=>msg.image).map(msg=>msg.image)
    )
  },[messages])

  return selectedUser && (
    <div className={`bg-[#F5F5F0] border-l border-[#E8E8E2] text-[#1A1A1A] w-full relative overflow-y-auto flex flex-col p-5 select-none transition-all duration-300 ${selectedUser ? "max-md:hidden" : ""}`}>
      {/* Profile summary card */}
      <div className='flex flex-col items-center gap-4 text-center mt-6 flex-shrink-0'>
        <div className='relative'>
          <img 
            src={selectedUser.isGroup ? (selectedUser.groupAvatar || assets.avatar_icon) : (selectedUser?.profilePic || assets.avatar_icon)} 
            alt="Avatar" 
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            className='w-20 h-20 rounded-full object-cover border border-[#E8E8E2] shadow-sm select-none' 
          />
          {!selectedUser.isGroup && onlineUser.includes(selectedUser._id) && (
            <span className='absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#F5F5F0] animate-pulse'></span>
          )}
        </div>
        
        <div className='flex flex-col gap-1 w-full px-2'>
          <h1 className='text-sm font-bold text-[#1A1A1A] truncate'>{selectedUser.isGroup ? selectedUser.groupName : selectedUser.fullname}</h1>
          <p className='text-xs text-[#6B7280] line-clamp-3 leading-relaxed px-4 mt-0.5'>{selectedUser.bio || 'No status bio provided'}</p>
          {!selectedUser.isGroup && !onlineUser.includes(selectedUser._id) && (
            <span className='text-[10px] text-[#9CA3AF] font-semibold mt-1'>{formatLastSeen(selectedUser.lastSeen)}</span>
          )}
        </div>
      </div>

      <hr className='border-[#E8E8E2] my-6 flex-shrink-0' />

      {/* Shared Media gallery */}
      <div className='flex-1 flex flex-col min-h-0'>
        <p className='text-[10px] text-[#6B7280] font-bold uppercase tracking-widest mb-3 flex justify-between items-center flex-shrink-0'>
          <span className='flex items-center gap-1.5'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            Shared Media
          </span>
          <span className='bg-[#1C2B3A]/10 text-[#1C2B3A] text-[9px] px-1.5 py-0.5 rounded font-mono'>{msgImages.length}</span>
        </p>
        
        <div className='flex-1 overflow-y-auto pr-1'>
          {msgImages.length === 0 ? (
            <p className='text-xs text-[#9CA3AF] text-center py-6'>No shared media files found</p>
          ) : (
            <div className='grid grid-cols-2 gap-3 pb-4'>
              {msgImages.map((url,index)=>(
                <div 
                  key={index} 
                  className='rounded-xl overflow-hidden border border-[#E8E8E2] transition-all duration-200 aspect-square bg-white shadow-sm select-none'
                >
                  <img src={url} alt="" onContextMenu={(e)=>e.preventDefault()} draggable={false} className='w-full h-full object-cover' />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Structured Footer Action */}
      <div className='pt-6 border-t border-[#E8E8E2] w-full flex justify-center flex-shrink-0'>
        <button 
          onClick={()=>logout()} 
          className='w-full py-2.5 rounded-xl border border-red-200 hover:border-red-300 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-semibold transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5'
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          Log Out Account
        </button>
      </div>
    </div>
  )
}

export default RightSidebar;