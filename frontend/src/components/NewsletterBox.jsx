import React, { useState } from 'react'
import { toast } from 'react-toastify'

const NewsletterBox = () => {
    const [email, setEmail] = useState('');

    const onSubmitHandler = (event) => {
        event.preventDefault();
        if (!email.trim()) return;

        // Display a premium, highly stylized React Toastify alert delivering the discount coupon!
        toast.success(
            <div className="text-left">
                <p className="font-bold text-sm text-green-800">🎉 Subscription Successful!</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                    Thank you for joining our newsletter. Copy your 20% discount coupon code below:
                </p>
                <div className="mt-2 py-2 px-3 bg-gray-100 border border-gray-200 rounded font-mono text-center text-sm font-extrabold text-black tracking-widest select-all cursor-pointer hover:bg-gray-200 transition-colors">
                    ADD2CART20
                </div>
            </div>,
            {
                position: "top-center",
                autoClose: 8000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            }
        );

        setEmail('');
    }

    return (
        <div className='text-center'>
            <p className='text-2xl font-medium text-gray-800'>
                Subscribe now & get 20% off
            </p>
            <p className='text-gray-400 mt-3'>
                Join our newsletter and get exclusive offers and discounts
            </p>
            <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3 rounded-sm bg-white shadow-sm'>
                <input 
                    className='w-full sm:flex-1 outline-none text-sm text-gray-700 py-3 bg-transparent' 
                    type='email' 
                    placeholder='Enter your email' 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                />
                <button type='submit' className='bg-black text-white text-xs px-10 py-4 font-bold tracking-wider hover:bg-gray-900 transition-colors' >
                    SUBSCRIBE
                </button>
            </form>
        </div>
    )
}

export default NewsletterBox