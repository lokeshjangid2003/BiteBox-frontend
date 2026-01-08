import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { formatPrice, formatDate, getStatusText, getStatusColor } from '../../utils/format';
import { getSocket } from '../../services/socket';
import { FiSearch, FiNavigation } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Set up real-time updates
    const socket = getSocket();
    if (socket) {
      const handleOrderUpdate = (updatedOrder) => {
        setOrders((prevOrders) => {
          const existingIndex = prevOrders.findIndex((o) => o.id === updatedOrder.id);
          if (existingIndex >= 0) {
            const newOrders = [...prevOrders];
            newOrders[existingIndex] = updatedOrder;
            return newOrders;
          } else {
            return [updatedOrder, ...prevOrders];
          }
        });
      };

      socket.on('order:update', handleOrderUpdate);
      return () => {
        socket.off('order:update', handleOrderUpdate);
      };
    }
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, activeTab]);

  const fetchOrders = async () => {
    try {
      // Fetch both available and assigned orders
      const [availableRes, assignedRes] = await Promise.all([
        orderAPI.getRiderOrders('available'),
        orderAPI.getRiderOrders('assigned'),
      ]);

      const availableOrders = availableRes.data || [];
      const assignedOrders = assignedRes.data || [];

      // Combine and sort by creation date
      const allOrders = [...availableOrders, ...assignedOrders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(allOrders);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };


  const filterOrders = () => {
    let filtered = [...orders];

    // Tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter(
        (order) => order.status === 'READY' || order.status === 'PICKED_BY_RIDER'
      );
    } else if (activeTab === 'completed') {
      filtered = filtered.filter((order) => order.status === 'DELIVERED');
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.user?.name?.toLowerCase().includes(query) ||
          order.restaurant?.name?.toLowerCase().includes(query) ||
          order.id.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      toast.success('Order status updated successfully!');
      fetchOrders();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update order status';
      toast.error(errorMessage);
    }
  };

  const handleAssignOrder = async (orderId) => {
    try {
      await orderAPI.assignOrder(orderId);
      toast.success('Order assigned successfully!');
      fetchOrders();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to assign order';
      toast.error(errorMessage);
    }
  };

  const handleNavigate = () => {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Manage your delivery orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6 inline-flex">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-primary text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Active Orders
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-primary text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Completed Orders
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Status</option>
            <option value="READY">Ready for Pickup</option>
            <option value="PICKED_BY_RIDER">On the Way</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left Side */}
                <div className="flex items-start space-x-4 flex-1">
                  {/* Restaurant/Customer Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                    {order.restaurant?.name?.charAt(0)?.toUpperCase() || 'R'}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {order.restaurant?.name || 'Restaurant'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          To: {order.user?.name || 'Customer'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )} text-white`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {order.orderItems
                        ?.map((item) => `${item.quantity}x ${item.foodItem?.name || 'Item'}`)
                        .join(', ') || 'No items'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">Pickup:</span> {order.restaurant?.address}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Delivery:</span> {order.deliveryAddress}
                    </p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col md:items-end space-y-3">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(order.totalAmount)}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {order.status === 'READY' && !order.riderId && (
                      <button
                        onClick={() => handleAssignOrder(order.id)}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                      >
                        Accept Delivery
                      </button>
                    )}
                    {order.status === 'PICKED_BY_RIDER' && (
                      <>
                        <button
                          onClick={handleNavigate}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
                        >
                          <FiNavigation className="w-4 h-4" />
                          <span>Navigate</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          Mark as Delivered
                        </button>
                      </>
                    )}
                    {order.status === 'DELIVERED' && (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                        Delivered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
