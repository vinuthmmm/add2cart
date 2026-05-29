import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';




// Mapping parent Categories to their dynamic Subcategory values
const categorySubMapping = {
    Fashion: ['Topwear', 'Bottomwear', 'Winterwear'],
    Men: ['Topwear', 'Bottomwear', 'Winterwear'],
    Women: ['Topwear', 'Bottomwear', 'Winterwear'],
    Kids: ['Topwear', 'Bottomwear', 'Winterwear'],
    Electronics: ['Mobiles', 'Computers', 'Audio'],
    Home: ['Kitchenware', 'Decor', 'Furniture'],
    Sports: ['Fitness Gear', 'Outdoor'],
    Beauty: ['Cosmetics', 'Skincare', 'Fragrances'],
    Books: ['Novels', 'Stationery'],
    Toys: ['Games', 'Figures'],
    Fitness: ['Supplements', 'Gym Acc'],
    Groceries: ['Snacks', 'Packaged'],
    Items: ['bottle', 'Accessories']
};

const Collection = () => {

    const { products, search, showSearch, setSearch } = useContext(ShopContext);
    const [showFilter, setShowFilter] = useState(false);
    const [filterProducts, setFilterProducts] = useState([]);
    const [category, setCategory] = useState([]);
    const [subCategory, setSubCategory] = useState([]);
    const [sortType, setSortType] = useState('relevant');

    // Auto-clear unchecked subcategories when parent category is deselected
    const toggleCategory = (e) => {
        let nextCategories = [];
        if (category.includes(e.target.value)) {
            nextCategories = category.filter(item => item !== e.target.value);
        } else {
            nextCategories = [...category, e.target.value];
        }
        setCategory(nextCategories);

        // Perform reactive synchronization
        if (nextCategories.length > 0) {
            const allowedVals = [];
            nextCategories.forEach(cat => {
                if (categorySubMapping[cat]) {
                    allowedVals.push(...categorySubMapping[cat]);
                }
            });
            setSubCategory(prev => prev.filter(sub => allowedVals.includes(sub)));
        }
    };

    const toggleSubCategory = (e) => {
        if (subCategory.includes(e.target.value)) {
            setSubCategory(prev => prev.filter(item => item !== e.target.value))
        } else {
            setSubCategory(prev => [...prev, e.target.value])
        }
    };

    const getAllowedSubCategories = () => {
        if (category.length === 0) {
            return [];
        }

        const allSubs = [
            { label: "Topwear", value: "Topwear" },
            { label: "Bottomwear", value: "Bottomwear" },
            { label: "Winterwear", value: "Winterwear" },
            { label: "Mobiles & Tablets", value: "Mobiles" },
            { label: "Computers & Acc", value: "Computers" },
            { label: "Audio & Speakers", value: "Audio" },
            { label: "Kitchen & Dining", value: "Kitchenware" },
            { label: "Home Decor & Lighting", value: "Decor" },
            { label: "Furniture", value: "Furniture" },
            { label: "Outdoor Equipment", value: "Outdoor" },
            { label: "Cosmetics & Makeup", value: "Cosmetics" },
            { label: "Skincare", value: "Skincare" },
            { label: "Fragrances & Perfumes", value: "Fragrances" },
            { label: "Books & Novels", value: "Novels" },
            { label: "Stationery", value: "Stationery" },
            { label: "Toys & Board Games", value: "Games" },
            { label: "Action Figures & Dolls", value: "Figures" },
            { label: "Fitness & Supplements", value: "Supplements" },
            { label: "Gym Accessories", value: "Gym Acc" },
            { label: "Snacks & Beverages", value: "Snacks" },
            { label: "Packaged Foods", value: "Packaged" },
            { label: "Bottle & Drinkware", value: "bottle" },
            { label: "Other Accessories", value: "Accessories" }
        ];

        const allowedVals = [];
        category.forEach(cat => {
            if (categorySubMapping[cat]) {
                allowedVals.push(...categorySubMapping[cat]);
            }
        });

        return allSubs.filter(sub => allowedVals.includes(sub.value));
    };
    const applyFilter = () => {
        let productsCopy = products.slice();
        console.log("applyFilter running. search:", search, "showSearch:", showSearch);

        if (showSearch && search) {
            const query = search.toLowerCase().trim();
            productsCopy = productsCopy.filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.subCategory.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query))
            );
        }

        if (category.length > 0) {
            productsCopy = productsCopy.filter(item => {
                if (category.includes(item.category)) return true;
                // If they checked "Fashion", also display Men's, Women's, and Kids' clothes which are the actual database records
                if (category.includes('Fashion') && ['Men', 'Women', 'Kids', 'Fashion'].includes(item.category)) return true;
                return false;
            });
        }
        if (subCategory.length > 0) {
            productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory))
        }

        switch (sortType) {
            case "low-high":
                productsCopy.sort((a, b) => a.price - b.price);
                break;
            case "high-low":
                productsCopy.sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }

        setFilterProducts(productsCopy);
    }

    useEffect(() => {
        applyFilter();
    }, [category, subCategory, sortType, products, search, showSearch]);


    return (
        <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>

            {/*filter options */}
            <div className='min-w-60'>
                <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
                    <img className={`sm:hidden h-3 ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
                </p>
                {/* Product Type Filter */}
                <div className={`border border-gray-300 pl-5 py-4 mt-6 ${showFilter ? '' : 'hidden'} sm:block rounded-lg shadow-sm bg-white`}>
                    <p className='mb-3 text-sm font-bold text-gray-900 tracking-wide uppercase text-[11px]'>Product Type</p>
                    <div className='flex flex-col gap-2.5 text-sm font-light text-gray-600'>
                        {[
                            { label: "Men's Clothing", value: "Men" },
                            { label: "Women's Clothing", value: "Women" },
                            { label: "Kids' Clothing", value: "Kids" },
                            { label: "Fashion & Apparel", value: "Fashion" },
                            { label: "Electronics & Gadgets", value: "Electronics" },
                            { label: "Home & Kitchen", value: "Home" },
                            { label: "Sports & Outdoors", value: "Sports" },
                            { label: "Beauty & Grooming", value: "Beauty" },
                            { label: "Books & Stationery", value: "Books" },
                            { label: "Toys & Games", value: "Toys" },
                            { label: "Fitness & Health", value: "Fitness" },
                            { label: "Groceries & Essentials", value: "Groceries" },
                            { label: "Other Items", value: "Items" }
                        ].map((cat) => (
                            <label key={cat.value} className='flex gap-2.5 items-center cursor-pointer hover:text-black transition-colors select-none'>
                                <input 
                                    className='w-4 h-4 cursor-pointer accent-black rounded border-gray-300 focus:ring-0 focus:ring-offset-0' 
                                    type='checkbox' 
                                    value={cat.value} 
                                    onChange={toggleCategory} 
                                    checked={category.includes(cat.value)} 
                                /> 
                                <span className='text-xs font-medium text-gray-700'>{cat.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Subproduct Type Filter */}
                <div className={`border border-gray-300 pl-5 py-4 mt-6 ${showFilter ? '' : 'hidden'} sm:block rounded-lg shadow-sm bg-white transition-all duration-300`}>
                    <p className='mb-3 text-sm font-bold text-gray-900 tracking-wide uppercase text-[11px]'>Subproduct Type</p>
                    {category.length === 0 ? (
                        <div className='flex flex-col items-center justify-center p-4 border border-dashed border-gray-200 rounded-md bg-gray-50/50 text-center mr-5 animate-fade-in'>
                            <p className='text-[10px] text-gray-400 font-medium leading-relaxed'>
                                Select a <span className="font-semibold text-gray-600">Product Type</span> above to filter by Subproduct Type!
                            </p>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-2.5 text-sm font-light text-gray-600 animate-fade-in'>
                            {getAllowedSubCategories().map((sub) => (
                                <label key={sub.value} className='flex gap-2.5 items-center cursor-pointer hover:text-black transition-colors select-none'>
                                    <input 
                                        className='w-4 h-4 cursor-pointer accent-black rounded border-gray-300 focus:ring-0 focus:ring-offset-0' 
                                        type='checkbox' 
                                        value={sub.value} 
                                        onChange={toggleSubCategory} 
                                        checked={subCategory.includes(sub.value)}
                                    /> 
                                    <span className='text-xs font-medium text-gray-700'>{sub.label}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side */}
            <div className='flex-1'>

                <div className='flex justify-between text-base sm:text-2xl mb-4'>
                    <Title text1={'ALL'} text2={'COLLECTIONS'} />
                    {/* Product Sort */}
                    <select onChange={(e) => setSortType(e.target.value)} className='border-2 border-gray-300 text-sm px-2'>
                        <option value="relevant">Sort by: Relevant</option>
                        <option value="low-high">Sort by: Low to High</option>
                        <option value="high-low">Sort by: High to Low</option>
                    </select>
                </div>

                {/*map products*/}

                {filterProducts.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl animate-fade-in w-full'>
                        <div className='w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 shadow-sm border border-rose-100 animate-bounce'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className='text-lg font-bold text-gray-900 mb-1.5'>No Products Available</h3>
                        <p className='text-sm text-gray-500 max-w-sm leading-relaxed mb-6'>
                            We couldn't find any products matching your search query <span className='font-semibold text-indigo-600 font-mono'>"{search}"</span>. Try checking for typos or searching a different keyword.
                        </p>
                        <button 
                            onClick={() => { setSearch(''); }}
                            className='bg-black text-white hover:bg-gray-800 text-xs uppercase font-extrabold tracking-wider py-2.5 px-6 rounded-lg transition-all cursor-pointer shadow hover:shadow-md'
                        >
                            Clear Search Filter
                        </button>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-6'>
                        {
                            filterProducts.map((item, index) => (
                                <ProductItem
                                    key={index}
                                    name={item.name}
                                    id={item._id}
                                    price={item.price}
                                    image={item.image}
                                />
                            ))
                        }
                    </div>
                )}




            </div>

        </div>
    )
}

export default Collection