import React, { useContext, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';

const SearchBar = () => {
    const { search, setSearch, showSearch, setShowSearch, products } = useContext(ShopContext);
    const [suggestions, setSuggestions] = useState([]);
    const location = useLocation();

    // Listen to searches and calculate the top 5 product recommendations dynamically
    useEffect(() => {
        const query = search.toLowerCase().trim();
        if (query.length > 0 && products.length > 0) {
            const matches = products
                .filter(p => 
                    p.name.toLowerCase().includes(query) ||
                    p.category.toLowerCase().includes(query) ||
                    p.subCategory.toLowerCase().includes(query) ||
                    (p.description && p.description.toLowerCase().includes(query))
                )
                .slice(0, 5);
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    }, [search, products]);

    useEffect(() => {
        if (location.pathname.toLowerCase().includes("collection") && showSearch) {
            setShowSearch(true);
        }
    }, [location]);

    return showSearch ? (
        <div className='border-t border-b bg-gray-50 text-center relative py-5 z-40'>
            <div className='inline-block w-3/4 sm:w-1/2 relative text-left align-middle'>
                {/* Search Input Container */}
                <div className='flex items-center justify-between border border-gray-400 px-5 py-2.5 rounded-full w-full bg-white shadow-sm hover:shadow transition-shadow'>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='flex-1 outline-none text-sm text-gray-700 bg-transparent pr-3 font-light placeholder-gray-400'
                        type="text"
                        placeholder='Search Amazon-like Collections...'
                    />
                    <img className='w-4 h-4 opacity-60' src={assets.search_icon} alt="search icon" />
                </div>

                {/* Autocomplete dynamic auto-suggestions panel */}
                {suggestions.length > 0 && (
                    <div className='absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-72 divide-y divide-gray-100 hover:shadow-xl transition-shadow'>
                        {suggestions.map((p) => (
                            <Link 
                                key={p._id}
                                to={`/product/${p._id}`}
                                onClick={() => {
                                    setSearch('');
                                    setSuggestions([]);
                                }}
                                className='flex items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50 transition-colors'
                            >
                                <img 
                                    className='w-10 h-10 object-contain bg-gray-50 border border-gray-100 rounded-lg p-1' 
                                    src={p.image[0]} 
                                    alt={p.name} 
                                />
                                <div className='flex-1 min-w-0'>
                                    <div className='text-xs font-bold text-gray-800 truncate'>{p.name}</div>
                                    <div className='text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5'>{p.category} &bull; {p.subCategory}</div>
                                </div>
                                <span className='text-xs font-extrabold text-gray-900 pr-1'>₹{p.price}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <img
                onClick={() => {
                    setSearch('');
                    setShowSearch(false);
                }}
                className='inline w-3.5 cursor-pointer ml-4 align-middle hover:scale-110 transition-transform opacity-70 hover:opacity-100'
                src={assets.cross_icon}
                alt="close search"
            />
        </div>
    ) : null
}

export default SearchBar;