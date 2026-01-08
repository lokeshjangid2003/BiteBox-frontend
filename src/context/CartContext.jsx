import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  // Load cart for current user when user changes
  useEffect(() => {
    if (user) {
      // User is logged in - load their cart
      const cartKey = `cart_${user.id}`;
      const restaurantIdKey = `restaurantId_${user.id}`;
      const savedCart = localStorage.getItem(cartKey);
      const savedRestaurantId = localStorage.getItem(restaurantIdKey);
      
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error parsing cart data:', error);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      
      if (savedRestaurantId) {
        setRestaurantId(savedRestaurantId);
      } else {
        setRestaurantId(null);
      }
    } else {
      // User is not logged in - clear cart
      setCartItems([]);
      setRestaurantId(null);
    }
  }, [user?.id]); // Reload when user changes

  // Save cart to localStorage for current user
  useEffect(() => {
    if (user) {
      const cartKey = `cart_${user.id}`;
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id]);

  // Save restaurantId to localStorage for current user
  useEffect(() => {
    if (user) {
      const restaurantIdKey = `restaurantId_${user.id}`;
      if (restaurantId) {
        localStorage.setItem(restaurantIdKey, restaurantId);
      } else {
        localStorage.removeItem(restaurantIdKey);
      }
    }
  }, [restaurantId, user?.id]);

  const addToCart = (item, newRestaurantId) => {
    // Only allow cart operations for logged-in USER role
    if (!user || user.role !== 'USER') {
      console.warn('Cart operations are only available for logged-in users with USER role');
      return;
    }

    // If adding item from different restaurant, clear cart
    if (restaurantId && restaurantId !== newRestaurantId) {
      setCartItems([{ ...item, quantity: 1 }]);
      setRestaurantId(newRestaurantId);
      return;
    }

    setRestaurantId(newRestaurantId);
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);
    
    if (existingItem) {
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
    if (cartItems.length === 1) {
      setRestaurantId(null);
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    // Also clear from localStorage
    if (user) {
      const cartKey = `cart_${user.id}`;
      const restaurantIdKey = `restaurantId_${user.id}`;
      localStorage.removeItem(cartKey);
      localStorage.removeItem(restaurantIdKey);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
