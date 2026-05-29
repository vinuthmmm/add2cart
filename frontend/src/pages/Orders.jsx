import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';

const Orders = () => {

    const { backendUrl, token, currency } = useContext(ShopContext);
    const [ordersData, setOrdersData] = useState([]);

    const loadOrderData = async () => {
        try {
            if (!token) return;

            const response = await axios.post(
                backendUrl + '/api/order/userorders', 
                {}, 
                { headers: { token } }
            );

            if (response.data.success) {
                let allOrdersItems = [];
                response.data.orders.map((order) => {
                    order.items.map((item) => {
                        item['status'] = order.status;
                        item['payment'] = order.payment;
                        item['paymentMethod'] = order.paymentMethod;
                        item['date'] = order.date;
                        allOrdersItems.push(item);
                    });
                });
                setOrdersData(allOrdersItems);
            }
        } catch (error) {
            console.error("Load orders error:", error);
        }
    }

    useEffect(() => {
        loadOrderData();
    }, [token]);

    return (
        <div className='border-t pt-16'>

            <div className='text-2xl'>
                <Title text1={'MY'} text2={'ORDERS'} />
            </div>

            <div>
                {
                    ordersData.map((item, index) => (
                        <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                            <div className='flex items-start gap-6 text-sm'>
                                <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
                                <div>
                                    <p className='sm:text-base font-medium'>{item.name}</p>
                                    <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                                        <p>{currency}{item.price}</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Size: {item.size}</p>
                                    </div>
                                    <p className='mt-1'>Date: <span className=' text-gray-400'>{new Date(item.date).toLocaleDateString()}</span></p>
                                    <p className='mt-1 text-xs text-gray-500 flex items-center gap-1.5'>
                                        <span>Payment:</span>
                                        <span className='font-bold uppercase text-gray-600'>{item.paymentMethod}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                            Number(item.payment) === 1 
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' 
                                            : Number(item.payment) === 2 
                                            ? 'bg-blue-50 text-blue-600 border border-blue-200 animate-pulse' 
                                            : 'bg-orange-50 text-orange-600 border border-orange-150'
                                        }`}>
                                            {Number(item.payment) === 1 
                                            ? 'Paid' 
                                            : Number(item.payment) === 2 
                                            ? 'Awaiting Admin Verification' 
                                            : 'Pending'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className='md:w-1/2 flex justify-between'>
                                <div className='flex items-center gap-2'>
                                    <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                                    <p className='text-sm md:text-base'>{item.status}</p>
                                </div>
                                <button onClick={loadOrderData} className='border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer'>Track Order</button>
                            </div>
                        </div>
                    ))
                }
                {ordersData.length === 0 && (
                    <div className='text-center py-20 text-gray-500 text-lg'>
                        You haven't placed any orders yet.
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders