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
    <div className={`bg-[#1c1c1e] border-l border-white/5 text-white w-full relative overflow-y-auto flex flex-col p-5 select-none transition-all duration-300 ${selectedUser ? "max-md:hidden" : ""}`}>
      {/* Profile summary card */}
      <div className='flex flex-col items-center gap-4 text-center mt-6 flex-shrink-0'>
        <div className='relative'>
          <img src={selectedUser?.profilePic || assets.avatar_icon} alt="Avatar" className='w-20 h-20 rounded-full object-cover border border-white/10 shadow-lg' />
          {!selectedUser.isGroup && onlineUser.includes(selectedUser._id) && (
            <span className='absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#1c1c1e] animate-pulse'></span>
          )}
        </div>
        
        <div className='flex flex-col gap-1 w-full px-2'>
          <h1 className='text-md font-bold text-white truncate'>{selectedUser.isGroup ? selectedUser.groupName : selectedUser.fullname}</h1>
          <p className='text-xs text-neutral-400 line-clamp-3 leading-relaxed px-4 mt-0.5'>{selectedUser.bio || 'No status bio provided'}</p>
          {!selectedUser.isGroup && !onlineUser.includes(selectedUser._id) && (
            <span className='text-[10px] text-neutral-500 font-semibold mt-1'>{formatLastSeen(selectedUser.lastSeen)}</span>
          )}
        </div>
      </div>

      <hr className='border-white/5 my-6 flex-shrink-0' />

      {/* Shared Media gallery */}
      <div className='flex-1 flex flex-col min-h-0'>
        <p className='text-[10px] text-neutral-500 font-bold uppercase tracking-widest mb-3 flex justify-between items-center flex-shrink-0'>
          <span>Shared Media</span>
          <span className='bg-white/5 text-neutral-400 text-[9px] px-1.5 py-0.5 rounded font-mono'>{msgImages.length}</span>
        </p>
        
        <div className='flex-1 overflow-y-auto pr-1'>
          {msgImages.length === 0 ? (
            <p className='text-xs text-neutral-500 text-center py-6'>No shared media files found</p>
          ) : (
            <div className='grid grid-cols-2 gap-3 pb-4'>
              {msgImages.map((url,index)=>(
                <div 
                  key={index} 
                  onClick={()=>window.open(url)} 
                  className='cursor-pointer rounded-xl overflow-hidden border border-white/5 hover:border-[#00f0ff]/30 transition-all duration-200 aspect-square bg-white/2 shadow-sm'
                  title="View full image"
                >
                  <img src={url} alt="" className='w-full h-full object-cover hover:scale-105 transition-transform duration-300' />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Structured Footer Action */}
      <div className='pt-6 border-t border-white/5 w-full flex justify-center flex-shrink-0'>
        <button 
          onClick={()=>logout()} 
          className='w-full py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/10 text-xs font-semibold transition-all duration-200 cursor-pointer text-center'
        >
          Log Out Account
        </button>
      </div>
    </div>
  )
}

export default RightSidebar;