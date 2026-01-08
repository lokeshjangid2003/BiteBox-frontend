import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { subscribeToOrder, unsubscribeFromOrder, getSocket } from '../services/socket';
import { formatPrice, formatDate, getStatusText, getStatusColor } from '../utils/format';
import OrderCard from '../components/OrderCard';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('order:update', handleOrderUpdate);
      return () => {
        socket.off('order:update', handleOrderUpdate);
      };
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getUserOrders();
      setOrders(response.data);
      
      // Subscribe to all orders for real-time updates
      response.data.forEach((order) => {
        subscribeToOrder(order.id, handleOrderUpdate);
      });
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    toast.success(`Order #${updatedOrder.id.substring(0, 8)} status updated!`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Please login to view your orders</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Orders</h1>
          <p className="text-white/90 text-lg">View and manage your recent orders</p>
        </div>
      </div>

      {/* Orders Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Orders</h2>
        <p className="text-gray-600 mb-8">View and manage your recent orders</p>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">You haven't placed any orders yet</p>
            <a href="/" className="btn-primary inline-block">
              Browse Restaurants
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
