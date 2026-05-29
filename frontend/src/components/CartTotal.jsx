import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = () => {

    const { currency, Delivery_fee, getCartAmount, coupon, discount, applyCouponCode, removeCouponCode } = useContext(ShopContext);
    const [couponInput, setCouponInput] = useState('');

    const subtotal = getCartAmount();
    const discountAmount = (subtotal * discount) / 100;
    const finalTotal = subtotal === 0 ? 0 : subtotal - discountAmount + Delivery_fee;

    const handleApply = (e) => {
        e.preventDefault();
        const success = applyCouponCode(couponInput);
        if (success) {
            setCouponInput('');
        }
    };

    return (
        <div className='w-full'>

            <div className='text-2xl'>
                <Title text1={'CART'} text2={'TOTALS'} />
            </div>

            <div className='flex flex-col gap-3 mt-4 text-sm bg-white p-5 border border-gray-200 rounded-lg shadow-sm'>

                {/* Subtotal */}
                <div className='flex justify-between text-gray-600'>
                    <p>Subtotal</p>
                    <p>{currency} {subtotal}.00</p>
                </div>

                <hr className='border-gray-100' />

                {/* Dynamic Discount row */}
                {discount > 0 && (
                    <>
                        <div className='flex justify-between text-green-600 font-medium animate-fade-in'>
                            <p>Discount (20% OFF)</p>
                            <p>- {currency} {discountAmount.toFixed(2)}</p>
                        </div>
                        <hr className='border-gray-100' />
                    </>
                )}

                {/* Shipping Fee */}
                <div className='flex justify-between text-gray-600'>
                    <p>Shipping Fee</p>
                    <p>{currency} {Delivery_fee}.00</p>
                </div>

                <hr className='border-gray-200' />

                {/* Total */}
                <div className='flex justify-between text-base font-bold text-gray-900'>
                    <p>Total</p>
                    <p>{currency} {finalTotal.toFixed(2)}</p>
                </div>

                {/* Dynamic Coupon Input Section */}
                <div className='mt-3 pt-3 border-t border-gray-100'>
                    {coupon ? (
                        <div className='flex items-center justify-between bg-green-50/70 border border-green-200 rounded px-3 py-2 text-xs font-semibold text-green-800 animate-fade-in'>
                            <div className='flex items-center gap-1.5'>
                                <span>🏷️</span>
                                <span>Coupon <span className='font-mono font-bold bg-green-100 px-1 py-0.5 rounded text-green-900'>{coupon}</span> Applied!</span>
                            </div>
                            <button 
                                type='button' 
                                onClick={removeCouponCode} 
                                className='text-red-500 hover:text-red-700 text-sm font-extrabold cursor-pointer transition-colors px-1'
                                title="Remove Coupon"
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleApply} className='flex items-center gap-2 mt-1.5'>
                            <input 
                                type="text" 
                                placeholder="Enter Coupon Code" 
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-xs text-gray-700 placeholder-gray-400'
                            />
                            <button 
                                type="submit" 
                                className='bg-black text-white text-xs px-4 py-2 font-bold hover:bg-gray-800 transition-colors rounded'
                            >
                                Apply
                            </button>
                        </form>
                    )}
                </div>

            </div>

        </div>
    )
}

export default CartTotal;
