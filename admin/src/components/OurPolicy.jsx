import React from 'react'
import { assets } from '../assets/assets'

const OurPolicy = () => {
    return (
        <div className='flex f;ex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700'>
            <div>
                <img src={assets.exchange_icon} alt="exchange" className='w-12 m-auto mb-5'
                />
                <p className='font-semibold'>10-Day Exchange</p>
                < p className='text-gray-700 '>Given a full refund within the days of receiving your order</p>

            </div>
            <div>
                <img src={assets.quality_icon} alt="quality" className='w-12 m-auto mb-5'
                />
                <p className='font-semibold'>7-Day Exchange</p>
                < p className='text-gray-700 '>We provide 7 days free of cost return policy</p>

            </div>
            <div>
                <img src={assets.support_img} alt="support" className='w-12 m-auto mb-5'
                />
                <p className='font-semibold'>24/7 Support</p>
                < p className='text-gray-700 '>Contact us 24/7 for instant help</p>

            </div>

        </div>
    )
}

export default OurPolicy