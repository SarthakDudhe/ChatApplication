import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullname, setfullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");

  const [bio, setBio] = useState("");
  const [isDataSubmitted, setDataSubmitted] = useState(false);

  const {login} =useContext(AuthContext)

  const handleSubmit = (event) => {
    event.preventDefault();
    if (currState === "Sign Up" && !isDataSubmitted) {
      setDataSubmitted(true);
      return;
    }
    login(currState === "Sign Up" ? 'signup':'login',{ fullname, email, password, bio })
  };

  return (
    <div className='min-h-screen bg-[#1A1A1A] flex items-center justify-center gap-12 sm:gap-24 max-md:flex-col p-6 select-none'>
      {/* Left Column - Big Logo */}
      <div className='flex flex-col items-center gap-2 max-md:text-center'>
        <img 
          src={assets.logo_big} 
          alt="QuickChat" 
          style={{ filter: 'invert(1) hue-rotate(180deg) brightness(1.6) contrast(1.2)' }}
          className='w-[min(35vw,220px)] drop-shadow-[0_4px_24px_rgba(212,175,55,0.15)] animate-pulse-glow rounded-3xl' 
        />
        <p className='text-xs text-[#8E8E93] font-semibold tracking-widest uppercase mt-4'>End-to-End Encrypted Chat</p>
      </div>

      {/* Right Column - Premium Auth Card */}
      <form onSubmit={handleSubmit} className='glass-panel text-[#FAF9F6] p-8 flex flex-col gap-6 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md animate-fade-in'>
        <h2 className='font-bold text-2xl flex justify-between items-center bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent'>
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="Back"
              className='w-5 cursor-pointer opacity-75 hover:opacity-100 transition-opacity'
            />
          )}
        </h2>

        {/* Full Name - Only for Sign Up */}
        {currState === "Sign Up" && !isDataSubmitted && (
          <input
            type="text"
            onChange={(e) => setfullname(e.target.value)}
            value={fullname}
            className='p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/50 text-[#FAF9F6] placeholder-neutral-500 transition-all text-sm'
            placeholder='Full Name'
            required
          />
        )}

        {/* Email & Password - Always visible */}
        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder='Email Address'
              required
              className='p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/50 text-[#FAF9F6] placeholder-neutral-500 transition-all text-sm'
            />
            <input
              onChange={(e) => setpassword(e.target.value)}
              value={password}
              type="password"
              placeholder='Password'
              required
              className='p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/50 text-[#FAF9F6] placeholder-neutral-500 transition-all text-sm'
            />
          </>
        )}

        {/* Bio - Only after sign-up basic details */}
        {currState === "Sign Up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className='p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/50 text-[#FAF9F6] placeholder-neutral-500 transition-all text-sm resize-none'
            placeholder='Tell others a bit about yourself...'
            required
          ></textarea>
        )}

        <button
          type='submit'
          className='py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-[#FAF9F6] font-semibold rounded-xl cursor-pointer hover:shadow-lg hover:shadow-violet-500/10 active:scale-[0.99] transition-all text-sm'
        >
          {currState === "Sign Up" ? (isDataSubmitted ? "Complete Signup" : "Next Details") : "Log In"}
        </button>

        <div className='flex items-center gap-2.5 text-xs text-[#8E8E93]'>
          <input type="checkbox" required className='rounded text-violet-500 focus:ring-violet-500 bg-white/5 border-white/10 w-4 h-4' />
          <p>I agree to the Terms of Service & Privacy Policy.</p>
        </div>

        {/* Toggle Login/Sign Up */}
        <div className='flex flex-col gap-2 border-t border-white/5 pt-4'>
          {currState === "Sign Up" ? (
            <p className='text-xs text-[#8E8E93]'>
              Already have an Account?{' '}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setDataSubmitted(false);
                }}
                className='font-bold text-violet-400 cursor-pointer hover:underline'
              >
                Login here
              </span>
            </p>
          ) : (
            <p className='text-xs text-[#8E8E93]'>
              Create a new Account?{' '}
              <span
                onClick={() => {
                  setCurrState("Sign Up");
                  setDataSubmitted(false);
                }}
                className='font-bold text-violet-400 cursor-pointer hover:underline'
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
