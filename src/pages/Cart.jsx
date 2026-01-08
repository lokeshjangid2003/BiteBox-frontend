import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { formatPrice } from '../utils/format';
import CartItem from '../components/CartItem';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems, getTotalPrice, clearCart, restaurantId } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    // Check if user has USER role
    if (user.role !== 'USER') {
      toast.error('Only customers can place orders. Please login with a customer account.');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!restaurantId) {
      toast.error('Invalid restaurant');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        restaurantId,
        items: cartItems.map((item) => ({
          foodItemId: item.id,
          quantity: item.quantity,
        })),
        deliveryAddress: user.address || 'Please provide delivery address',
      };

      const response = await orderAPI.create(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to place order';
      console.error('Order creation error:', error);
      console.error('Error response:', error.response);
      console.error('User role:', user?.role);
      
      // If it's a permission error, suggest logging out and back in
      if (error.response?.status === 403) {
        toast.error('Permission denied. Please logout and login again with a customer account.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-48 bg-gradient-to-r from-primary/90 to-red-600/90 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80)',
          }}
        ></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Cart</h1>
          <p className="text-white/90 text-lg">Manage the items in your shopping cart</p>
        </div>
      </div>

      {/* Cart Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart</h2>
          <p className="text-gray-600 mb-6">Manage the items in your shopping cart</p>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full btn-primary py-4 text-lg"
                >
                  {loading ? 'Placing Order...' : 'Proceed to Checkout'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
