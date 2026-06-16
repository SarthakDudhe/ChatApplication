import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext';

const ProfilePage = () => {
  const {authUser,updateProfile}=useContext(AuthContext)
  const navigate=useNavigate();

  const [selectedimage,setselectedimage]=useState(null);
  const [name,setname]=useState("");
  const [bio,setBio]=useState("");

  useEffect(() => {
    if (authUser) {
      setname(authUser.fullname || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  const handleSubmit= async(e)=>{
    e.preventDefault();
    if(!selectedimage) {
      await updateProfile({fullname:name,bio})
      navigate('/');
      return;
    }
    const reader =new FileReader();
    reader.readAsDataURL(selectedimage);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({profilePic:base64Image,fullname:name,bio})
      navigate('/')
    }
  }

  return (
    <div className='min-h-screen bg-[#1A1A1A] flex items-center justify-center p-6 select-none'>
      <div className='w-full max-w-2xl glass-panel text-[#8E8E93] flex items-center justify-between max-sm:flex-col-reverse rounded-2xl border border-white/10 shadow-2xl p-8 md:p-12 gap-8 animate-fade-in'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6 flex-1 w-full'>
          <div>
            <h3 className='text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent'>Profile Details</h3>
            <p className='text-xs text-[#8E8E93] mt-1'>Update your presence on QuickChat</p>
          </div>

          <label htmlFor="avatar" className='flex items-center gap-4 cursor-pointer text-sm font-semibold text-[#FAF9F6] hover:text-violet-400 transition-colors'>
            <input onChange={(e)=>setselectedimage(e.target.files[0])} type="file" id="avatar" accept='.png, .jpg, .jpeg' hidden />
            <img 
              src={selectedimage ? URL.createObjectURL(selectedimage) : authUser?.profilePic || assets.avatar_icon } 
              className='w-14 h-14 rounded-full object-cover border border-white/10 shadow-md'
              alt="Avatar Preview"
            />
            <span>Upload Profile Image</span>
          </label>
          
          <div className='flex flex-col gap-1.5'>
            <label className='text-xs text-[#8E8E93] font-semibold uppercase tracking-wider'>Display Name</label>
            <input 
              onChange={(e)=>setname(e.target.value)} 
              value={name} 
              type="text" 
              required 
              placeholder='Your Name' 
              className='p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/50 text-[#FAF9F6] placeholder-neutral-500 transition-all text-sm'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-xs text-[#8E8E93] font-semibold uppercase tracking-wider'>Status Bio</label>
            <textarea 
              onChange={(e)=>setBio(e.target.value)} 
              value={bio} 
              rows={4} 
              placeholder='Write something about yourself...' 
              className='p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/50 text-[#FAF9F6] placeholder-neutral-500 transition-all text-sm resize-none'
            ></textarea>
          </div>
            
          <div className='flex justify-end gap-3 border-t border-white/5 pt-4 mt-2'>
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors text-[#FAF9F6]"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className='px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-[#FAF9F6] rounded-xl cursor-pointer hover:shadow-lg hover:shadow-violet-500/10 active:scale-[0.99] transition-all'
            >
              Save Changes
            </button>
          </div>
        </form>

        <div className='flex flex-col items-center gap-4 flex-shrink-0'>
          <img 
            src={selectedimage ? URL.createObjectURL(selectedimage) : authUser?.profilePic || assets.avatar_icon} 
            alt="Profile Avatar" 
            className='w-40 h-40 rounded-full border-2 border-white/10 shadow-2xl object-cover max-sm:mt-4' 
          />
          <span className='text-[10px] text-[#8E8E93] font-semibold uppercase tracking-widest'>Current Photo</span>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage;
