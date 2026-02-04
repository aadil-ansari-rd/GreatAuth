import { assets } from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import React, { useContext, useState, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContent } from '../context/AppContext.jsx'

const ResetPassword = () => {

  axios.defaults.withCredentials = true;
  const { backendUrl, isLoggedin, setUserData, setIsLoggedin } = useContext(AppContent);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);


  // refs for otp inputs
  const inputRefs = useRef([]);

  // handle typing
  const handleInput = (e, index) => {
    let value = e.target.value.replace(/[^0-9]/g, ''); // only digits
    e.target.value = value;

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();

    }
  };

  // keyboard navigation
  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
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


  //Submit Email Handler
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/send-reset-otp', { email });
      if (data.success) {
        setIsEmailSent(true);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");

    }
  }

  //On Submit OTP Handler
  const onSubmitOTP = async (e) => {

    e.preventDefault();
    try {
      const otpArr = inputRefs.current.map(el => el?.value || '');
      const finalOtp = otpArr.join('');
      if (finalOtp.length !== 6) {
        return toast.error("Enter complete OTP");
      }


      setOtp(finalOtp);
      setIsOtpSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }

  }

  //Logout
  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout', {}, { withCredentials: true });
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");


    }
  }

  //On Submit New Password Handler
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/reset-password', { email, otp, newPassword });
      if (data.success) {
        toast.success(data.message);
        if (isLoggedin) {
          await logout();
        } else {
          navigate('/login');
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");

    }
  }

  return (

    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="logo"
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />

      {/* Enter Email Address  Form */}


      {!isEmailSent &&

        <form onSubmit={onSubmitEmail} className='bg-slate-900 p-8 sm:p-12 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>
            Reset Password
          </h1>

          <p className='text-center mb-6 text-indigo-300'>
            Enter your registered email address.
          </p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" className='w-3.5 h-3.5' />
            <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder='Email id' className='bg-transparent outline-none text-white' />

          </div>

          <p className='text-gray-400 text-start text-xs m-4'>
            {isLoggedin ? (
              <>
                Don't want to reset password?{' '}
                <span
                  onClick={() => navigate('/')}
                  className='text-blue-400 cursor-pointer underline'
                >
                  Go to Home
                </span>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <span
                  onClick={() => navigate('/login')}
                  className='text-blue-400 cursor-pointer underline'
                >
                  Sign Up
                </span>
              </>
            )}
          </p>


          <button
            type='submit'
            className='w-full py-2.5  bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 hover:opacity-90'
          >
            Submit
          </button>
        </form>

      }

      {/* OTP Input Form  */}

      {!isOtpSubmitted && isEmailSent &&

        <form onSubmit={onSubmitOTP} className='bg-slate-900 p-8 sm:p-12 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>
            Email Password OTP
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

          <p className='text-gray-400 text-start text-xs m-4'>
            Don't want to reset password?{' '}
            <span
              onClick={() => navigate('/')}
              className='text-blue-400 cursor-pointer underline'
            >
              Go to Home
            </span>
          </p>

          <button
            type='submit'
            className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full hover:opacity-90'
          >
            Submit
          </button>
        </form>

      }


      {/* New Password Form */}


      {isOtpSubmitted && isEmailSent &&

        <form onSubmit={onSubmitNewPassword} className='bg-slate-900 p-8 sm:p-12 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>
            New Password
          </h1>

          <p className='text-center mb-6 text-indigo-300'>
            Enter your new password below.
          </p>

          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <img src={assets.lock_icon} alt="" className='w-3.5 h-3.5' />
            <input required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder='New Password' className='bg-transparent outline-none text-white' />

          </div>

          <p className='text-gray-400 text-start text-xs m-4'>
            Don't want to reset password?{' '}
            <span
              onClick={() => navigate('/')}
              className='text-blue-400 cursor-pointer underline'
            >
              Go to Home
            </span>
          </p>

          <button
            type='submit'
            className='w-full py-2.5  bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3 hover:opacity-90'
          >
            Submit
          </button>


        </form>
      }
    </div>
  )
}

export default ResetPassword
