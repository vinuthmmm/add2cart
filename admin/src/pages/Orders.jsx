import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../assets/assets';

const Orders = ({ token }) => {
    const [orders, setOrders] = useState([]);
    const [showQrModal, setShowQrModal] = useState(false);
    const [merchantUpi, setMerchantUpi] = useState('6360229741@nyes');
    const [tempUpi, setTempUpi] = useState('6360229741@nyes');
    const [isSavingUpi, setIsSavingUpi] = useState(false);

    const fetchMerchantUpi = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/order/merchant-upi');
            if (response.data.success && response.data.upiId) {
                setMerchantUpi(response.data.upiId);
                setTempUpi(response.data.upiId);
            }
        } catch (error) {
            console.error("Failed to load merchant UPI in Admin:", error);
        }
    };

    const saveMerchantUpi = async () => {
        setIsSavingUpi(true);
        try {
            const response = await axios.post(
                backendUrl + '/api/order/merchant-upi/update',
                { upiId: tempUpi }
            );
            if (response.data.success) {
                setMerchantUpi(tempUpi);
                toast.success("Merchant UPI configuration saved successfully!");
                setShowQrModal(false);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Save UPI error:", error);
            toast.error("Failed to update merchant UPI in MySQL.");
        } finally {
            setIsSavingUpi(false);
        }
    };

    const fetchAllOrders = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/order/list');
            if (response.data.success) {
                setOrders(response.data.orders);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Fetch orders error:", error);
            toast.error("Failed to load orders list from database.");
        }
    };

    const statusHandler = async (event, orderId) => {
        const newStatus = event.target.value;
        try {
            const response = await axios.post(
                backendUrl + '/api/order/status',
                { orderId, status: newStatus },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                await fetchAllOrders(); // Refresh order records
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Update status error:", error);
            toast.error("Failed to update order status in MySQL.");
        }
    };

    const paymentStatusHandler = async (event, orderId) => {
        const newPayment = event.target.value === '1';
        try {
            const response = await axios.post(
                backendUrl + '/api/order/update-payment',
                { orderId, payment: newPayment },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                await fetchAllOrders(); // Refresh order records
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Update payment error:", error);
            toast.error("Failed to update payment status in MySQL.");
        }
    };

    useEffect(() => {
        fetchAllOrders();
        fetchMerchantUpi();
    }, []);

    return (
        <div className='flex flex-col w-full p-8 bg-gray-50 min-h-screen text-gray-700 relative'>
            <div className='flex flex-row items-center justify-between border-b border-gray-200 pb-4 mb-6'>
                <div className='flex flex-col gap-1'>
                    <h2 className='text-2xl font-bold text-gray-900'>Customer Orders</h2>
                    <p className='text-sm text-gray-500'>Fulfill purchases and update shipment statuses live in the MySQL database.</p>
                </div>
                <button 
                    onClick={() => setShowQrModal(true)}
                    className='flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all cursor-pointer'
                >
                    📷 Merchant QR Code
                </button>
            </div>

            <div className='flex flex-col gap-4 w-full'>
                {orders.length === 0 ? (
                    <div className='text-center py-20 text-gray-500 text-lg border rounded-lg bg-white shadow-sm'>
                        No customer orders have been placed yet.
                    </div>
                ) : (
                    orders.map((order, index) => (
                        <div 
                            key={index}
                            className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow'
                        >
                            {/* Parcel Indicator Icon */}
                            <div className='hidden sm:flex items-center justify-center p-3 bg-gray-50 border border-gray-100 rounded-full'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#ff4e6e]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                                </svg>
                            </div>

                            {/* Order Details (Left Column) */}
                            <div className='flex-1 flex flex-col gap-2'>
                                {/* Items */}
                                <div className='font-semibold text-gray-900 text-sm'>
                                    {order.items.map((item, idx) => (
                                        <span key={idx}>
                                            {item.name} x {item.quantity} ({item.size})
                                            {idx < order.items.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </div>

                                {/* Customer Details */}
                                <div className='font-medium text-xs text-gray-800 uppercase mt-1'>
                                    Customer: {order.address.firstName} {order.address.lastName}
                                </div>

                                {/* Address */}
                                <div className='text-xs text-gray-500 leading-relaxed max-w-[400px]'>
                                    <p>Street: {order.address.street}</p>
                                    <p>{order.address.city}, {order.address.state}, {order.address.zipcode}, {order.address.country}</p>
                                    <p>Phone: {order.address.phone}</p>
                                </div>
                            </div>

                            {/* Info Summary (Middle Column) */}
                            <div className='flex flex-col gap-1 text-xs sm:text-sm lg:min-w-[150px]'>
                                <p className='text-gray-500'>Items Count: <span className='text-gray-800 font-semibold'>{order.items.length}</span></p>
                                <p className='text-gray-500'>Method: <span className='text-gray-800 font-bold uppercase'>{order.paymentMethod}</span></p>
                                <p className='text-gray-500 flex items-center gap-1 mt-0.5'>
                                    <span>Payment:</span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                        Number(order.payment) === 1 
                                        ? 'bg-green-100 text-green-700' 
                                        : Number(order.payment) === 2 
                                        ? 'bg-blue-100 text-blue-700 animate-pulse border border-blue-200' 
                                        : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {Number(order.payment) === 1 
                                        ? 'PAID' 
                                        : Number(order.payment) === 2 
                                        ? 'AWAITING VERIFICATION' 
                                        : 'PENDING'}
                                    </span>
                                </p>
                                <p className='text-gray-500'>Date: <span className='text-gray-800 font-medium'>{new Date(Number(order.date)).toLocaleDateString()}</span></p>
                            </div>

                            {/* Amount & Status Selection (Right Column) */}
                            <div className='flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between lg:justify-normal gap-4 lg:min-w-[200px] w-full lg:w-auto border-t lg:border-none pt-4 lg:pt-0'>
                                <div className='text-lg font-bold text-gray-900'>
                                    Amount: ₹{order.amount}.00
                                </div>

                                <div className='flex flex-col gap-1 w-full sm:w-auto lg:items-end'>
                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5'>Order Status</span>
                                    <select 
                                        onChange={(e) => statusHandler(e, order.id)}
                                        value={order.status}
                                        className='w-full sm:w-auto px-3.5 py-2 border border-gray-300 rounded bg-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-sm'
                                    >
                                        <option value="Order Placed">Order Placed</option>
                                        <option value="Packed">Packed</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Out for delivery">Out for delivery</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>

                                <div className='flex flex-col gap-1 w-full sm:w-auto lg:items-end'>
                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5'>Payment Status</span>
                                    <select 
                                        onChange={(e) => paymentStatusHandler(e, order.id)}
                                        value={String(order.payment)}
                                        className={`w-full sm:w-auto px-3.5 py-2 border rounded bg-white text-xs font-bold focus:outline-none focus:ring-1 focus:ring-black cursor-pointer shadow-sm ${
                                            Number(order.payment) === 1 
                                            ? 'text-green-600 border-green-200 bg-green-50/50' 
                                            : Number(order.payment) === 2 
                                            ? 'text-blue-600 border-blue-300 bg-blue-50/55 animate-pulse' 
                                            : 'text-orange-500 border-orange-200 bg-orange-50/50'
                                        }`}
                                    >
                                        <option value="0" className='text-orange-500 font-semibold'>Pending</option>
                                        <option value="2" className='text-blue-600 font-bold bg-blue-50'>Awaiting Verification</option>
                                        <option value="1" className='text-green-600 font-semibold'>Paid / Verified</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Merchant QR Code Settings Modal (Navi Style) */}
            {showQrModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in'>
                    <div className='w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden transform transition-all duration-300 scale-100'>
                        
                        {/* Modal Header */}
                        <div className='flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100'>
                            <h3 className='font-bold text-gray-900 text-sm tracking-wider uppercase'>Merchant UPI QR Settings</h3>
                            <button 
                                onClick={() => { setShowQrModal(false); setTempUpi(merchantUpi); }}
                                className='text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer transition-colors focus:outline-none'
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body & Navi styled card */}
                        <div className='p-6 flex flex-col items-center gap-6'>
                            
                            {/* Interactive Input */}
                            <div className='w-full flex flex-col gap-1.5 text-left'>
                                <label className='text-[10px] font-bold text-gray-500 uppercase tracking-wider'>Configure UPI ID</label>
                                <div className='flex gap-2'>
                                    <input 
                                        type="text" 
                                        value={tempUpi}
                                        onChange={(e) => setTempUpi(e.target.value)}
                                        placeholder="e.g. name@upi"
                                        className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white text-xs font-semibold'
                                    />
                                </div>
                                <p className='text-[9px] text-gray-400 mt-0.5 leading-relaxed'>
                                    Updating this value changes the default payment destination and regenerates the checkout QR code automatically for all customer purchases.
                                </p>
                            </div>

                            {/* Navi Style Payment Card Graphic */}
                            <div className='w-64 bg-white border border-gray-200 rounded-3xl shadow-lg p-5 flex flex-col items-center gap-4 relative group'>
                                
                                {/* Logo header */}
                                <div className='flex flex-col items-center gap-1 mt-1'>
                                    <div className='flex items-center gap-2'>
                                        <div className='w-6 h-6 flex items-center justify-center font-extrabold text-white bg-emerald-500 rounded-lg text-sm italic font-serif shadow-sm'>n</div>
                                        <span className='font-extrabold text-lg text-slate-800 tracking-tight'>navi</span>
                                    </div>
                                    <p className='text-[10px] text-gray-400 font-semibold tracking-wide'>Pay using any UPI app</p>
                                </div>

                                {/* Supported Apps icons row */}
                                <div className='flex items-center gap-2.5 text-[8px] font-bold text-gray-400 mt-1 border-b border-gray-100 pb-2 w-full justify-center'>
                                    <span className='text-blue-500'>GPay</span>
                                    <span className='text-purple-600'>PhonePe</span>
                                    <span className='text-sky-500'>Paytm</span>
                                    <span className='text-emerald-500 font-extrabold'>navi</span>
                                </div>

                                {/* The QR Code */}
                                <div className='border border-gray-100 rounded-2xl p-2 bg-white shadow-inner flex items-center justify-center w-40 h-40'>
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${tempUpi}&pn=Vinuth%20.&cu=INR`)}`}
                                        alt="Navi merchant payment QR" 
                                        className='w-36 h-36 object-contain'
                                    />
                                </div>

                                {/* Payee details */}
                                <div className='text-center flex flex-col gap-0.5 mt-1'>
                                    <h4 className='font-extrabold text-sm text-slate-800'>Vinuth .</h4>
                                    <p className='text-[9px] text-slate-500 font-medium font-mono'>UPI ID : {tempUpi}</p>
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className='px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3'>
                            <button 
                                onClick={() => { setShowQrModal(false); setTempUpi(merchantUpi); }}
                                className='px-4 py-2 border border-gray-200 rounded text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all cursor-pointer'
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={saveMerchantUpi}
                                disabled={isSavingUpi}
                                className='px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow hover:shadow-md transition-all cursor-pointer disabled:opacity-50'
                            >
                                {isSavingUpi ? "Saving..." : "Save Config"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;