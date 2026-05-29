import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl, assets } from '../assets/assets';

const Add = ({ token }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Fashion');
    const [subCategory, setSubCategory] = useState('Topwear');
    const [bestseller, setBestseller] = useState(false);
    const [sizes, setSizes] = useState([]);
    const [image, setImage] = useState('p_img1'); // default template code

    // Beautiful clothing templates with high-res asset references
    const imageTemplates = [
        { code: 'p_img1', name: 'Women Neck Top', category: 'Women', subCategory: 'Topwear', image: assets.p_img1 },
        { code: 'p_img2_1', name: 'Men Pure Cotton T-Shirt', category: 'Men', subCategory: 'Topwear', image: assets.p_img2_1 },
        { code: 'p_img3', name: 'Girls Neck Top', category: 'Kids', subCategory: 'Topwear', image: assets.p_img3 },
        { code: 'p_img7', name: 'Men Flat-Front Trousers', category: 'Men', subCategory: 'Bottomwear', image: assets.p_img7 },
        { code: 'p_img21', name: 'Women Zip Fit Jacket', category: 'Women', subCategory: 'Winterwear', image: assets.p_img21 },
        { code: 'p_img55', name: 'Thermosteel Water Bottle', category: 'Items', subCategory: 'bottle', image: assets.p_img55 }
    ];

    // Enterprise-grade dynamic mapping of primary categories to relevant subcategories and sizes
    const categoryMapping = {
        Fashion: {
            subCategories: [
                { label: 'Topwear', value: 'Topwear' },
                { label: 'Bottomwear', value: 'Bottomwear' },
                { label: 'Winterwear', value: 'Winterwear' }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL']
        },
        Men: {
            subCategories: [
                { label: 'Topwear', value: 'Topwear' },
                { label: 'Bottomwear', value: 'Bottomwear' },
                { label: 'Winterwear', value: 'Winterwear' }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL']
        },
        Women: {
            subCategories: [
                { label: 'Topwear', value: 'Topwear' },
                { label: 'Bottomwear', value: 'Bottomwear' },
                { label: 'Winterwear', value: 'Winterwear' }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL']
        },
        Kids: {
            subCategories: [
                { label: 'Topwear', value: 'Topwear' },
                { label: 'Bottomwear', value: 'Bottomwear' },
                { label: 'Winterwear', value: 'Winterwear' }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL']
        },
        Electronics: {
            subCategories: [
                { label: 'Mobiles & Tablets', value: 'Mobiles' },
                { label: 'Computers & Accessories', value: 'Computers' },
                { label: 'Audio & Speakers', value: 'Audio' }
            ],
            sizes: ['Standard', '64GB', '128GB', '256GB', '512GB']
        },
        Home: {
            subCategories: [
                { label: 'Kitchen & Dining', value: 'Kitchenware' },
                { label: 'Home Decor & Lighting', value: 'Decor' },
                { label: 'Furniture', value: 'Furniture' }
            ],
            sizes: ['Standard', 'Small', 'Medium', 'Large']
        },
        Sports: {
            subCategories: [
                { label: 'Fitness Gear', value: 'Fitness Gear' },
                { label: 'Outdoor Equipment', value: 'Outdoor' }
            ],
            sizes: ['Standard', 'Small', 'Medium', 'Large']
        },
        Beauty: {
            subCategories: [
                { label: 'Cosmetics & Makeup', value: 'Cosmetics' },
                { label: 'Skincare', value: 'Skincare' },
                { label: 'Fragrances', value: 'Fragrances' }
            ],
            sizes: ['Standard', '50ml', '100ml', '200ml']
        },
        Books: {
            subCategories: [
                { label: 'Novels & Fiction', value: 'Novels' },
                { label: 'Stationery', value: 'Stationery' }
            ],
            sizes: ['Paperback', 'Hardcover', 'Kindle']
        },
        Toys: {
            subCategories: [
                { label: 'Toys & Board Games', value: 'Games' },
                { label: 'Action Figures & Dolls', value: 'Figures' }
            ],
            sizes: ['Standard', 'Ages 0-3', 'Ages 3-6', 'Ages 6+']
        },
        Fitness: {
            subCategories: [
                { label: 'Supplements & Protein', value: 'Supplements' },
                { label: 'Gym Accessories', value: 'Gym Acc' }
            ],
            sizes: ['Standard', '500g', '1kg', '2kg']
        },
        Groceries: {
            subCategories: [
                { label: 'Snacks & Beverages', value: 'Snacks' },
                { label: 'Packaged Foods', value: 'Packaged' }
            ],
            sizes: ['Standard', 'Single Pack', 'Pack of 3', 'Pack of 5']
        },
        Items: {
            subCategories: [
                { label: 'Bottle & Drinkware', value: 'bottle' },
                { label: 'Other Accessories', value: 'Accessories' }
            ],
            sizes: ['Standard', 'free size']
        }
    };

    // Slots for up to 4 images (Slot 1, Slot 2, Slot 3, Slot 4)
    const [slots, setSlots] = useState([
        { mode: 'preset', code: 'p_img1', url: '', base64: '', fileName: '' },
        { mode: 'preset', code: '', url: '', base64: '', fileName: '' },
        { mode: 'preset', code: '', url: '', base64: '', fileName: '' },
        { mode: 'preset', code: '', url: '', base64: '', fileName: '' }
    ]);
    const [activeSlotIndex, setActiveSlotIndex] = useState(0);

    const activeSlot = slots[activeSlotIndex];

    const getSlotPreviewImage = (slot) => {
        if (!slot) return assets.upload_area;
        if (slot.mode === 'url') {
            return slot.url || assets.upload_area;
        } else if (slot.mode === 'upload') {
            return slot.base64 || assets.upload_area;
        }
        if (slot.code) {
            const found = imageTemplates.find(t => t.code === slot.code);
            return found ? found.image : assets.p_img1;
        }
        return assets.upload_area;
    };

    const updateActiveSlot = (updates) => {
        setSlots(prev => prev.map((s, idx) => idx === activeSlotIndex ? { ...s, ...updates } : s));
    };

    // Smart autofill Category & Subcategory when clicking a template preset
    const selectTemplate = (template) => {
        updateActiveSlot({ mode: 'preset', code: template.code });
        setCategory(template.category);
        setSubCategory(template.subCategory);
    };

    // Reactive category change handler to clear out sizes and update subcategories instantly
    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        const mapping = categoryMapping[newCategory] || categoryMapping.Items;
        if (mapping.subCategories && mapping.subCategories.length > 0) {
            setSubCategory(mapping.subCategories[0].value);
        } else {
            setSubCategory('');
        }
        setSizes([]);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateActiveSlot({ mode: 'upload', base64: reader.result, fileName: file.name });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSizeToggle = (size) => {
        setSizes(prev => 
            prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size]
        );
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        try {
            if (sizes.length === 0) {
                toast.error("Please select at least one available size.");
                return;
            }

            // Extract non-empty image fields from slots
            const finalImages = [];
            slots.forEach((slot, index) => {
                let imgVal = '';
                if (slot.mode === 'preset' && slot.code) {
                    imgVal = slot.code;
                } else if (slot.mode === 'url' && slot.url) {
                    imgVal = slot.url;
                } else if (slot.mode === 'upload' && slot.base64) {
                    imgVal = slot.base64;
                }
                if (imgVal) {
                    finalImages.push(imgVal);
                }
            });

            if (finalImages.length === 0) {
                toast.error("Please provide at least one product picture.");
                return;
            }

            const response = await axios.post(
                backendUrl + '/api/product/add',
                { name, description, price: Number(price), image: finalImages, category, subCategory, sizes, bestseller },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(response.data.message);
                setName('');
                setDescription('');
                setPrice('');
                setBestseller(false);
                setSizes([]);
                setSlots([
                    { mode: 'preset', code: 'p_img1', url: '', base64: '', fileName: '' },
                    { mode: 'preset', code: '', url: '', base64: '', fileName: '' },
                    { mode: 'preset', code: '', url: '', base64: '', fileName: '' },
                    { mode: 'preset', code: '', url: '', base64: '', fileName: '' }
                ]);
                setActiveSlotIndex(0);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Add item error:", error);
            toast.error("Failed to add product to database.");
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col xl:flex-row w-full items-start gap-8 p-8 bg-gray-50 min-h-screen text-gray-700'>
            {/* Left Side: Visual Previewer & Presets */}
            <div className='w-full xl:w-[45%] flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-[90px]'>
                {/* 4 Multi-Image Preview Slots */}
                <div className='flex flex-col gap-2'>
                    <label className='font-semibold text-xs text-gray-800 uppercase tracking-wider text-gray-900'>Product Image Gallery Slots (Up to 4)</label>
                    <div className='grid grid-cols-4 gap-3'>
                        {slots.map((slot, index) => {
                            const isSelected = index === activeSlotIndex;
                            const previewImg = getSlotPreviewImage(slot);
                            const slotLabels = ['Main View', 'Side Angle', 'Back View', 'Detail View'];
                            return (
                                <div 
                                    key={index}
                                    onClick={() => setActiveSlotIndex(index)}
                                    className={`flex flex-col items-center p-2 border rounded-lg bg-gray-50 cursor-pointer transition-all hover:scale-102 ${
                                        isSelected 
                                            ? 'border-[#ff4e6e] ring-2 ring-[#ffebf0] bg-white shadow-sm' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className='w-full h-14 flex items-center justify-center overflow-hidden rounded bg-white border border-gray-100 mb-1.5'>
                                        <img className='max-h-full object-contain' src={previewImg} alt={`slot ${index + 1}`} />
                                    </div>
                                    <span className='text-[8px] font-bold text-gray-500 text-center uppercase tracking-wide truncate w-full'>
                                        {slotLabels[index]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Large Live Preview Uploader Area for the Selected Active Slot */}
                <div className='border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors h-[260px] w-full relative overflow-hidden group shadow-inner mt-2'>
                    {activeSlot.mode === 'upload' ? (
                        <label className='w-full h-full flex flex-col items-center justify-center cursor-pointer'>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className='hidden' 
                            />
                            <img 
                                className='max-h-[180px] object-contain transition-transform duration-300 group-hover:scale-105' 
                                src={getSlotPreviewImage(activeSlot)} 
                                alt="live preview" 
                            />
                            <div className='text-[10px] text-gray-500 mt-2 font-medium hover:text-gray-800 transition-colors'>
                                {activeSlot.fileName ? `File: ${activeSlot.fileName}` : 'Click to select local picture file'}
                            </div>
                        </label>
                    ) : (
                        <img 
                            className='max-h-[200px] object-contain transition-transform duration-300 group-hover:scale-105' 
                            src={getSlotPreviewImage(activeSlot)} 
                            alt="live preview" 
                            onError={(e) => {
                                e.target.src = assets.upload_area;
                            }}
                        />
                    )}
                    <div className='absolute bottom-3 right-3 bg-black/75 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider pointer-events-none'>
                        {['Main View', 'Side Angle', 'Back View', 'Detail View'][activeSlotIndex]}: {activeSlot.mode === 'url' ? 'URL' : activeSlot.mode === 'upload' ? 'Local File' : activeSlot.code ? activeSlot.code : 'Empty'}
                    </div>
                </div>

                {/* Image Selection Tabs for Active Slot */}
                <div className='flex gap-2 border-b border-gray-100 pb-1'>
                    <button 
                        type='button' 
                        onClick={() => updateActiveSlot({ mode: 'preset' })}
                        className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                            activeSlot.mode === 'preset' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Preset Templates
                    </button>
                    <button 
                        type='button' 
                        onClick={() => updateActiveSlot({ mode: 'url' })}
                        className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                            activeSlot.mode === 'url' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Custom Image URL
                    </button>
                    <button 
                        type='button' 
                        onClick={() => updateActiveSlot({ mode: 'upload' })}
                        className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                            activeSlot.mode === 'upload' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Upload Picture
                    </button>
                </div>

                {/* Slot Specific Inputs */}
                {activeSlot.mode === 'url' && (
                    <div className='flex flex-col gap-2'>
                        <label className='font-semibold text-xs text-gray-800 uppercase tracking-wider'>Enter Picture Web Link (URL)</label>
                        <input 
                            onChange={(e) => updateActiveSlot({ url: e.target.value })} 
                            value={activeSlot.url} 
                            type="url" 
                            placeholder='https://images.unsplash.com/photo-1578587018452-892bacefd3f2' 
                            className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-sm shadow-sm'
                        />
                        <p className='text-[10px] text-gray-500 mt-[-2px]'>
                            Paste any hosted image URL to render this angle's picture.
                        </p>
                    </div>
                )}

                {activeSlot.mode === 'upload' && (
                    <div className='flex flex-col gap-2 bg-gray-50 p-4 border border-gray-200 rounded-lg'>
                        <label className='font-semibold text-xs text-gray-800 uppercase tracking-wider'>Select Custom Image File</label>
                        <div className='flex items-center gap-3'>
                            <label className='px-4 py-2 border border-gray-300 hover:border-black rounded-lg bg-white font-bold text-xs uppercase cursor-pointer hover:shadow transition-all inline-block'>
                                Browse Files
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    className='hidden' 
                                />
                            </label>
                            <span className='text-xs text-gray-500 truncate max-w-[200px]'>
                                {activeSlot.fileName || "No file selected"}
                            </span>
                        </div>
                    </div>
                )}

                {activeSlot.mode === 'preset' && (
                    <div className='flex flex-col gap-3'>
                        <label className='font-semibold text-xs text-gray-800 uppercase tracking-wider'>Product Presets Grid</label>
                        <div className='grid grid-cols-3 sm:grid-cols-6 gap-3'>
                            {imageTemplates.map((t) => {
                                const isSelected = t.code === activeSlot.code && activeSlot.mode === 'preset';
                                return (
                                    <div 
                                        key={t.code}
                                        onClick={() => selectTemplate(t)}
                                        className={`flex flex-col items-center p-1.5 border rounded-lg bg-white cursor-pointer transition-all hover:scale-105 ${
                                            isSelected 
                                                ? 'border-[#ff4e6e] ring-2 ring-[#ffebf0] shadow-sm' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className='w-full h-10 flex items-center justify-center overflow-hidden rounded bg-gray-50 mb-1'>
                                            <img className='max-h-full object-contain' src={t.image} alt={t.name} />
                                        </div>
                                        <span className='text-[8px] font-bold text-gray-500 text-center uppercase tracking-wide truncate w-full'>
                                            {t.code}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: Configuration Fields */}
            <div className='w-full xl:w-[55%] flex flex-col gap-5 bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
                <div className='flex flex-col gap-1 border-b border-gray-100 pb-3'>
                    <h2 className='text-xl font-bold text-gray-900'>Product Configurations</h2>
                    <p className='text-xs text-gray-500'>Fills attributes to insert product row in relational MySQL catalog.</p>
                </div>

                {/* Product Title */}
                <div className='w-full flex flex-col gap-2'>
                    <label className='font-semibold text-xs text-gray-800 uppercase tracking-wider'>Product Title</label>
                    <input 
                        onChange={(e) => setName(e.target.value)} 
                        value={name} 
                        type="text" 
                        placeholder='e.g. Casual Winter Hooded Jacket' 
                        required 
                        className='w-full px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-sm shadow-sm'
                    />
                </div>

                {/* Product Description */}
                <div className='w-full flex flex-col gap-2'>
                    <label className='font-semibold text-xs text-gray-800 uppercase tracking-wider'>Product Description</label>
                    <textarea 
                        onChange={(e) => setDescription(e.target.value)} 
                        value={description} 
                        placeholder='Write material details, size specs, or fabric instructions...' 
                        required 
                        rows={4}
                        className='w-full px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-sm resize-none shadow-sm'
                    />
                </div>

                {/* Price, Category, Subcategory Row */}
                <div className='flex flex-col sm:flex-row gap-4 w-full'>
                    <div className='flex-1 flex flex-col gap-2'>
                        <label className='font-semibold text-xs text-gray-800 uppercase tracking-wider'>Product Type</label>
                        <select 
                            onChange={(e) => handleCategoryChange(e.target.value)} 
                            value={category} 
                            className='w-full px-3 py-2.5 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black shadow-sm'
                        >
                            <option value="Fashion">Fashion & Apparel</option>
                            <option value="Electronics">Electronics & Gadgets</option>
                            <option value="Home">Home & Kitchen</option>
                            <option value="Sports">Sports & Outdoors</option>
                            <option value="Beauty">Beauty & Grooming</option>
                            <option value="Books">Books & Stationery</option>
                            <option value="Toys">Toys & Games</option>
                            <option value="Fitness">Fitness & Health</option>
                            <option value="Groceries">Groceries & Essentials</option>
                            <option value="Men">Men's Clothing</option>
                            <option value="Women">Women's Clothing</option>
                            <option value="Kids">Kids' Clothing</option>
                            <option value="Items">Other Items</option>
                        </select>
                    </div>

                    <div className='flex-1 flex flex-col gap-2'>
                        <label className='font-semibold text-xs text-gray-800 uppercase tracking-wider'>Subproduct Type</label>
                        <select 
                            onChange={(e) => setSubCategory(e.target.value)} 
                            value={subCategory} 
                            className='w-full px-3 py-2.5 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black shadow-sm'
                        >
                            {(categoryMapping[category] || categoryMapping.Items).subCategories.map((sub) => (
                                <option key={sub.value} value={sub.value}>
                                    {sub.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='flex-1 flex flex-col gap-2'>
                        <label className='font-semibold text-xs text-gray-800 uppercase tracking-wider'>Price (INR)</label>
                        <input 
                            onChange={(e) => setPrice(e.target.value)} 
                            value={price} 
                            type="number" 
                            placeholder='₹ 499' 
                            required 
                            min={1}
                            className='w-full px-3 py-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black bg-white text-sm shadow-sm'
                        />
                    </div>
                </div>

                {/* Sizes Selection Grid */}
                <div className='flex flex-col gap-2'>
                    <label className='font-semibold text-xs text-gray-800 uppercase tracking-wider'>Available Sizes / Options</label>
                    <div className='flex flex-wrap gap-2.5'>
                        {(categoryMapping[category] || categoryMapping.Items).sizes.map(size => {
                            const isSizeSelected = sizes.includes(size);
                            return (
                                <button 
                                    key={size}
                                    type='button'
                                    onClick={() => handleSizeToggle(size)}
                                    className={`border px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-sm ${
                                        isSizeSelected 
                                            ? 'bg-black border-black text-white' 
                                            : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Bestseller Toggle */}
                <div className='flex items-center gap-2 border-t border-gray-100 pt-4 mt-2'>
                    <input 
                        onChange={(e) => setBestseller(e.target.checked)} 
                        checked={bestseller} 
                        type="checkbox" 
                        id='bestseller' 
                        className='w-4.5 h-4.5 cursor-pointer focus:ring-0 focus:outline-none accent-black'
                    />
                    <label htmlFor='bestseller' className='font-semibold text-xs text-gray-800 uppercase tracking-wider cursor-pointer select-none'>
                        Tag as a "Bestseller" Item
                    </label>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    className='bg-[#ff4e6e] text-white py-3.5 rounded-lg text-xs uppercase font-extrabold tracking-wider hover:bg-[#e03d5c] hover:shadow-lg transition-all cursor-pointer mt-2 shadow'
                >
                    Add Custom Item to MySQL Catalog
                </button>
            </div>
        </form>
    );
};

export default Add;
