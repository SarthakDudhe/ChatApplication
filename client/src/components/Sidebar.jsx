import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { formatLastSeen } from '../lib/utils'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'
import toast from 'react-hot-toast'

const Sidebar = () => {

  const {
    getUsers,
    users,
    conversations,
    createGroup,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    typingUsers,
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

  // Create group modal states
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const groupConversations = conversations.filter(c => c.isGroup);
  const filteredGroups = input 
    ? groupConversations.filter(c => c.groupName.toLowerCase().includes(input.toLowerCase()))
    : groupConversations;
  const filteredUsers = input 
    ? users.filter(user => user.fullname.toLowerCase().includes(input.toLowerCase()))
    : users;

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
    
    if (msg.conversationId) {
      const group = conversations.find(c => c._id === msg.conversationId);
      if (group) {
        setSelectedUser(group);
        setUnseenMessages(prev => ({...prev, [group._id]: 0}));
      }
    } else {
      const isSentByMe = msg.senderId._id === authUser._id;
      const targetUser = isSentByMe ? msg.receiverId : msg.senderId;
      const fullUser = users.find(u => u._id === targetUser._id) || targetUser;

      setSelectedUser(fullUser);
      setUnseenMessages(prev => ({...prev, [fullUser._id]: 0}));
    }
    
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

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    if (selectedParticipants.length < 2) {
      toast.error("Select at least 2 members");
      return;
    }
    const group = await createGroup({
      groupName: groupName.trim(),
      participants: selectedParticipants,
      groupAvatar: groupAvatar || ""
    });
    if (group) {
      setIsCreateGroupOpen(false);
      setGroupName("");
      setGroupAvatar("");
      setSelectedParticipants([]);
      setSelectedUser(group);
    }
  };

  return (
    <div className={`glass-panel h-full p-5 rounded-r-2xl text-white flex flex-col shadow-2xl transition-all duration-300 ${selectedUser?"max-md:hidden":""}`}>
        <div className='pb-5 flex-shrink-0'>
            <div className='flex justify-between items-center'>
                <img src={assets.logo} alt="logo" className='max-w-36 filter drop-shadow-[0_2px_8px_rgba(139,92,246,0.3)]' />
                <div className='flex items-center gap-3'>
                    {/* Create Group Button */}
                    <button 
                      onClick={() => setIsCreateGroupOpen(true)}
                      className='p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-200' 
                      title='Create Group Chat'
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                    </button>
                    
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
        {/* Groups Section */}
        {filteredGroups.length > 0 && (
          <div>
            <p className='text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2.5 px-2 flex items-center gap-1.5'>
              👥 Groups ({filteredGroups.length})
            </p>
            <div className='flex flex-col gap-1'>
              {filteredGroups.map((group) => {
                const isSelected = selectedUser && selectedUser.isGroup && selectedUser._id === group._id;
                const isTyping = typingUsers[group._id] && Object.keys(typingUsers[group._id]).length > 0;
                const typingMemberIds = isTyping ? Object.keys(typingUsers[group._id]) : [];
                const typingText = isTyping 
                  ? `${typingMemberIds.map(id => users.find(u => u._id === id)?.fullname || "Someone").join(", ")} typing...`
                  : "";
                
                return (
                  <div 
                    key={group._id} 
                    onClick={() => {
                      setSelectedUser(group);
                      setUnseenMessages(prev => ({...prev, [group._id]: 0}));
                    }} 
                    className={`relative flex items-center gap-3 p-2.5 pl-3.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5 active:scale-[0.98] ${isSelected ? 'bg-violet-500/15 border border-violet-500/30' : 'border border-transparent'}`}
                  >
                    <div className='relative flex-shrink-0'>
                      <img src={group.groupAvatar || assets.avatar_icon} alt="" className='w-[38px] h-[38px] rounded-full object-cover border border-white/10 shadow-sm'/>
                    </div>
                    <div className='flex flex-col leading-tight flex-1 min-w-0'>
                      <p className='font-medium text-sm text-gray-200 truncate'>{group.groupName}</p>
                      {isTyping ? (
                        <span className='text-violet-400 text-[10px] font-medium mt-0.5 animate-pulse'>{typingText}</span>
                      ) : (
                        <span className='text-neutral-400 text-[10px] mt-0.5 truncate'>
                          {group.participants.map(p => p.fullname).join(", ")}
                        </span>
                      )}
                    </div>
                    {unseenMessages[group._id] > 0 && (
                      <p className='absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold h-4.5 w-4.5 flex justify-center items-center rounded-full bg-violet-600 border border-violet-400 shadow-md animate-bounce text-white'>
                        {unseenMessages[group._id]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contacts Section */}
        <div>
          <p className='text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2.5 px-2 flex items-center gap-1.5'>
            👤 Contacts ({filteredUsers.length})
          </p>
          <div className='flex flex-col gap-1'>
            {filteredUsers.length === 0 ? (
              <p className='text-xs text-neutral-500 px-2 py-1'>No users found</p>
            ) : (
              filteredUsers.map((user)=>(
                <div 
                  key={user._id} 
                  onClick={()=>{
                    setSelectedUser(user);
                    setUnseenMessages(prev=>({...prev,[user._id]:0}))
                  }} 
                  className={`relative flex items-center gap-3 p-2.5 pl-3.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/5 active:scale-[0.98] ${selectedUser && !selectedUser.isGroup && selectedUser._id === user._id ? 'bg-violet-500/15 border border-violet-500/30' : 'border border-transparent'}`}
                >
                  <div className='relative flex-shrink-0'>
                    <img src={user?.profilePic ||assets.avatar_icon} alt="" className='w-[38px] h-[38px] rounded-full object-cover border border-white/10 shadow-sm'/>
                    {onlineUser.includes(user._id) && (
                      <span className='absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#120e25] animate-pulse'></span>
                    )}
                  </div>
                  <div className='flex flex-col leading-tight flex-1 min-w-0'>
                    <p className='font-medium text-sm text-gray-200 truncate'>{user.fullname}</p>
                    {typingUsers[user._id] ? (
                      <span className='text-violet-400 text-[10px] font-medium mt-0.5 animate-pulse'>typing...</span>
                    ) : onlineUser.includes(user._id) ? (
                      <span className='text-green-400 text-[10px] font-medium mt-0.5'>Online</span>
                    ) : (
                      <span className='text-neutral-400 text-[10px] mt-0.5'>{formatLastSeen(user.lastSeen)}</span>
                    )}
                  </div>
                  {unseenMessages[user._id]>0 && (
                    <p className='absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold h-4.5 w-4.5 flex justify-center items-center rounded-full bg-violet-600 border border-violet-400 shadow-md animate-bounce text-white'>
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

      {/* Create Group Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-4 text-white mx-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Create Group Chat</h3>
              <button onClick={() => setIsCreateGroupOpen(false)} className="text-gray-400 hover:text-white text-sm">✕</button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Group Details</label>
              
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img 
                    src={groupAvatar || assets.avatar_icon} 
                    alt="Group Avatar" 
                    className="w-14 h-14 rounded-full object-cover border border-white/10 shadow-md"
                  />
                  <label htmlFor="group-avatar-input" className="absolute bottom-0 right-0 bg-violet-600 hover:bg-violet-500 text-white rounded-full p-1 cursor-pointer text-[10px] shadow-md transition-colors">
                    📸
                    <input 
                      type="file" 
                      id="group-avatar-input" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setGroupAvatar(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }} 
                      hidden 
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="Enter group name..." 
                    value={groupName} 
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm text-white focus:ring-1 focus:ring-violet-500 placeholder-neutral-500"
                  />
                </div>
              </div>

              <label className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mt-2">Select Members (Min 2)</label>
              <div className="max-h-48 overflow-y-auto border border-white/5 rounded-xl bg-white/2 p-2 flex flex-col gap-1.5">
                {users.map((user) => (
                  <label key={user._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <img src={user.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                      <span className="text-sm font-medium text-gray-200">{user.fullname}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={selectedParticipants.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedParticipants(prev => [...prev, user._id]);
                        } else {
                          setSelectedParticipants(prev => prev.filter(id => id !== user._id));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 bg-white/5 border-white/10"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-white/5">
              <button 
                onClick={() => setIsCreateGroupOpen(false)} 
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateGroup} 
                disabled={!groupName.trim() || selectedParticipants.length < 2}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-sm font-semibold transition-colors shadow-lg shadow-violet-500/10"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar;




