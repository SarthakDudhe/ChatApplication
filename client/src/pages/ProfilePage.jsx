import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext';
import { compressImage } from '../lib/utils';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedimage, setselectedimage] = useState(null);
  const [name, setname] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (authUser) {
      setname(authUser.fullname || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedimage) {
        await updateProfile({ fullname: name, bio });
        navigate('/');
        return;
      }
      const base64Image = await compressImage(selectedimage, 300);
      await updateProfile({ profilePic: base64Image, fullname: name, bio });
      navigate('/');
    } catch (error) {
      toast.error("Error processing image file");
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-6 select-none'
      style={{ backgroundColor: '#F5F5F0', fontFamily: "'Inter', sans-serif" }}>

      <div className='w-full max-w-2xl animate-fade-in'>

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className='flex items-center gap-2 mb-6 text-sm font-medium transition-colors'
          style={{ color: '#6B7280' }}
          onMouseEnter={e => e.currentTarget.style.color = '#1C2B3A'}
          onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to Chats
        </button>

        {/* Card */}
        <div className='rounded-2xl overflow-hidden'
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E8E2', boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)' }}>

          {/* Card Header Bar */}
          <div className='px-8 py-5' style={{ backgroundColor: '#1A1A1A' }}>
            <h2 className='text-lg font-bold' style={{ fontFamily: "'Outfit', sans-serif", color: '#FAFAFA' }}>
              Profile Settings
            </h2>
            <p className='text-xs mt-0.5' style={{ color: 'rgba(250,250,250,0.45)' }}>
              Update your presence on Dialogue
            </p>
          </div>

          {/* Card Body */}
          <div className='p-8 flex flex-col md:flex-row gap-10 items-start'>

            {/* Avatar Section */}
            <div className='flex flex-col items-center gap-3 flex-shrink-0 md:w-44'>
              <label htmlFor="avatar" className='relative group cursor-pointer'>
                <input
                  onChange={(e) => setselectedimage(e.target.files[0])}
                  type="file"
                  id="avatar"
                  accept='.png, .jpg, .jpeg'
                  hidden
                />
                {/* Avatar image */}
                <div className='w-36 h-36 rounded-full overflow-hidden relative'
                  style={{ border: '3px solid #E8E8E2', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                  <img
                    src={selectedimage ? URL.createObjectURL(selectedimage) : authUser?.profilePic || assets.avatar_icon}
                    alt="Profile"
                    className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                  {/* Hover overlay */}
                  <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                    style={{ backgroundColor: 'rgba(28,43,58,0.65)' }}>
                    <div className='flex flex-col items-center gap-1'>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                      <span className='text-[10px] font-semibold text-white'>Change</span>
                    </div>
                  </div>
                </div>
              </label>

              {/* Edit photo label */}
              <label htmlFor="avatar" className='text-xs font-semibold cursor-pointer transition-colors'
                style={{ color: '#1C2B3A' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                Edit Photo
              </label>

              {selectedimage && (
                <button
                  type="button"
                  onClick={() => setselectedimage(null)}
                  className='text-xs transition-colors'
                  style={{ color: '#9CA3AF' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                >
                  Remove
                </button>
              )}
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className='flex flex-col gap-5 flex-1 w-full'>

              {/* Display Name */}
              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-semibold uppercase tracking-wider' style={{ color: '#6B7280' }}>
                  Display Name
                </label>
                <input
                  onChange={(e) => setname(e.target.value)}
                  value={name}
                  type="text"
                  required
                  placeholder='Your Name'
                  className='w-full px-4 py-3 rounded-lg text-sm transition-all outline-none'
                  style={{ backgroundColor: '#FAFAFA', border: '1px solid #E8E8E2', color: '#1A1A1A' }}
                  onFocus={e => { e.target.style.borderColor = '#1C2B3A'; e.target.style.boxShadow = '0 0 0 3px rgba(28,43,58,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8E8E2'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Bio */}
              <div className='flex flex-col gap-1.5'>
                <label className='text-xs font-semibold uppercase tracking-wider' style={{ color: '#6B7280' }}>
                  Status Bio
                </label>
                <textarea
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                  rows={4}
                  placeholder='Write something about yourself...'
                  className='w-full px-4 py-3 rounded-lg text-sm transition-all outline-none resize-none'
                  style={{ backgroundColor: '#FAFAFA', border: '1px solid #E8E8E2', color: '#1A1A1A' }}
                  onFocus={e => { e.target.style.borderColor = '#1C2B3A'; e.target.style.boxShadow = '0 0 0 3px rgba(28,43,58,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E8E8E2'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Email (read-only display) */}
              {authUser?.email && (
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wider' style={{ color: '#6B7280' }}>
                    Email
                  </label>
                  <div className='px-4 py-3 rounded-lg text-sm'
                    style={{ backgroundColor: '#F5F5F0', border: '1px solid #E8E8E2', color: '#9CA3AF' }}>
                    {authUser.email}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className='flex justify-end gap-3 pt-3 mt-2' style={{ borderTop: '1px solid #E8E8E2' }}>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className='px-5 py-2.5 rounded-lg text-sm font-semibold transition-all'
                  style={{ backgroundColor: 'transparent', border: '1px solid #E8E8E2', color: '#6B7280' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F5F5F0'; e.currentTarget.style.color = '#1A1A1A'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className='px-6 py-2.5 rounded-lg text-sm font-semibold transition-all'
                  style={{ backgroundColor: '#1C2B3A', color: '#FAFAFA' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#253545'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(28,43,58,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1C2B3A'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
