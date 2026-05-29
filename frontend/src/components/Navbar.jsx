import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const Navbar = () => {

    const [visible, setVisible] = useState(false);
    const { setShowSearch, getCartCount, token, setToken } = useContext(ShopContext);
    const navigate = useNavigate();

    const logout = () => {
        navigate('/login');
        localStorage.removeItem('token');
        setToken('');
    }

    return (
        <div className="flex items-center justify-between py-4 font-medium">

            <Link to='/'><img src={assets.logo} className='w-36' alt="logo" /></Link>

            <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
                <NavLink to='/' className='flex flex-col items-center gap-1'>
                    <p>Home</p>
                </NavLink>

                <NavLink to='/collection' className='flex flex-col items-center gap-1'>
                    <p>Collection</p>
                </NavLink>

                <NavLink to='/about' className='flex flex-col items-center gap-1'>
                    <p>About</p>
                </NavLink>

                <NavLink to='/contact' className='flex flex-col items-center gap-1'>
                    <p>Contact</p>
                </NavLink>
            </ul>

            <div className='flex items-center gap-4'>

                <img onClick={() => setShowSearch(true)} src={assets.search_icon} alt="search" className='w-5 cursor-pointer' />

                <div className='group relative'>
                    <img onClick={() => token ? null : navigate('/login')} src={assets.profile_icon} alt="" className='w-5 cursor-pointer' />

                    {token && 
                        <div className='group-hover:block hidden absolute right-0 pt-4 z-50'>
                            <div className='flex flex-col gap-4 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded shadow-md'>
                                <p className='cursor-pointer hover:text-black'>My Profile</p>
                                <p onClick={() => navigate('/orders')} className='cursor-pointer hover:text-black'>My Orders</p>
                                <p onClick={logout} className='cursor-pointer hover:text-black'>Logout</p>
                            </div>
                        </div>
                    }
                </div>

                <Link to='/cart' className='relative'>
                    <img src={assets.cart_icon} alt="" className='w-5' />
                    <p className='absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white rounded-full text-[8px]'>{getCartCount()}</p>
                </Link>

                <img
                    onClick={() => setVisible(true)}
                    src={assets.menu_icon}
                    alt="menu"
                    className='w-5 sm:hidden cursor-pointer'
                />
            </div>
            <div className={`absolute top-0 right-0  bottom-0  bg-white transition-all ${visible ? "w-full" : "w-0"} overflow-hidden`}>
                <div className='flex flex-col text-gray-600'>
                    <div onClick={() => setVisible(false)} className='flex item-center gap-4 p-3 cursor-pointer' >
                        <img className='h-4 rotate-180' src={assets.dropdown_icon} alt='' />
                        <p>Back</p>
                    </div>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/'>Home</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/collection'>Collection</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/about'>About</NavLink>
                    <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact'>Contact</NavLink>
                </div>
            </div>



        </div>
    )
}

export default Navbar