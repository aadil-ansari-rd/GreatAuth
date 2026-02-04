import React, { useContext, useEffect, useRef } from 'react'
import { assets } from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AppContent } from '../context/AppContext.jsx'

const EmailVerify = () => {

  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const { backendUrl, getUserData, isLoggedin, userData } = useContext(AppContent);

  //If account already verified, redirect to home
  useEffect(() => {
    if (isLoggedin && userData?.isAccountVerified) {
      navigate('/');
    }
  }, [isLoggedin, userData, navigate]);


  // refs for otp inputs
  const inputRefs = useRef([]);

  // handle typing
  const handleInput = (e, index) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // only digits
    e.target.value = value;

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // keyboard navigation
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // paste otp
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    const chars = paste.slice(0, 6).split('');

    chars.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });

    // focus last filled
    const lastIndex = chars.length - 1;
    if (inputRefs.current[lastIndex]) {
      inputRefs.current[lastIndex].focus();
    }
  };

  // submit otp
  const onSubmitHandler = async (e) => {
    e.preventDefault(); // ✅ fix

    try {
      const otp = inputRefs.current.map(inp => inp.value).join('');

      if (otp.length !== 6) {
        toast.error("Enter complete OTP");
        return;
      }

      const { data } = await axios.post(
        backendUrl + '/api/auth/verify-account',
        { otp }
      );

      if (data.success) {
        toast.success("Email verified successfully");
        await getUserData();
        navigate('/');
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };


  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>

      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="logo"
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 sm:p-12 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>
          Email Verify OTP
        </h1>

        <p className='text-center mb-6 text-indigo-300'>
          Enter the 6-digit code sent to your email id.
        </p>

        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              onInput={(e) => handleInput(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength="1"
              required
              type="text"
              inputMode="numeric"
              className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md m-0.5 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ))}
        </div>

        <button
          type='submit'
          className='w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full hover:opacity-90'
        >
          Verify Email
        </button>
      </form>
    </div>
  )
}

export default EmailVerify





