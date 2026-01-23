import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';

const Login = () => {

    const navigate = useNavigate();

    const [state, setState] = useState('Sign Up');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault()   // ✅ page reload stop
        console.log(state, 'form submitted')
    }

    return (
        <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>

            <img
            onClick={()=>navigate('/')}
                src={assets.logo}
                alt="logo"
                className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
            />

            <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
                <h2 className='text-3xl font-semibold text-white text-center mb-3'>
                    {state === 'Sign Up' ? 'Create Account' : 'Login'}
                </h2>

                <p className='text-center mb-6'>
                    {state === 'Sign Up'
                        ? 'Create your account'
                        : 'Login to your account!'}
                </p>

                <form onSubmit={handleSubmit}>
                    {state === 'Sign Up' && (
                        <div className='mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
                            <img src={assets.person_icon} alt="user icon" />
                            <input
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                className='bg-transparent outline-none w-full'
                                placeholder='Full Name'
                                type="text"
                                name="name"
                                required
                            />
                        </div>
                    )}

                    <div className='mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.mail_icon} alt="mail icon" />
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            className='bg-transparent outline-none w-full'
                            placeholder='Email ID'
                            type="email"
                            name="email"
                            required
                        />
                    </div>

                    <div className='mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.lock_icon} alt="lock icon" />
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            className='bg-transparent outline-none w-full'
                            placeholder='Password'
                            type="password"
                            name="password"
                            required
                        />
                    </div>

                    {/* ✅ Forgot password only for Login */}
                    {state === 'Login' && (

                        <button
                            onClick={()=>{navigate('/reset-password')}}
                            type="button"
                            className='mb-4 text-indigo-500 text-left w-full'
                        >
                            Forgot Password?
                        </button>
                    )}

                    <button
                        type="submit"
                        className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'
                    >
                        {state === 'Sign Up' ? 'Sign Up' : 'Login'}
                    </button>
                </form>

                {state === 'Sign Up' ? (
                    <p className='text-gray-400 text-center text-xs mt-4'>
                        Already have an account?{' '}
                        <span
                            onClick={() => setState('Login')}
                            className='text-blue-400 cursor-pointer underline'
                        >
                            Login here
                        </span>
                    </p>
                ) : (
                    <p className='text-gray-400 text-center text-xs mt-4'>
                        Don&apos;t have an account?{' '}
                        <span
                            onClick={() => setState('Sign Up')}
                            className='text-blue-400 cursor-pointer underline'
                        >
                            Sign up
                        </span>
                    </p>
                )}
            </div>
        </div>
    )
}

export default Login
