import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from '../../context/AuthContext';

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullname, setfullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");

  const [bio, setBio] = useState(""); // ✅ initialized as empty string
  const [isDataSubmitted, setDataSubmitted] = useState(false);


const {login} =useContext(AuthContext)



  const handleSubmit = (event) => {
    event.preventDefault();
    if (currState === "Sign Up" && !isDataSubmitted) {
    setDataSubmitted(true);
      return;
    }
  
    // Final form submission logic goes here (e.g. API call)
    console.log({ fullname, email, password, bio });
    login(currState === "Sign Up" ? 'signup':'login',{ fullname, email, password, bio })
  };

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* Left */}
      <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]' />

      {/* Right */}
      <form onSubmit={handleSubmit} className='border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg'>
        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
          {isDataSubmitted && (
            <img
              onClick={() => setDataSubmitted(false)}
              src={assets.arrow_icon}
              alt=""
              className='w-5 cursor-pointer'
            />
          )}
        </h2>

        {/* Full Name - Only for Sign Up */}
        {currState === "Sign Up" && !isDataSubmitted && (
          <input
            type="text"
            onChange={(e) => setfullname(e.target.value)}
            value={fullname}
            className='p-2 border border-gray-500 rounded-md focus:outline-none'
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
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
            <input
              onChange={(e) => setpassword(e.target.value)}
              value={password}
              type="password"
              placeholder='Password'
              required
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            />
          </>
        )}

        {/* Bio - Only after sign-up basic details */}
        {currState === "Sign Up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
            placeholder='Provide a Short Bio..'
            required
          ></textarea>
        )}

        <button
          type='submit'
          className='py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer'
        >
          {currState === "Sign Up" ? "Create Account" : "Login Now"}
        </button>

        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <input type="checkbox" required />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        {/* Toggle Login/Sign Up */}
        <div className='flex flex-col gap-2'>
          {currState === "Sign Up" ? (
            <p className='text-sm text-gray-600'>
              Already have an Account?{' '}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setDataSubmitted(false); // ✅ Fixed
                }}
                className='font-medium text-violet-500 cursor-pointer'
              >
                Login here
              </span>
            </p>
          ) : (
            <p className='text-sm text-gray-600'>
              Create an Account{' '}
              <span
                onClick={() => {
                  setCurrState("Sign Up");
                  setDataSubmitted(false); // ✅ Fixed
                }}
                className='font-medium text-violet-500 cursor-pointer'
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


