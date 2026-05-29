import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../assets/assets';

const Login = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(backendUrl + '/api/user/admin', { email, password });
            if (response.data.success) {
                setToken(response.data.token);
                localStorage.setItem('token', response.data.token);
                toast.success("Administrator Authenticated Successfully!");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Admin auth error:", error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to connect to authentication server.");
            }
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-200'>
                <div>
                    <h2 className='mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight'>
                        Admin Panel
                    </h2>
                    <p className='mt-2 text-center text-sm text-gray-500'>
                        Sign in to manage catalog & customer orders
                    </p>
                </div>
                <form className='mt-8 space-y-6' onSubmit={onSubmitHandler}>
                    <div className='rounded-md shadow-sm -space-y-px flex flex-col gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Admin Email Address</label>
                            <input 
                                onChange={(e) => setEmail(e.target.value)} 
                                value={email} 
                                type="email" 
                                required 
                                className='appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm' 
                                placeholder='vinuthkumar635@gmail.com' 
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Security Password</label>
                            <input 
                                onChange={(e) => setPassword(e.target.value)} 
                                value={password} 
                                type="password" 
                                required 
                                className='appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm' 
                                placeholder='••••••••' 
                            />
                        </div>
                    </div>

                    <div>
                        <button 
                            type="submit" 
                            className='group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all cursor-pointer'
                        >
                            Log In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;