import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const PaymentGateway = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currency, setCartItems, token, backendUrl } = useContext(ShopContext);

    // Safeguard: If accessed directly without checkout routing, redirect to cart
    useEffect(() => {
        if (!location.state || !location.state.amount) {
            toast.error("No active checkout session found.");
            navigate('/cart');
        }
    }, [location.state, navigate]);

    if (!location.state || !location.state.amount) {
        return null;
    }

    const { amount, orderId, paymentMethod } = location.state;

    // State bindings
    const [upiId, setUpiId] = useState('6360229741@nyes');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Stripe Credit Card Interactive Bindings
    const [cardEmail, setCardEmail] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [cardName, setCardName] = useState('');

    // Fetch active merchant UPI dynamically from MySQL backend settings table
    useEffect(() => {
        if (paymentMethod === 'razorpay') {
            const fetchMerchantUpi = async () => {
                try {
                    const response = await axios.get(backendUrl + '/api/order/merchant-upi');
                    if (response.data.success && response.data.upiId) {
                        setUpiId(response.data.upiId);
                    }
                } catch (error) {
                    console.error("Failed to dynamically load merchant UPI from MySQL:", error);
                }
            };
            fetchMerchantUpi();
        }
    }, [paymentMethod, backendUrl]);

    // Dynamic QR Code construction mapping the real order amount and merchant UPI ID
    useEffect(() => {
        if (paymentMethod === 'razorpay') {
            const upiUrl = `upi://pay?pa=${upiId}&pn=ADD2CART%20Store&am=${amount.toFixed(2)}&cu=INR`;
            const encodedUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
            setQrCodeUrl(encodedUrl);
        }
    }, [upiId, amount, paymentMethod]);

    // Helper function for formatting card number input (4-4-4-4 spacing)
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        let formatted = value.match(/.{1,4}/g)?.join(' ') || '';
        setCardNumber(formatted.substring(0, 19));
    };

    // Helper function for MM/YY expiry input formatting
    const handleCardExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        setCardExpiry(value.substring(0, 5));
    };

    // Hoisted standard helper function for payment success transactions
    async function handlePaymentSuccess() {
        setIsProcessing(true);
        try {

            const response = await axios.post(
                backendUrl + '/api/order/verify',
                { orderId },
                { headers: { token } }
            );

            if (response.data.success) {
                setCartItems({}); // Clear storefront cart upon successful payment
                toast.info("💸 UPI Payment claim submitted successfully!");
                toast.success("✅ Our Admin team will verify your transaction against bank records shortly.", { autoClose: 6000 });
                navigate('/orders');
            } else {
                toast.error(response.data.message || "Payment verification claim failed.");
            }
        } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Failed to verify payment with backend server.");
        } finally {
            setIsProcessing(false);
        }
    }

    const handlePaymentCancel = () => {
        toast.warning("⚠️ Payment checkout cancelled. Your cart remains intact.");
        navigate('/cart');
    };

    return (
        <div className='flex flex-col items-center justify-center min-h-[90vh] py-12 px-4 bg-[#0b0f19] text-slate-100 font-sans relative overflow-hidden'>

            {/* Embedded Custom CSS Stylesheets inside React for premium modular visual excellence */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes hologram-scan {
                    0%, 100% { top: 0%; opacity: 0.2; }
                    50% { top: 98%; opacity: 1; }
                }
                @keyframes pulsing-glow {
                    0%, 100% { filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.4)); }
                    50% { filter: drop-shadow(0 0 25px rgba(16, 185, 129, 0.8)); }
                }
                @keyframes orbit-slow {
                    0% { transform: rotate(0deg) translate(20px) rotate(0deg); }
                    100% { transform: rotate(360deg) translate(20px) rotate(-360deg); }
                }
                .laser-scanner {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 2.5px;
                    background: linear-gradient(90deg, transparent, #10b981, transparent);
                    box-shadow: 0 0 10px #10b981, 0 0 20px #10b981;
                    animation: hologram-scan 4s linear infinite;
                    z-index: 10;
                }
                .glow-orb-purple {
                    position: absolute;
                    width: 350px;
                    height: 350px;
                    background: radial-gradient(circle, rgba(99, 91, 255, 0.15) 0%, rgba(99, 91, 255, 0) 70%);
                    top: -100px;
                    left: -100px;
                    z-index: 1;
                    pointer-events: none;
                    animation: orbit-slow 20s linear infinite;
                }
                .glow-orb-teal {
                    position: absolute;
                    width: 350px;
                    height: 350px;
                    background: radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(20, 184, 166, 0) 70%);
                    bottom: -100px;
                    right: -100px;
                    z-index: 1;
                    pointer-events: none;
                    animation: orbit-slow 25s linear infinite reverse;
                }
                .glass-card {
                    background: rgba(17, 24, 39, 0.75);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1);
                }
                .holo-card {
                    background: linear-gradient(135deg, #1e1b4b 0%, #030712 100%);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 
                                inset 0 1px 0 rgba(255, 255, 255, 0.1), 
                                0 0 15px rgba(99, 91, 255, 0.2);
                    transition: transform 0.3s ease;
                }
                .hologram-grid {
                    background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 10px 10px;
                }
            `}} />

            {/* Futuristic glowing orbs in background */}
            <div className='glow-orb-purple'></div>
            <div className='glow-orb-teal'></div>

            {/* Stepper progress indicator funnel */}
            <div className='w-full max-w-md mb-8 flex justify-between items-center px-4 relative z-10 text-[10px] font-bold uppercase tracking-widest text-slate-500'>
                <div className='flex flex-col items-center gap-1.5'>
                    <div className='w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-500 flex items-center justify-center text-[9px] shadow-[0_0_8px_rgba(16,185,129,0.3)]'>✓</div>
                    <span>Cart</span>
                </div>
                <div className='flex-1 h-[1px] bg-emerald-500 mx-2 opacity-50'></div>
                <div className='flex flex-col items-center gap-1.5'>
                    <div className='w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-500 flex items-center justify-center text-[9px] shadow-[0_0_8px_rgba(16,185,129,0.3)]'>✓</div>
                    <span>Address</span>
                </div>
                <div className='flex-1 h-[1px] bg-indigo-500/60 mx-2 animate-pulse'></div>
                <div className='flex flex-col items-center gap-1.5 text-indigo-400'>
                    <div className='w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[9px] font-bold shadow-[0_0_12px_rgba(99,91,255,0.5)] animate-bounce'>3</div>
                    <span>Pay</span>
                </div>
                <div className='flex-1 h-[1px] bg-slate-800 mx-2'></div>
                <div className='flex flex-col items-center gap-1.5'>
                    <div className='w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-600 flex items-center justify-center text-[9px]'>4</div>
                    <span>Verify</span>
                </div>
            </div>

            {/* Main glassmorphic portal card */}
            <div className='w-full max-w-md rounded-3xl glass-card overflow-hidden relative z-10 transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.5)] animate-fade-in'>

                {/* Razorpay Gateway Header */}
                {paymentMethod === 'razorpay' ? (
                    <div className='bg-[#111625] border-b border-slate-800 p-6 flex flex-col items-center gap-2.5 relative overflow-hidden'>
                        <div className='absolute inset-0 opacity-[0.03] hologram-grid'></div>
                        <div className='absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest border border-emerald-500/20 shadow-sm'>
                            Simulated Gateway
                        </div>
                        <img
                            className='h-6 object-contain filter brightness-100 drop-shadow'
                            src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
                            alt="Razorpay logo"
                            onError={(e) => {
                                e.target.src = 'https://razorpay.com/assets/razorpay-glyph.svg';
                            }}
                        />
                        <p className='text-[9px] text-slate-400 font-extrabold tracking-widest uppercase mt-0.5'>UPI DIRECT CHANNEL</p>
                        <p className='text-3xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent'>
                            {currency}{amount.toFixed(2)}
                        </p>
                        <p className='text-[8px] text-slate-500 font-bold font-mono tracking-wider'>
                            Razorpay Order Ref: #{orderId}
                        </p>
                    </div>
                ) : (
                    /* Stripe Gateway Header */
                    <div className='bg-[#111625] border-b border-slate-800 p-6 flex flex-col items-center gap-2.5 relative overflow-hidden'>
                        <div className='absolute inset-0 opacity-[0.03] hologram-grid'></div>
                        <div className='absolute top-4 right-4 bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest border border-indigo-500/20 shadow-sm'>
                            Simulated Gateway
                        </div>
                        <div className='flex items-center gap-1.5'>
                            <span className='font-extrabold text-xl tracking-tighter italic font-serif text-[#635bff]'>stripe</span>
                            <span className='text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 text-indigo-300'>Checkout</span>
                        </div>
                        <p className='text-[9px] text-slate-400 font-extrabold tracking-widest uppercase mt-0.5'>SECURE CARD ENCRYPT CHANNEL</p>
                        <p className='text-3xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent'>
                            {currency}{amount.toFixed(2)}
                        </p>
                        <p className='text-[8px] text-slate-500 font-bold font-mono tracking-wider'>
                            Stripe Charge Ref: #{orderId}
                        </p>
                    </div>
                )}

                {/* Gateway Body */}
                <div className='p-6 flex flex-col gap-6 relative'>

                    {paymentMethod === 'razorpay' ? (
                        /* Razorpay - UPI QR Code Simulator */
                        <div className='flex flex-col items-center gap-5 text-center animate-fade-in'>

                            {/* Merchant Config Section */}
                            <div className='w-full text-left bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2.5 relative overflow-hidden'>
                                <div className='absolute inset-0 opacity-[0.02] hologram-grid'></div>
                                <label className='text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block'></span>
                                    Merchant UPI Address Configuration
                                </label>
                                <input
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="e.g. name@upi"
                                    className='w-full px-3.5 py-2.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-900/90 text-xs font-semibold text-slate-200 tracking-wide transition-all'
                                />
                                <p className='text-[9px] text-slate-500 leading-normal'>
                                    To test fund routing, input your personal UPI ID (e.g. PhonePe/Paytm). The scannable QR Code below updates instantly!
                                </p>
                            </div>

                            {/* Scannable QR Code with Hologram Laser Scan line! */}
                            <div className='border border-slate-800 rounded-3xl p-5 bg-[#0e1220]/80 shadow-2xl flex flex-col items-center gap-4 relative group overflow-hidden w-64 h-64 justify-center'>
                                {isProcessing && (
                                    <div className='absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 rounded-3xl z-20 animate-fade-in'>
                                        <div className='w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
                                        <span className='text-xs font-bold text-emerald-400 animate-pulse uppercase tracking-wider'>Verifying Claim...</span>
                                    </div>
                                )}

                                {/* Neon glowing corner brackets */}
                                <div className='absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-500/60 rounded-tl'></div>
                                <div className='absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-500/60 rounded-tr'></div>
                                <div className='absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-500/60 rounded-bl'></div>
                                <div className='absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-500/60 rounded-br'></div>

                                {/* Active Vertical Scanning Laser Line */}
                                <div className='laser-scanner'></div>

                                {qrCodeUrl ? (
                                    <img
                                        className='w-44 h-44 object-contain transition-transform duration-500 group-hover:scale-105 animate-pulsing-glow bg-white p-2 rounded-xl relative z-10'
                                        src={qrCodeUrl}
                                        alt="UPI QR Code Payment Gateway"
                                    />
                                ) : (
                                    <div className='w-44 h-44 bg-slate-900/60 flex items-center justify-center text-xs text-slate-500 rounded-xl relative z-10 border border-slate-800'>
                                        Generating QR Code...
                                    </div>
                                )}

                                <div className='flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full relative z-10 uppercase tracking-widest shadow-sm'>
                                    <span className='relative flex h-1.5 w-1.5'>
                                        <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                                        <span className='relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500'></span>
                                    </span>
                                    Holographic UPI QR Live
                                </div>
                            </div>

                            {/* Awaiting Claim Section */}
                            <div className='flex flex-col items-center gap-1.5 bg-slate-950/40 border border-slate-800/80 p-3 rounded-2xl w-full'>
                                <p className='text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block'></span>
                                    <span>⌛ Awaiting UPI payment claim...</span>
                                </p>
                                <p className='text-[9px] text-slate-400 leading-normal max-w-[320px]'>
                                    Scan QR code above with any banking/payment app, authorize the transaction on your phone, then trigger verification below.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Stripe - Credit Card Simulator with Interactive Glossy Holographic Mock Card! */
                        <div className='flex flex-col gap-5 text-left animate-fade-in'>

                            {/* Premium Glossy Mock Credit Card */}
                            <div className='holo-card rounded-2xl p-5 flex flex-col justify-between h-40 w-full relative overflow-hidden border border-white/10 group'>
                                <div className='absolute inset-0 opacity-[0.05] hologram-grid'></div>
                                <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-pink-500/10'></div>

                                <div className='flex justify-between items-start relative z-10'>
                                    {/* Mock Metallic Gold Chip */}
                                    <div className='w-9 h-7 bg-gradient-to-tr from-yellow-600 via-yellow-400 to-yellow-600 rounded-lg flex flex-col gap-0.5 justify-center p-1 border border-yellow-500/20 shadow-inner'>
                                        <div className='w-full h-0.5 bg-yellow-900/20'></div>
                                        <div className='w-full h-0.5 bg-yellow-900/20'></div>
                                        <div className='w-full h-0.5 bg-yellow-900/20'></div>
                                    </div>
                                    <div className='text-xs font-black uppercase text-indigo-300 italic tracking-wider flex items-center gap-1'>
                                        <span className='w-2 h-2 rounded-full bg-indigo-400 inline-block'></span>
                                        VISA / MC
                                    </div>
                                </div>

                                <div className='flex flex-col gap-1 relative z-10 mt-3'>
                                    {/* Dynamic Card Number Binding */}
                                    <div className='text-md font-mono font-bold tracking-widest text-slate-100 drop-shadow'>
                                        {cardNumber || '•••• •••• •••• ••••'}
                                    </div>
                                </div>

                                <div className='flex justify-between items-end relative z-10 mt-2 border-t border-white/5 pt-2'>
                                    <div className='flex flex-col gap-0.5'>
                                        <span className='text-[7px] text-slate-500 font-bold uppercase tracking-wider'>Cardholder</span>
                                        {/* Dynamic Name Binding */}
                                        <span className='text-[10px] font-bold text-slate-200 uppercase tracking-wide truncate max-w-[150px]'>
                                            {cardName || 'JANE DOE'}
                                        </span>
                                    </div>
                                    <div className='flex flex-col gap-0.5 items-end'>
                                        <span className='text-[7px] text-slate-500 font-bold uppercase tracking-wider'>Expires</span>
                                        {/* Dynamic Expiry Binding */}
                                        <span className='text-[10px] font-mono font-bold text-slate-200'>
                                            {cardExpiry || 'MM/YY'}
                                        </span>
                                    </div>
                                    <div className='flex flex-col gap-0.5 items-end'>
                                        <span className='text-[7px] text-slate-500 font-bold uppercase tracking-wider'>CVC</span>
                                        {/* Dynamic CVC Binding */}
                                        <span className='text-[10px] font-mono font-bold text-slate-200'>
                                            {cardCvc || '•••'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Credit Card Input Form */}
                            <form onSubmit={(e) => { e.preventDefault(); handlePaymentSuccess(); }} className='flex flex-col gap-4 relative'>
                                {isProcessing && (
                                    <div className='absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 rounded-2xl z-20 animate-fade-in'>
                                        <div className='w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin'></div>
                                        <span className='text-xs font-bold text-indigo-400 animate-pulse uppercase tracking-wider'>Processing Auth...</span>
                                    </div>
                                )}

                                <div className='flex flex-col gap-1.5'>
                                    <label className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={cardEmail}
                                        onChange={(e) => setCardEmail(e.target.value)}
                                        placeholder="customer@domain.com"
                                        className='w-full px-3.5 py-2.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-950/60 text-xs font-semibold text-slate-200 transition-all'
                                    />
                                </div>

                                <div className='flex flex-col gap-1.5'>
                                    <label className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>Card Information</label>
                                    <div className='border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60'>
                                        <input
                                            type="text"
                                            required
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            placeholder="4242 4242 4242 4242"
                                            className='w-full px-3.5 py-2.5 border-b border-slate-800/80 text-xs font-bold tracking-widest focus:outline-none bg-transparent font-mono text-slate-200'
                                        />
                                        <div className='flex'>
                                            <input
                                                type="text"
                                                required
                                                value={cardExpiry}
                                                onChange={handleCardExpiryChange}
                                                placeholder="MM/YY"
                                                className='w-1/2 px-3.5 py-2.5 border-r border-slate-800/80 text-xs font-bold focus:outline-none bg-transparent font-mono text-slate-200 text-center'
                                            />
                                            <input
                                                type="text"
                                                required
                                                maxLength="3"
                                                value={cardCvc}
                                                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                                                placeholder="CVC"
                                                className='w-1/2 px-3.5 py-2.5 text-xs font-bold focus:outline-none bg-transparent font-mono text-slate-200 text-center'
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col gap-1.5'>
                                    <label className='text-[9px] font-bold text-slate-400 uppercase tracking-widest'>Cardholder Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        placeholder="Jane Doe"
                                        className='w-full px-3.5 py-2.5 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-950/60 text-xs font-semibold text-slate-200 transition-all'
                                    />
                                </div>

                                <div className='flex items-center gap-2.5 mt-1 select-none cursor-pointer'>
                                    <input
                                        type="checkbox"
                                        id="stripe-save"
                                        className='w-4 h-4 rounded border-slate-800 bg-slate-950/60 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 cursor-pointer'
                                    />
                                    <label htmlFor="stripe-save" className='text-[9px] text-slate-400 font-semibold cursor-pointer tracking-wide'>
                                        Save card details securely for future checkouts
                                    </label>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Interactive Simulator Action Controls */}
                    <div className='flex flex-col gap-3.5 mt-2'>
                        {paymentMethod === 'stripe' ? (
                            <button
                                onClick={handlePaymentSuccess}
                                disabled={isProcessing}
                                className='w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-wider hover:shadow-[0_0_20px_rgba(99,91,255,0.4)] transition-all duration-350 cursor-pointer disabled:opacity-50 font-bold border border-indigo-400/20'
                            >
                                {isProcessing ? 'Authorizing Secure Card...' : `Pay Billed Total: ${currency}${amount.toFixed(2)}`}
                            </button>
                        ) : (
                            <button
                                onClick={handlePaymentSuccess}
                                disabled={isProcessing}
                                className='w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 text-slate-200 py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-wider hover:shadow-lg hover:border-slate-600 transition-all duration-300 cursor-pointer disabled:opacity-50 font-bold flex items-center justify-center gap-2'
                            >
                                {isProcessing ? (
                                    <>
                                        <div className='w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
                                        Verifying UPI Payment...
                                    </>
                                ) : (
                                    `I've Completed the UPI QR Payment`
                                )}
                            </button>
                        )}
                        <button
                            onClick={handlePaymentCancel}
                            disabled={isProcessing}
                            className='w-full bg-transparent text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 py-3.5 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all duration-300 cursor-pointer disabled:opacity-50 font-bold'
                        >
                            Cancel Transaction
                        </button>
                    </div>

                </div>

                {/* Footer Security Badging */}
                <div className='bg-[#0b0e17]/90 border-t border-slate-800/80 py-3 px-6 flex items-center justify-center gap-1.5 text-[8px] text-slate-500 font-bold uppercase tracking-wider relative z-10'>
                    <span>🔒</span>
                    <span>AES-256 Bit SSL Bank-Grade payment encryption</span>
                </div>

            </div>
        </div>
    );
};

export default PaymentGateway;
