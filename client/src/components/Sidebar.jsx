import React, { useContext, useEffect, useState } from 'react'
import assets, { userDummyData } from '../assets/assets'
import { formatLastSeen } from '../lib/utils'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'

const Sidebar = () => {

  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    searchResults,
    isSearching,
    searchQuery,
    searchMessages,
    setHighlightMessageId,
    notificationSettings,
    setNotificationSettings
  } = useContext(ChatContext)

  const {logout,onlineUser,authUser}=useContext(AuthContext)

  const [input,setInput]= useState("")
  const navigate=useNavigate();

  const filteredUsers = input ? users.filter((user)=>user.fullname.toLowerCase().includes(input.toLowerCase())) : users;

  useEffect(()=>{
    getUsers();
  },[onlineUser])

  // Debounce search query for messages
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchMessages(input);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [input]);

  const handleSelectMessageResult = (msg) => {
    if (!authUser) return;
    const isSentByMe = msg.senderId._id === authUser._id;
    const targetUser = isSentByMe ? msg.receiverId : msg.senderId;
    const fullUser = users.find(u => u._id === targetUser._id) || targetUser;

    setSelectedUser(fullUser);
    setUnseenMessages(prev => ({...prev, [fullUser._id]: 0}));
    
    // We will set the message highlight ID in ChatContext in Step 14
    if (msg._id && setHighlightMessageId) {
      setHighlightMessageId(msg._id);
    }
  };

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-violet-500/50 text-white rounded px-0.5 font-semibold">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white flex flex-col ${selectedUser?"max-md:hidden":""}`}>
        <div className='pb-5 flex-shrink-0'>
            <div className='flex justify-between items-center'>
                <img src={assets.logo} alt="logo" className='max-w-40' />
                <div className='relative py-2 group'>
                    <img src={assets.menu_icon} alt="menu-icon" className='max-h-5 cursor-pointer' />
                    <div className='absolute top-full right-0 z-20 w-48 p-4 rounded-lg bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block shadow-xl'>
                      <p onClick={()=>navigate('/profile')} className='cursor-pointer text-sm hover:text-violet-400 transition-colors'>Edit Profile</p>
                      <hr className='my-2 border-t border-gray-700/50'/>
                      <div className='flex flex-col gap-2.5 my-2.5 text-xs text-gray-300'>
                        <div className='flex justify-between items-center'>
                          <span>Chime Sound</span>
                          <input 
                            type='checkbox' 
                            checked={notificationSettings?.sound ?? true}
                            onChange={(e) => setNotificationSettings(prev => ({...prev, sound: e.target.checked}))}
                            className='w-3.5 h-3.5 accent-violet-500 cursor-pointer'
                          />
                        </div>
                        <div className='flex justify-between items-center'>
                          <span>Desktop Alerts</span>
                          <input 
                            type='checkbox' 
                            checked={notificationSettings?.desktop ?? true}
                            onChange={(e) => setNotificationSettings(prev => ({...prev, desktop: e.target.checked}))}
                            className='w-3.5 h-3.5 accent-violet-500 cursor-pointer'
                          />
                        </div>
                      </div>
                      <hr className='my-2 border-t border-gray-700/50'/>
                      <p className='cursor-pointer text-sm text-red-400 hover:text-red-300 transition-colors font-medium' onClick={()=>logout()}>Logout</p>
                    </div>
                </div>
            </div>

         <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
          <img src={assets.search_icon} alt="Search" className='w-3'/>
          <input 
            type="text" 
            value={input}
            onChange={(e)=>setInput(e.target.value)} 
            className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' 
            placeholder='Search users or messages...' 
          />
         </div>
        </div>

      <div className='flex-1 overflow-y-auto pr-1 flex flex-col gap-4'>
        {/* Users Section */}
        <div>
          {input && <p className='text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2 px-2'>Users</p>}
          <div className='flex flex-col gap-1'>
            {filteredUsers.length === 0 ? (
              <p className='text-xs text-neutral-500 px-2 py-1'>No users found</p>
            ) : (
              filteredUsers.map((user, index)=>(
                <div key={index} onClick={()=>{setSelectedUser(user);setUnseenMessages(prev=>({...prev,[user._id]:0}))}} className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer transition hover:bg-[#282142]/30 max-sm:text-sm ${selectedUser?._id ==user._id && 'bg-[#282142]/50'}`}>
                  <img src={user?.profilePic ||assets.avatar_icon} alt="" className='w-[35px] aspect-[1/1] rounded-full object-cover'/>
                  <div className='flex flex-col leading-5'>
                    <p className='font-medium'>{user.fullname}</p>
                    {onlineUser.includes(user._id) ? (
                      <span className='text-green-400 text-xs'>Online</span>
                    ) : (
                      <span className='text-neutral-400 text-xs'>{formatLastSeen(user.lastSeen)}</span>
                    )}
                  </div>
                  {unseenMessages[user._id]>0 && <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500'>{unseenMessages[user._id]}</p> }
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Search Section */}
        {input.trim() !== "" && (
          <div className='border-t border-gray-700/30 pt-3'>
            <p className='text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2 px-2'>Messages</p>
            {isSearching ? (
              <p className='text-xs text-neutral-500 px-2 py-1 animate-pulse'>Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className='text-xs text-neutral-500 px-2 py-1'>No matching messages</p>
            ) : (
              <div className='flex flex-col gap-2'>
                {searchResults.map((msg) => (
                  <div 
                    key={msg._id} 
                    onClick={() => handleSelectMessageResult(msg)}
                    className='bg-[#282142]/20 hover:bg-[#282142]/60 p-2.5 rounded cursor-pointer transition border-l-2 border-transparent hover:border-violet-500 flex flex-col gap-1'
                  >
                    <div className='flex justify-between items-center text-[10px] text-neutral-400'>
                      <span className='font-semibold text-neutral-300'>
                        {msg.senderId._id === authUser?._id ? 'You' : msg.senderId.fullname}
                      </span>
                      <span>{formatMessageTime(msg.createdAt)}</span>
                    </div>
                    <p className='text-xs text-gray-300 line-clamp-2 leading-relaxed'>
                      {highlightText(msg.text, input)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar;




