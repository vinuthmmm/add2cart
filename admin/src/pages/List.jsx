import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl, assets } from '../assets/assets';

const List = ({ token }) => {
    const [list, setList] = useState([]);

    const getProductImage = (imageVal) => {
        if (!imageVal) return assets.upload_area;
        if (assets[imageVal]) {
            return assets[imageVal];
        }
        return imageVal;
    };

    const fetchList = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list');
            if (response.data.success) {
                setList(response.data.products);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Fetch list error:", error);
            toast.error("Failed to load products list from MySQL.");
        }
    };

    const removeProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product from MySQL?")) {
            return;
        }

        try {
            const response = await axios.post(
                backendUrl + '/api/product/remove',
                { id },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                await fetchList(); // Refresh the list
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Remove product error:", error);
            toast.error("Failed to delete product from database.");
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className='flex flex-col w-full p-8 bg-gray-50 min-h-screen text-gray-700'>
            <div className='flex flex-col gap-1 mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>All Products Catalog</h2>
                <p className='text-sm text-gray-500'>Browse existing clothing items and accessories currently saved in MySQL.</p>
            </div>

            <div className='flex flex-col w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white'>
                {/* Table Header */}
                <div className='hidden sm:grid grid-cols-[1.5fr_3fr_1.5fr_1.5fr_1fr] items-center py-3.5 px-6 bg-gray-100 text-gray-800 border-b border-gray-200 font-semibold text-sm'>
                    <b>Image</b>
                    <b>Name</b>
                    <b>Category</b>
                    <b>Price</b>
                    <b className='text-center'>Action</b>
                </div>

                {/* Table Rows */}
                {list.length === 0 ? (
                    <div className='text-center py-20 text-gray-500 text-lg'>
                        No products found in database. Click 'Add Items' to seed some!
                    </div>
                ) : (
                    list.map((item, index) => (
                        <div 
                            key={index}
                            className='grid grid-cols-1 sm:grid-cols-[1.5fr_3fr_1.5fr_1.5fr_1fr] items-center gap-2 sm:gap-0 py-4 px-6 border-b border-gray-100 last:border-none text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                        >
                            {/* Product Thumbnail */}
                            <div className='flex items-center gap-2'>
                                <img 
                                    className='w-12 h-12 object-contain bg-gray-50 border rounded shadow-sm' 
                                    src={getProductImage(item.image[0])} 
                                    alt={item.name} 
                                    onError={(e) => {
                                        e.target.src = assets.upload_area;
                                    }}
                                />
                            </div>

                            {/* Name */}
                            <div className='font-medium text-gray-900 pr-4'>{item.name}</div>

                            {/* Category */}
                            <div className='text-gray-500'>{item.category} ({item.subCategory})</div>

                            {/* Price */}
                            <div className='font-semibold text-gray-900'>₹{item.price}.00</div>

                            {/* Remove Button */}
                            <div className='flex justify-start sm:justify-center'>
                                <button 
                                    onClick={() => removeProduct(item.id)}
                                    className='px-3.5 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded text-xs font-bold transition-all cursor-pointer'
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default List;
