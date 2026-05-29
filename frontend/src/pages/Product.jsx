import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import axios from 'axios';
import { toast } from 'react-toastify';

const Product = () => {

    const { productId } = useParams();
    const { products, currency, addToCart, backendUrl } = useContext(ShopContext);
    const [productData, setProductData] = useState(false);
    const [image, setImage] = useState('');
    const [size, setSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();

    // Dynamic customer reviews states
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(5.0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [activeTab, setActiveTab] = useState('description'); // 'description', 'reviews'
    
    // Write review form states
    const [userName, setUserName] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    const getProductImage = (imageVal) => {
        if (!imageVal) return assets.upload_area;
        if (assets[imageVal]) {
            return assets[imageVal];
        }
        return imageVal;
    };

    const fetchProductData = async () => {
        products.map((item) => {
            if (item._id === productId) {
                setProductData(item);
                setImage(item.image[0]);
                return null;
            }
        });
    };

    const fetchProductReviews = async () => {
        try {
            const response = await axios.get(`${backendUrl || 'http://localhost:4000'}/api/review/${productId}`);
            if (response.data.success) {
                setReviews(response.data.reviews);
                setAvgRating(response.data.stats.averageRating || 5.0);
                setTotalReviews(response.data.stats.count || 0);
            }
        } catch (error) {
            console.error("Fetch reviews error:", error);
        }
    };

    const handleAddReviewSubmit = async (e) => {
        e.preventDefault();
        if (!userName.trim() || !comment.trim()) {
            return;
        }
        try {
            const response = await axios.post(`${backendUrl || 'http://localhost:4000'}/api/review/add`, {
                product_id: productId,
                user_name: userName,
                rating,
                comment
            });
            if (response.data.success) {
                setUserName('');
                setComment('');
                setRating(5);
                await fetchProductReviews();
            }
        } catch (error) {
            console.error("Submit review error:", error);
        }
    };

    const getStockStatus = (id) => {
        if (!id) return { inStock: true, text: "In Stock" };
        const code = id.charCodeAt(id.length - 1);
        if (code % 3 === 0) {
            return { inStock: true, lowStock: true, text: "Only 4 left in stock - order soon!" };
        } else {
            return { inStock: true, text: "In Stock" };
        }
    };

    const handleBuyNow = async () => {
        if (!size) {
            toast.error('Please Select Product Size');
            return;
        }
        await addToCart(productData._id, size, quantity);
        navigate('/cart');
    };

    const renderStars = (ratingVal) => {
        const stars = [];
        const fullStars = Math.floor(ratingVal);
        const hasHalf = ratingVal % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<img key={i} src={assets.star_icon} alt="star" className="w-3.5 h-3.5" />);
            } else if (i === fullStars + 1 && hasHalf) {
                stars.push(<img key={i} src={assets.star_icon} alt="star" className="w-3.5 h-3.5" />);
            } else {
                stars.push(<img key={i} src={assets.star_dull_icon} alt="dull star" className="w-3.5 h-3.5" />);
            }
        }
        return stars;
    };

    useEffect(() => {
        fetchProductData();
        fetchProductReviews();
    }, [productId, products]);

    return productData ? (
        <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
            {/*----------- Product Data-------------- */}
            <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
                {/*---------- Product Images------------- */}
                <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
                    <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full max-h-[460px] scrollbar-thin scrollbar-thumb-gray-200'>
                        {
                            productData.image.map((item, index) => (
                                <img 
                                    onClick={() => setImage(item)} 
                                    src={getProductImage(item)} 
                                    key={index} 
                                    className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer border-2 transition-all hover:border-black rounded p-0.5 ${
                                        image === item ? 'border-black' : 'border-gray-200'
                                    }`} 
                                    alt="" 
                                />
                            ))
                        }
                    </div>
                    <div className='w-full sm:w-[80%]'>
                        <img className='w-full h-auto border border-gray-200 rounded-lg p-2 shadow-inner object-contain max-h-[460px] bg-white transition-all hover:scale-[1.02] duration-300' src={getProductImage(image)} alt="" />
                    </div>
                </div>

                {/* -------- Product Info ---------- */}
                <div className='flex-1'>
                    <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
                    <div className='flex items-center gap-1.5 mt-2'>
                        <div className='flex gap-0.5'>{renderStars(avgRating)}</div>
                        <span className='text-xs bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded ml-1.5'>{avgRating.toFixed(1)}</span>
                        <p className='pl-2 text-xs font-semibold text-gray-500'>({totalReviews || 0} reviews)</p>
                    </div>
                    
                    {/* Price and Stock status badge row */}
                    <div className='flex items-center gap-4 mt-5'>
                        <p className='text-3xl font-medium'>{currency}{productData.price}</p>
                        {(() => {
                            const status = getStockStatus(productData._id);
                            return (
                                <div className='flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 shadow-sm'>
                                    <span className={`w-2 h-2 rounded-full ${status.lowStock ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${status.lowStock ? 'text-orange-600' : 'text-green-600'}`}>
                                        {status.text}
                                    </span>
                                </div>
                            );
                        })()}
                    </div>

                    <p className='mt-5 text-gray-500 md:w-4/5 leading-relaxed font-light text-sm'>{productData.description}</p>
                    
                    {/* Size Selector */}
                    <div className='flex flex-col gap-3 my-6 border-t pt-4 border-gray-100'>
                        <p className='font-bold text-xs text-gray-700 uppercase tracking-widest'>Select Size / Option</p>
                        <div className='flex flex-wrap gap-2.5'>
                            {productData.sizes.map((item, index) => (
                                <button 
                                    onClick={() => setSize(item)} 
                                    className={`border-2 py-2 px-5 rounded-lg text-xs font-extrabold transition-all hover:bg-gray-50 hover:border-black cursor-pointer shadow-sm select-none ${
                                        item === size 
                                            ? 'bg-black border-black text-white hover:bg-black' 
                                            : 'bg-white border-gray-300 text-gray-700'
                                    }`} 
                                    key={index}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className='flex flex-col gap-3 my-6 border-b pb-6 border-gray-100'>
                        <p className='font-bold text-xs text-gray-700 uppercase tracking-widest'>Quantity</p>
                        <div className='flex items-center gap-1'>
                            <button 
                                type='button' 
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                className='w-9 h-9 border border-gray-300 rounded-l-lg flex items-center justify-center font-bold text-sm text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer select-none'
                            >
                                -
                            </button>
                            <span className='w-12 h-9 border-t border-b border-gray-300 flex items-center justify-center font-bold text-sm text-gray-800 bg-gray-50 select-none'>
                                {quantity}
                            </span>
                            <button 
                                type='button' 
                                onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
                                className='w-9 h-9 border border-gray-300 rounded-r-lg flex items-center justify-center font-bold text-sm text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer select-none'
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Action buttons (ADD TO CART / BUY NOW) */}
                    <div className='flex flex-wrap gap-4 items-center mt-6'>
                        <button 
                            onClick={() => addToCart(productData._id, size, quantity)} 
                            className='flex-1 sm:flex-none bg-black hover:bg-gray-800 text-[10px] text-white font-extrabold uppercase tracking-widest px-8 py-4 rounded-xl hover:shadow-lg transition-all cursor-pointer'
                        >
                            ADD TO CART
                        </button>
                        <button 
                            onClick={handleBuyNow} 
                            className='flex-1 sm:flex-none bg-[#ff9900] hover:bg-[#e68a00] text-[10px] text-white font-extrabold uppercase tracking-widest px-8 py-4 rounded-xl hover:shadow-lg transition-all cursor-pointer'
                        >
                            BUY NOW
                        </button>
                    </div>

                    <hr className='mt-8 sm:w-4/5 opacity-50' />
                    <div className='text-xs text-gray-400 mt-5 flex flex-col gap-1.5 font-light'>
                        <p className='flex items-center gap-1.5'><span className='text-[8px]'>&bull;</span> 100% Original product.</p>
                        <p className='flex items-center gap-1.5'><span className='text-[8px]'>&bull;</span> Cash on delivery is available on this product.</p>
                        <p className='flex items-center gap-1.5'><span className='text-[8px]'>&bull;</span> Easy return and exchange policy within 7 days.</p>
                    </div>
                </div>
            </div>

            {/* ---------- Description & Review Section ------------- */}
            <div className='mt-20'>
                <div className='flex border-b border-gray-200'>
                    <button 
                        onClick={() => setActiveTab('description')} 
                        className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                            activeTab === 'description' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Description
                    </button>
                    <button 
                        onClick={() => setActiveTab('reviews')} 
                        className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                            activeTab === 'reviews' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Customer Reviews ({totalReviews || 0})
                    </button>
                </div>
                <div className='border border-t-0 rounded-b-2xl px-6 py-7 text-sm text-gray-500 bg-white shadow-sm'>
                    {activeTab === 'description' ? (
                        <div className='flex flex-col gap-4 font-light text-gray-600 leading-relaxed'>
                            <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual storefront where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
                            <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-6'>
                            {/* Summary of reviews */}
                            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-2 gap-4'>
                                <div className='flex items-center gap-3'>
                                    <h3 className='text-4xl font-extrabold text-gray-900'>{avgRating.toFixed(1)}</h3>
                                    <div className='flex flex-col'>
                                        <div className='flex gap-0.5'>{renderStars(avgRating)}</div>
                                        <span className='text-[10px] text-gray-500 mt-0.5'>Average rating ({totalReviews} customer reviews)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Split Layout: Reviews Feed & Write Form */}
                            <div className='flex flex-col lg:flex-row gap-10 items-start w-full'>
                                {/* Reviews list */}
                                <div className='flex-1 flex flex-col gap-4 w-full max-h-[500px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-gray-200'>
                                    {reviews.length === 0 ? (
                                        <div className='text-center py-12 text-gray-400 font-light text-sm italic'>
                                            No customer reviews yet. Be the first to write one!
                                        </div>
                                    ) : (
                                        reviews.map((rev) => (
                                            <div key={rev.id} className='bg-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-all duration-300'>
                                                <div className='flex justify-between items-center mb-2'>
                                                    <div className='flex items-center gap-2'>
                                                        <span className='w-7 h-7 rounded-full bg-black/5 flex items-center justify-center font-bold text-[10px] uppercase text-gray-700'>
                                                            {rev.user_name.substring(0, 2)}
                                                        </span>
                                                        <span className='font-bold text-xs text-gray-800 uppercase tracking-wide'>{rev.user_name}</span>
                                                    </div>
                                                    <span className='text-[10px] text-gray-400 font-medium'>{new Date(rev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                <div className='flex gap-0.5 mb-2'>{renderStars(rev.rating)}</div>
                                                <p className='text-xs text-gray-600 leading-relaxed font-light'>{rev.comment}</p>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Write review form */}
                                <form onSubmit={handleAddReviewSubmit} className='w-full lg:w-[40%] bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-4.5'>
                                    <h4 className='text-xs font-bold text-gray-900 uppercase tracking-widest border-b pb-2.5'>Write a Customer Review</h4>
                                    
                                    <div className='flex flex-col gap-1.5'>
                                        <label className='font-semibold text-[10px] text-gray-700 uppercase tracking-wider'>Your Name</label>
                                        <input 
                                            type="text" 
                                            placeholder='e.g. Vinuth Kumar' 
                                            required 
                                            value={userName} 
                                            onChange={(e) => setUserName(e.target.value)}
                                            className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black bg-white text-xs shadow-inner font-light' 
                                        />
                                    </div>

                                    <div className='flex flex-col gap-2'>
                                        <label className='font-semibold text-[10px] text-gray-700 uppercase tracking-wider'>Product Rating</label>
                                        <div className='flex gap-1.5 items-center'>
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const isLit = star <= (hoverRating || rating);
                                                return (
                                                    <span 
                                                        key={star}
                                                        onClick={() => setRating(star)}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        className='cursor-pointer text-2xl transition-all duration-150 transform hover:scale-125 select-none'
                                                    >
                                                        {isLit ? '★' : '☆'}
                                                    </span>
                                                );
                                            })}
                                            <span className='text-[10px] text-gray-500 font-bold ml-2.5 uppercase tracking-wider'>
                                                {rating} / 5 Stars
                                            </span>
                                        </div>
                                    </div>

                                    <div className='flex flex-col gap-1.5'>
                                        <label className='font-semibold text-[10px] text-gray-700 uppercase tracking-wider'>Written Comments</label>
                                        <textarea 
                                            placeholder='Share your honest thoughts about this item...' 
                                            required 
                                            rows={3} 
                                            value={comment} 
                                            onChange={(e) => setComment(e.target.value)}
                                            className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black bg-white text-xs resize-none shadow-inner font-light'
                                        />
                                    </div>

                                    <button type='submit' className='bg-black hover:bg-gray-800 text-[10px] text-white font-extrabold uppercase tracking-widest py-3.5 rounded-lg hover:shadow-lg transition-all cursor-pointer mt-1'>
                                        Submit Feedback
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --------- display related products ---------- */}
            <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

        </div>
    ) : <div className=' opacity-0'></div>
}

export default Product