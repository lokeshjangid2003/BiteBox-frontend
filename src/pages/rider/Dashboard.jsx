import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { formatPrice } from '../../utils/format';
import { FiPackage, FiCheckCircle, FiDollarSign, FiNavigation } from 'react-icons/fi';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalEarnings: 0,
  });
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Set up real-time updates
    const socket = getSocket();
    if (socket) {
      const handleOrderUpdate = (updatedOrder) => {
        setActiveOrders((prevOrders) => {
          const existingIndex = prevOrders.findIndex((o) => o.id === updatedOrder.id);
          if (existingIndex >= 0) {
            if (updatedOrder.status === 'DELIVERED') {
              // Remove delivered orders from active list
              return prevOrders.filter((o) => o.id !== updatedOrder.id);
            }
            // Update existing order
            const newOrders = [...prevOrders];
            newOrders[existingIndex] = updatedOrder;
            return newOrders;
          } else if (updatedOrder.status === 'PICKED_BY_RIDER' && updatedOrder.riderId) {
            // Add new assigned order
            return [updatedOrder, ...prevOrders];
          }
          return prevOrders;
        });
        fetchDashboardData();
      };

      socket.on('order:update', handleOrderUpdate);
      return () => {
        socket.off('order:update', handleOrderUpdate);
      };
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch assigned orders (active deliveries)
      const assignedRes = await orderAPI.getRiderOrders('assigned');
      const assignedOrders = assignedRes.data || [];
      
      // Filter active orders (not delivered)
      const active = assignedOrders.filter(order => order.status === 'PICKED_BY_RIDER');
      
      // Calculate completed deliveries (delivered today)
      const today = new Date().toISOString().split('T')[0];
      const completed = assignedOrders.filter(
        order => order.status === 'DELIVERED' && order.updatedAt?.startsWith(today)
      );

      // Calculate earnings (simple calculation - 10% of order value)
      const earnings = completed.reduce(
        (sum, order) => sum + parseFloat(order.totalAmount || 0) * 0.1,
        0
      );

      setStats({
        activeDeliveries: active.length,
        completedDeliveries: completed.length,
        totalEarnings: earnings,
      });

      setActiveOrders(active);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      toast.success('Order status updated successfully!');
      fetchDashboardData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update order status';
      toast.error(errorMessage);
    }
  };

  const handleNavigate = () => {
    // Dummy navigation - in real app, this would open maps
    toast.info('Navigation feature coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Active Deliveries */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">On the Way</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDeliveries}</p>
            </div>
            <FiPackage className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedDeliveries}</p>
            </div>
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.totalEarnings)}
              </p>
            </div>
            <FiDollarSign className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Orders</h2>

        {activeOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No active deliveries</p>
            <p className="text-sm text-gray-500 mt-2">New delivery requests will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeOrders.map((order) => (
              <div key={order.id} className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-primary font-bold">PICK UP:</span>
                    <span className="font-bold text-gray-900">{order.restaurant?.name || 'Restaurant'}</span>
                  </div>
                  <span className="text-sm text-gray-500">#{order.id.substring(0, 8)}</span>
                </div>

                {/* Location */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-primary mt-1">📍</span>
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.restaurant?.address || 'Address not available'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Delivery: {order.deliveryAddress || 'Address not available'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                    {order.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{order.user?.name || 'Customer'}</p>
                    <p className="text-sm text-gray-600">
                      {order.orderItems
                        ?.map((item) => `${item.quantity}x ${item.foodItem?.name || 'Item'}`)
                        .join(', ') || 'No items'}
                    </p>
                  </div>
                </div>

                {/* Delivery Items */}
                <div className="mb-4 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-semibold text-gray-900">
                      For {order.user?.name || 'Customer'}
                    </span>
                  </div>
                  {order.orderItems?.map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-600 ml-4">
                      {item.quantity}x {item.foodItem?.name || 'Item'}
                    </p>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleNavigate}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <FiNavigation className="w-4 h-4" />
                    <span>Navigate</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
