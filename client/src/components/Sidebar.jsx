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
    <div className={`glass-panel h-full p-5 rounded-r-2xl text-white flex flex-col shadow-2xl transition-all duration-300 ${selectedUser?"max-md:hidden":""}`}>
        <div className='pb-5 flex-shrink-0'>
            <div className='flex justify-between items-center'>
                <img src={assets.logo} alt="logo" className='max-w-36 filter drop-shadow-[0_2px_8px_rgba(139,92,246,0.3)]' />
                <div className='relative py-2 group'>
                    <img src={assets.menu_icon} alt="menu-icon" className='max-h-5 cursor-pointer opacity-85 hover:opacity-100 transition-opacity' />
                    
                    {/* Glassmorphic Dropdown */}
                    <div className='absolute top-full right-0 z-20 w-52 p-4 rounded-xl bg-[#130f24]/90 border border-white/10 text-gray-100 hidden group-hover:block shadow-2xl backdrop-blur-xl animate-fade-in'>
                      <p onClick={()=>navigate('/profile')} className='cursor-pointer text-sm hover:text-violet-400 transition-colors font-medium flex items-center gap-2'>
                        👤 Edit Profile
                      </p>
                      <hr className='my-2.5 border-t border-white/5'/>
                      
                      {/* Premium Custom Styled Toggles */}
                      <div className='flex flex-col gap-3.5 my-2.5 text-xs text-gray-300'>
                        <div className='flex justify-between items-center'>
                          <span>Chime Sound</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type='checkbox' 
                              checked={notificationSettings?.sound ?? true}
                              onChange={(e) => setNotificationSettings(prev => ({...prev, sound: e.target.checked}))}
                              className='sr-only peer'
                            />
                            <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-500"></div>
                          </label>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span>Desktop Alerts</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type='checkbox' 
                              checked={notificationSettings?.desktop ?? true}
                              onChange={(e) => setNotificationSettings(prev => ({...prev, desktop: e.target.checked}))}
                              className='sr-only peer'
                            />
                            <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-violet-500"></div>
                          </label>
                        </div>
                      </div>
                      <hr className='my-2.5 border-t border-white/5'/>
                      <p className='cursor-pointer text-sm text-red-400 hover:text-red-300 transition-colors font-medium flex items-center gap-2' onClick={()=>logout()}>
                        🚪 Logout
                      </p>
                    </div>
                </div>
            </div>

         {/* Sleek Search Bar */}
         <div className='glass-input rounded-full flex items-center gap-2.5 py-2.5 px-4 mt-5 ring-1 ring-white/5 focus-within:ring-violet-500/30'>
          <img src={assets.search_icon} alt="Search" className='w-3.5 opacity-60'/>
          <input 
            type="text" 
            value={input}
            onChange={(e)=>setInput(e.target.value)} 
            className='bg-transparent border-none outline-none text-white text-xs placeholder-[#a0a0a0] flex-1' 
            placeholder='Search users or messages...' 
          />
         </div>
        </div>

      <div className='flex-1 overflow-y-auto pr-1 flex flex-col gap-4'>
        {/* Users Section */}
        <div>
          {input && <p className='text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2.5 px-2'>Users</p>}
          <div className='flex flex-col gap-1'>
            {filteredUsers.length === 0 ? (
              <p className='text-xs text-neutral-500 px-2 py-1'>No users found</p>
            ) : (
              filteredUsers.map((user, index)=>(
                <div 
                  key={index} 
                  onClick={()=>{setSelectedUser(user);setUnseenMessages(prev=>({...prev,[user._id]:0}))}} 
                  className={`relative flex items-center gap-3 p-2.5 pl-3.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5 active:scale-[0.98] ${selectedUser?._id ==user._id ? 'bg-violet-500/15 border border-violet-500/30' : 'border border-transparent'}`}
                >
                  <div className='relative flex-shrink-0'>
                    <img src={user?.profilePic ||assets.avatar_icon} alt="" className='w-[38px] h-[38px] rounded-full object-cover border border-white/10 shadow-sm'/>
                    {onlineUser.includes(user._id) && (
                      <span className='absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#120e25] animate-pulse'></span>
                    )}
                  </div>
                  <div className='flex flex-col leading-tight flex-1'>
                    <p className='font-medium text-sm text-gray-200'>{user.fullname}</p>
                    {onlineUser.includes(user._id) ? (
                      <span className='text-green-400 text-[10px] font-medium mt-0.5'>Online</span>
                    ) : (
                      <span className='text-neutral-400 text-[10px] mt-0.5'>{formatLastSeen(user.lastSeen)}</span>
                    )}
                  </div>
                  {unseenMessages[user._id]>0 && (
                    <p className='absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold h-4.5 w-4.5 flex justify-center items-center rounded-full bg-violet-600 border border-violet-400 shadow-md animate-bounce'>
                      {unseenMessages[user._id]}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Search Section */}
        {input.trim() !== "" && (
          <div className='border-t border-white/5 pt-4'>
            <p className='text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2.5 px-2'>Messages</p>
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
                    className='bg-white/3 hover:bg-white/6 p-3 rounded-xl cursor-pointer transition border border-white/5 hover:border-violet-500/30 flex flex-col gap-1.5'
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




