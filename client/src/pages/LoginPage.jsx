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
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (currState === "Sign Up" && !isDataSubmitted) {
      setDataSubmitted(true);
      return;
    }
    login(currState === "Sign Up" ? 'signup' : 'login', { fullname, email, password, bio });
  };

  return (
    <div className='min-h-screen flex select-none' style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT PANEL (Matt Black) ── */}
      <div className='hidden md:flex flex-col items-center justify-center w-[42%] relative overflow-hidden'
        style={{ backgroundColor: '#1A1A1A' }}>

        {/* Subtle dot pattern overlay */}
        <div className='absolute inset-0 opacity-[0.03]'
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className='relative z-10 flex flex-col items-center gap-6 text-center px-10'>
          {/* Logo Image */}
          <img src={assets.logo_icon} alt="Dialogue" className='w-56 object-contain drop-shadow-2xl' />

          {/* Features list */}
          <div className='flex flex-col gap-3 mt-4 w-full max-w-xs'>
            {[
              { icon: '🔒', text: 'End-to-end encrypted' },
              { icon: '⚡', text: 'Real-time messaging' },
              { icon: '👥', text: 'Groups & direct messages' },
            ].map((f) => (
              <div key={f.text} className='flex items-center gap-3 px-4 py-2.5 rounded-lg text-left'
                style={{ backgroundColor: 'rgba(250,250,250,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span className='text-base'>{f.icon}</span>
                <span className='text-sm font-medium' style={{ color: 'rgba(250,250,250,0.7)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className='absolute bottom-8 left-0 right-0 flex justify-center'>
          <div className='flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium'
            style={{ backgroundColor: 'rgba(250,250,250,0.06)', color: 'rgba(250,250,250,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span>🔐</span>
            <span>Secured with client-side encryption</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Smoke White) ── */}
      <div className='flex-1 flex flex-col items-center justify-center p-6 md:p-12'
        style={{ backgroundColor: '#F5F5F0' }}>

        {/* Mobile logo */}
        <div className='md:hidden flex items-center gap-2 mb-8'>
          <div className='w-8 h-8 rounded-lg overflow-hidden' style={{ backgroundColor: '#1C2B3A' }}>
            <img src={assets.logo_icon} alt="Dialogue" className='w-full h-full object-contain p-1' />
          </div>
          <span className='text-lg font-bold' style={{ fontFamily: "'Outfit', sans-serif", color: '#1A1A1A' }}>Dialogue</span>
        </div>

        {/* Auth Card */}
        <div className='w-full max-w-md animate-fade-in'>
          <div className='rounded-2xl p-8 md:p-10' style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E8E2', boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)' }}>

            {/* Card header */}
            <div className='mb-7'>
              <div className='flex items-center justify-between mb-1'>
                <h2 className='text-2xl font-bold' style={{ fontFamily: "'Outfit', sans-serif", color: '#1A1A1A' }}>
                  {currState === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
                </h2>
                {isDataSubmitted && (
                  <button
                    onClick={() => setDataSubmitted(false)}
                    className='flex items-center gap-1 text-sm font-medium transition-colors'
                    style={{ color: '#6B7280' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1C2B3A'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                  >
                    <img src={assets.arrow_icon} alt="Back" className='w-4 opacity-60' />
                    Back
                  </button>
                )}
              </div>
              <p className='text-sm' style={{ color: '#9CA3AF' }}>
                {currState === 'Sign Up'
                  ? (isDataSubmitted ? 'Almost there! Tell us a bit about yourself.' : 'Join thousands of teams using Dialogue.')
                  : 'Sign in to continue your conversations.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

              {/* Full Name */}
              {currState === "Sign Up" && !isDataSubmitted && (
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wider' style={{ color: '#6B7280' }}>Full Name</label>
                  <input
                    type="text"
                    onChange={(e) => setfullname(e.target.value)}
                    value={fullname}
                    placeholder='e.g. Alex Johnson'
                    required
                    className='w-full px-4 py-3 rounded-lg text-sm transition-all outline-none'
                    style={{ backgroundColor: '#FAFAFA', border: '1px solid #E8E8E2', color: '#1A1A1A' }}
                    onFocus={e => { e.target.style.borderColor = '#1C2B3A'; e.target.style.boxShadow = '0 0 0 3px rgba(28,43,58,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E8E8E2'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              )}

              {/* Email & Password */}
              {!isDataSubmitted && (
                <>
                  <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-semibold uppercase tracking-wider' style={{ color: '#6B7280' }}>Email Address</label>
                    <input
                      type="email"
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      placeholder='you@company.com'
                      required
                      className='w-full px-4 py-3 rounded-lg text-sm transition-all outline-none'
                      style={{ backgroundColor: '#FAFAFA', border: '1px solid #E8E8E2', color: '#1A1A1A' }}
                      onFocus={e => { e.target.style.borderColor = '#1C2B3A'; e.target.style.boxShadow = '0 0 0 3px rgba(28,43,58,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = '#E8E8E2'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div className='flex flex-col gap-1.5'>
                    <label className='text-xs font-semibold uppercase tracking-wider' style={{ color: '#6B7280' }}>Password</label>
                    <div className='relative'>
                      <input
                        type={showPassword ? "text" : "password"}
                        onChange={(e) => setpassword(e.target.value)}
                        value={password}
                        placeholder='Min. 8 characters'
                        required
                        className='w-full px-4 py-3 pr-12 rounded-lg text-sm transition-all outline-none'
                        style={{ backgroundColor: '#FAFAFA', border: '1px solid #E8E8E2', color: '#1A1A1A' }}
                        onFocus={e => { e.target.style.borderColor = '#1C2B3A'; e.target.style.boxShadow = '0 0 0 3px rgba(28,43,58,0.08)'; }}
                        onBlur={e => { e.target.style.borderColor = '#E8E8E2'; e.target.style.boxShadow = 'none'; }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold transition-colors'
                        style={{ color: '#9CA3AF' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#1C2B3A'}
                        onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Bio */}
              {currState === "Sign Up" && isDataSubmitted && (
                <div className='flex flex-col gap-1.5'>
                  <label className='text-xs font-semibold uppercase tracking-wider' style={{ color: '#6B7280' }}>Bio</label>
                  <textarea
                    onChange={(e) => setBio(e.target.value)}
                    value={bio}
                    rows={4}
                    placeholder='Tell your team a bit about yourself...'
                    required
                    className='w-full px-4 py-3 rounded-lg text-sm transition-all outline-none resize-none'
                    style={{ backgroundColor: '#FAFAFA', border: '1px solid #E8E8E2', color: '#1A1A1A' }}
                    onFocus={e => { e.target.style.borderColor = '#1C2B3A'; e.target.style.boxShadow = '0 0 0 3px rgba(28,43,58,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E8E8E2'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              )}

              {/* Terms */}
              <div className='flex items-start gap-2.5 mt-1'>
                <input
                  type="checkbox"
                  required
                  id="terms"
                  className='mt-0.5 w-4 h-4 rounded cursor-pointer'
                  style={{ accentColor: '#1C2B3A' }}
                />
                <label htmlFor="terms" className='text-xs leading-relaxed cursor-pointer' style={{ color: '#9CA3AF' }}>
                  I agree to the{' '}
                  <span className='font-semibold' style={{ color: '#1C2B3A' }}>Terms of Service</span>
                  {' '}&{' '}
                  <span className='font-semibold' style={{ color: '#1C2B3A' }}>Privacy Policy</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                className='w-full py-3.5 rounded-lg text-sm font-semibold transition-all mt-1'
                style={{ backgroundColor: '#1C2B3A', color: '#FAFAFA' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#253545'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(28,43,58,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1C2B3A'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {currState === "Sign Up" ? (isDataSubmitted ? "Complete Sign Up" : "Continue") : "Sign In"}
              </button>
            </form>

            {/* Toggle */}
            <div className='mt-6 pt-5' style={{ borderTop: '1px solid #E8E8E2' }}>
              {currState === "Sign Up" ? (
                <p className='text-sm text-center' style={{ color: '#9CA3AF' }}>
                  Already have an account?{' '}
                  <button
                    onClick={() => { setCurrState("Login"); setDataSubmitted(false); }}
                    className='font-semibold transition-colors'
                    style={{ color: '#1C2B3A' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p className='text-sm text-center' style={{ color: '#9CA3AF' }}>
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setCurrState("Sign Up"); setDataSubmitted(false); }}
                    className='font-semibold transition-colors'
                    style={{ color: '#1C2B3A' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Create one
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
