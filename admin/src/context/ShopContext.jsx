import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { products as staticProducts } from "../assets/assets";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = "₹";
    const Delivery_fee = 10;
    const backendUrl = "http://localhost:4000";
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("");

    // Fetch products dynamically from backend and map their image/size arrays
    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list');
            if (response.data.success) {
                // Map the database products back to their imported image references in the frontend
                const mapped = response.data.products.map(p => {
                    const local = staticProducts.find(item => item._id === p._id || item.name === p.name);
                    return {
                        ...p,
                        image: local ? local.image : p.image
                    };
                });
                setProducts(mapped);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Fetch products error:", error);
            toast.error("Failed to load products from database");
        }
    };

    const addToCart = async (itemId, size) => {
        if (!size) {
            toast.error('Please Select Product Size');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);
        toast.success("Added to cart");

        // Sync with backend if token exists
        if (token) {
            try {
                const response = await axios.post(
                    backendUrl + '/api/cart/add',
                    { itemId, size },
                    { headers: { token } }
                );
                if (!response.data.success) {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Cart sync error:", error);
                toast.error("Failed to sync cart item to database");
            }
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId][size] = quantity;
        setCartItems(cartData);

        // Sync with backend if token exists
        if (token) {
            try {
                const response = await axios.post(
                    backendUrl + '/api/cart/update',
                    { itemId, size, quantity },
                    { headers: { token } }
                );
                if (!response.data.success) {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Cart quantity sync error:", error);
                toast.error("Failed to update cart quantity in database");
            }
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (!itemInfo) continue;
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
        return totalAmount;
    }

    // Get user's cart from backend
    const getUserCart = async (userToken) => {
        try {
            const response = await axios.post(
                backendUrl + '/api/cart/get',
                {},
                { headers: { token: userToken } }
            );
            if (response.data.success) {
                setCartItems(response.data.cartData);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Get user cart error:", error);
            toast.error("Failed to load cart from database");
        }
    }

    // Load products on mount
    useEffect(() => {
        getProductsData();
    }, []);

    // Check for existing token and load cart
    useEffect(() => {
        const localToken = localStorage.getItem('token');
        if (localToken) {
            setToken(localToken);
        }
    }, []);

    // Fetch user cart reactively on token changes
    useEffect(() => {
        if (token) {
            getUserCart(token);
        } else {
            setCartItems({});
        }
    }, [token]);

    const Value = {
        products,
        currency,
        Delivery_fee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        setCartItems,
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        backendUrl,
        token,
        setToken
    }

    return (
        <ShopContext.Provider value={Value}>
            {props.children}
        </ShopContext.Provider>
    )
}
export default ShopContextProvider;