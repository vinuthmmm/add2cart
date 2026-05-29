import React from 'react';
import { assets } from '../assets/assets';

const Navbar = ({ setToken }) => {
    return (
        <div className='flex items-center justify-between py-2 px-[4%] border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm'>
            <div className='flex items-center gap-3'>
                <img className='w-[130px]' src={assets.logo} alt="admin logo" />
                <span className='px-2.5 py-0.5 bg-black text-white text-xs font-semibold rounded-full uppercase tracking-wider'>
                    Admin Panel
                </span>
            </div>
            <button 
                onClick={() => {
                    localStorage.removeItem('token');
                    setToken('');
                }} 
                className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-red-600 hover:shadow transition-all cursor-pointer'
            >
                Logout
            </button>
        </div>
    );
};

export default Navbar;