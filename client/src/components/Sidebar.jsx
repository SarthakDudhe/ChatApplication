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
            <mark key={i} className="bg-[#D4AF37]/30 text-[#FAF9F6] rounded px-0.5 font-semibold">{part}</mark>
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
    <div className={`bg-[#242424] border-r border-white/5 h-full p-4 text-[#FAF9F6] flex flex-col select-none transition-all duration-300 ${selectedUser?"max-md:hidden":""}`}>
        {/* User Profile Info Header */}
        <div className='pb-4 flex-shrink-0 border-b border-white/5'>
            <div className='flex justify-between items-center'>
                <div className='flex items-center gap-2.5 cursor-pointer' onClick={() => navigate('/profile')}>
                    <div className='relative'>
                      <img src={authUser?.profilePic || assets.avatar_icon} alt="Avatar" className='w-9 h-9 rounded-full object-cover border border-white/10 shadow-sm' />
                      <span className='absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border border-[#242424]'></span>
                    </div>
                    <div className='flex flex-col text-left leading-none'>
                      <span className='text-sm font-semibold text-[#FAF9F6] hover:text-[#D4AF37] transition-colors'>{authUser?.fullname || 'Profile'}</span>
                      <span className='text-[10px] text-[#8E8E93] mt-0.5'>Active now</span>
                    </div>
                </div>

                <div className='flex items-center gap-1.5'>
                    {/* Create Group Button */}
                    <button 
                      onClick={() => setIsCreateGroupOpen(true)}
                      className='p-2 rounded-lg hover:bg-white/5 text-[#8E8E93] hover:text-[#FAF9F6] transition-all duration-200' 
                      title='New Group Chat'
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                    </button>
                    
                    {/* Settings Trigger */}
                    <div className='relative py-1 group'>
                        <button className='p-2 rounded-lg hover:bg-white/5 text-[#8E8E93] hover:text-[#FAF9F6] transition-all duration-200'>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.557 0 1.02.4 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.273.807-.109 1.205.166.397.505.71.93.78l.894.15c.542.09.94.56.94 1.11v1.094c0 .558-.4 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.557 0-1.02-.4-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 0 1-1.448-.12l-.774-.772a1.125 1.125 0 0 1-.12-1.45l.527-.737c.251-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.557.4-1.02.94-1.11l.894-.148c.424-.07.765-.385.93-.782.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.772-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.108.397-.165.71-.505.78-.929l.15-.894Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </button>
                        
                        {/* Settings Dropdown Menu */}
                        <div className='absolute top-full right-0 z-20 w-52 p-4 rounded-xl bg-[#242424] border border-white/5 text-[#FAF9F6] hidden group-hover:block shadow-2xl backdrop-blur-xl animate-fade-in'>
                          <p onClick={()=>navigate('/profile')} className='cursor-pointer text-sm hover:text-[#D4AF37] transition-colors font-medium flex items-center gap-2'>
                            👤 Edit Profile
                          </p>
                          <hr className='my-2.5 border-t border-white/5'/>
                          
                          <div className='flex flex-col gap-3.5 my-2.5 text-xs text-[#8E8E93]'>
                            <div className='flex justify-between items-center'>
                              <span>Chime Sound</span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type='checkbox' 
                                  checked={notificationSettings?.sound ?? true}
                                  onChange={(e) => setNotificationSettings(prev => ({...prev, sound: e.target.checked}))}
                                  className='sr-only peer'
                                />
                                <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#D4AF37]"></div>
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
                                <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#D4AF37]"></div>
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

         {/* Premium Search Container */}
         <div className='bg-white/3 border border-white/5 rounded-xl flex items-center gap-3 py-2.5 px-4 mt-4 transition-all focus-within:border-[#D4AF37]/30 focus-within:ring-1 focus-within:ring-[#D4AF37]/30'>
          <img src={assets.search_icon} alt="Search" className='w-3.5 opacity-40'/>
          <input 
            type="text" 
            value={input}
            onChange={(e)=>setInput(e.target.value)} 
            className='bg-transparent border-none outline-none text-[#FAF9F6] text-xs placeholder-[#606060] flex-1' 
            placeholder='Search chats or messages...' 
          />
         </div>
        </div>

      {/* Categorized Lists */}
      <div className='flex-1 overflow-y-auto pr-1 mt-4 flex flex-col gap-5'>
        {/* Groups Column */}
        {filteredGroups.length > 0 && (
          <div>
            <p className='text-[10px] text-[#8E8E93] font-bold uppercase tracking-widest px-2 mb-2 flex justify-between items-center'>
              <span>👥 Groups</span>
              <span className='bg-white/5 text-[#8E8E93] text-[9px] px-1.5 py-0.5 rounded font-mono'>{filteredGroups.length}</span>
            </p>
            <div className='flex flex-col gap-1.5'>
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
                    className={`relative flex items-center gap-3 p-2.5 pl-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/3 active:scale-[0.98] ${isSelected ? 'bg-white/5 border border-white/5' : 'border border-transparent'}`}
                  >
                    {isSelected && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-md bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></span>
                    )}

                    <div className='relative flex-shrink-0'>
                      <img src={group.groupAvatar || assets.avatar_icon} alt="" className='w-9 h-9 rounded-full object-cover border border-white/10 shadow-sm'/>
                    </div>
                    <div className='flex flex-col leading-tight flex-1 min-w-0'>
                      <p className='font-semibold text-sm text-[#FAF9F6] truncate'>{group.groupName}</p>
                      {isTyping ? (
                        <span className='text-[#D4AF37] text-[10px] font-medium mt-0.5 animate-pulse'>{typingText}</span>
                      ) : (
                        <span className='text-neutral-450 text-[10px] mt-0.5 truncate text-[#8E8E93]'>
                          {group.participants.map(p => p.fullname).join(", ")}
                        </span>
                      )}
                    </div>
                    {unseenMessages[group._id] > 0 && (
                      <p className='absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FF6B35] text-[#FAF9F6] shadow-[0_0_8px_rgba(255,107,53,0.3)] animate-pulse'>
                        {unseenMessages[group._id]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contacts Column */}
        <div>
          <p className='text-[10px] text-[#8E8E93] font-bold uppercase tracking-widest px-2 mb-2 flex justify-between items-center'>
            <span>👤 Direct Messages</span>
            <span className='bg-white/5 text-[#8E8E93] text-[9px] px-1.5 py-0.5 rounded font-mono'>{filteredUsers.length}</span>
          </p>
          <div className='flex flex-col gap-1.5'>
            {filteredUsers.length === 0 ? (
              <p className='text-xs text-[#8E8E93] px-2 py-1'>No contacts found</p>
            ) : (
              filteredUsers.map((user)=>(
                <div 
                  key={user._id} 
                  onClick={()=>{
                    setSelectedUser(user);
                    setUnseenMessages(prev=>({...prev,[user._id]:0}))
                  }} 
                  className={`relative flex items-center gap-3 p-2.5 pl-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/3 active:scale-[0.98] ${selectedUser && !selectedUser.isGroup && selectedUser._id === user._id ? 'bg-white/5 border border-white/5' : 'border border-transparent'}`}
                >
                  {selectedUser && !selectedUser.isGroup && selectedUser._id === user._id && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-md bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></span>
                  )}

                  <div className='relative flex-shrink-0'>
                    <img src={user?.profilePic ||assets.avatar_icon} alt="" className='w-9 h-9 rounded-full object-cover border border-white/10 shadow-sm'/>
                    {onlineUser.includes(user._id) && (
                      <span className='absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#242424] animate-pulse'></span>
                    )}
                  </div>
                  <div className='flex flex-col leading-tight flex-1 min-w-0'>
                    <p className='font-semibold text-sm text-[#FAF9F6] truncate'>{user.fullname}</p>
                    {typingUsers[user._id] ? (
                      <span className='text-[#D4AF37] text-[10px] font-medium mt-0.5 animate-pulse'>typing...</span>
                    ) : onlineUser.includes(user._id) ? (
                      <span className='text-green-400 text-[10px] font-medium mt-0.5'>Online</span>
                    ) : (
                      <span className='text-[#8E8E93] text-[10px] mt-0.5'>{formatLastSeen(user.lastSeen)}</span>
                    )}
                  </div>
                  {unseenMessages[user._id]>0 && (
                    <p className='absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FF6B35] text-[#FAF9F6] shadow-[0_0_8px_rgba(255,107,53,0.3)] animate-pulse'>
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
            <p className='text-[10px] text-[#8E8E93] font-bold uppercase tracking-widest px-2 mb-2'>Search Results</p>
            {isSearching ? (
              <p className='text-xs text-[#8E8E93] px-2 py-1 animate-pulse'>Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className='text-xs text-[#8E8E93] px-2 py-1'>No matching messages</p>
            ) : (
              <div className='flex flex-col gap-2'>
                {searchResults.map((msg) => (
                  <div 
                    key={msg._id} 
                    onClick={() => handleSelectMessageResult(msg)}
                    className='bg-white/2 hover:bg-white/5 p-3 rounded-xl cursor-pointer transition border border-white/5 hover:border-[#D4AF37]/30 flex flex-col gap-1.5'
                  >
                    <div className='flex justify-between items-center text-[10px] text-[#8E8E93]'>
                      <span className='font-semibold text-[#FAF9F6]'>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md transition-all duration-300">
          <div className="bg-[#242424] border border-white/10 w-full max-w-md p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-[#FAF9F6] mx-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Create Group Chat</h3>
              <button onClick={() => setIsCreateGroupOpen(false)} className="text-[#8E8E93] hover:text-[#FAF9F6] text-sm">✕</button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs text-[#8E8E93] font-semibold uppercase tracking-wider">Group Details</label>
              
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img 
                    src={groupAvatar || assets.avatar_icon} 
                    alt="Group Avatar" 
                    className="w-14 h-14 rounded-full object-cover border border-white/10 shadow-md"
                  />
                  <label htmlFor="group-avatar-input" className="absolute bottom-0 right-0 bg-[#D4AF37] hover:bg-[#C5A02B] text-black rounded-full p-1 cursor-pointer text-[10px] shadow-md transition-colors">
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
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 outline-none text-sm text-[#FAF9F6] focus:ring-1 focus:ring-[#D4AF37] placeholder-neutral-500"
                  />
                </div>
              </div>

              <label className="text-xs text-[#8E8E93] font-semibold uppercase tracking-wider mt-2">Select Members (Min 2)</label>
              <div className="max-h-48 overflow-y-auto border border-white/5 rounded-xl bg-white/2 p-2 flex flex-col gap-1.5">
                {users.map((user) => (
                  <label key={user._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <img src={user.profilePic || assets.avatar_icon} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                      <span className="text-sm font-medium text-[#FAF9F6]">{user.fullname}</span>
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
                      className="w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37] bg-white/5 border-white/10"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-white/5">
              <button 
                onClick={() => setIsCreateGroupOpen(false)} 
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors text-[#FAF9F6]"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateGroup} 
                disabled={!groupName.trim() || selectedParticipants.length < 2}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-sm font-semibold transition-colors shadow-lg shadow-violet-500/10 text-white"
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
