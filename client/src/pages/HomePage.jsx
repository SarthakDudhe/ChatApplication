import React, { useContext, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {
  const {selectedUser}=useContext(ChatContext)
   
  return (
    <div className='w-screen h-screen bg-[#121212] text-white overflow-hidden select-none'>
       <div className={`h-full w-full grid grid-cols-1 relative ${selectedUser ? 'md:grid-cols-[280px_1fr_300px] xl:grid-cols-[320px_1fr_320px]' : 'md:grid-cols-[320px_1fr]'} bg-[#121212]`}>
        <Sidebar/>
        <ChatContainer/>
        <RightSidebar/>
       </div>
    </div>
  )
}

export default HomePage