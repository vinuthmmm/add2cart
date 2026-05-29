import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Sidebar = () => {
    return (
        <div className='w-[18%] min-h-screen border-r border-gray-200 bg-white pt-6 pl-[2%] flex flex-col gap-4 text-[15px]'>
            <NavLink 
                to="/add" 
                className={({ isActive }) => 
                    `flex items-center gap-3 border border-r-0 border-gray-300 px-3 py-2.5 rounded-l-md transition-all hover:bg-gray-50 ${
                        isActive ? 'bg-[#ffebf0] border-[#ff4e6e] text-black font-semibold border-r-2 border-r-[#ff4e6e]' : 'text-gray-700'
                    }`
                }
            >
                <img className='w-5 h-5' src={assets.add_icon} alt="add icon" />
                <p className='hidden md:block'>Add Items</p>
            </NavLink>

            <NavLink 
                to="/list" 
                className={({ isActive }) => 
                    `flex items-center gap-3 border border-r-0 border-gray-300 px-3 py-2.5 rounded-l-md transition-all hover:bg-gray-50 ${
                        isActive ? 'bg-[#ffebf0] border-[#ff4e6e] text-black font-semibold border-r-2 border-r-[#ff4e6e]' : 'text-gray-700'
                    }`
                }
            >
                <img className='w-5 h-5' src={assets.order_icon} alt="list icon" />
                <p className='hidden md:block'>List Items</p>
            </NavLink>

            <NavLink 
                to="/orders" 
                className={({ isActive }) => 
                    `flex items-center gap-3 border border-r-0 border-gray-300 px-3 py-2.5 rounded-l-md transition-all hover:bg-gray-50 ${
                        isActive ? 'bg-[#ffebf0] border-[#ff4e6e] text-black font-semibold border-r-2 border-r-[#ff4e6e]' : 'text-gray-700'
                    }`
                }
            >
                <img className='w-5 h-5' src={assets.order_icon} alt="orders icon" />
                <p className='hidden md:block'>Orders</p>
            </NavLink>
        </div>
    );
};

export default Sidebar;
