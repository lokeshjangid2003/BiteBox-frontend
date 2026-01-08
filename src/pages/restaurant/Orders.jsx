import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import { formatPrice, formatDate, getStatusText, getStatusColor } from '../../utils/format';
import { getSocket } from '../../services/socket';
import { FiSearch, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();

    // Set up real-time updates
    const socket = getSocket();
    if (socket) {
      socket.on('order:update', handleOrderUpdate);
      return () => {
        socket.off('order:update', handleOrderUpdate);
      };
    }
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getRestaurantOrders();
      setOrders(response.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const filterOrders = () => {
    let filtered = [...orders];

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
          order.orderItems?.some((item) =>
            item.foodItem?.name?.toLowerCase().includes(query)
          ) ||
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
          <p className="text-gray-600 mt-2">Manage and track all your restaurant orders</p>
        </div>
        <button
          onClick={() => navigate('/restaurant/menu')}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Menu Item</span>
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
            <option value="PLACED">Pending</option>
            <option value="ACCEPTED_BY_RESTAURANT">Accepted</option>
            <option value="REJECTED_BY_RESTAURANT">Rejected</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
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
                  {/* Customer Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                    {order.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900">
                        {order.user?.name || 'Customer'}
                      </h3>
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
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex flex-col md:items-end space-y-3">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(order.totalAmount)}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {order.status === 'PLACED' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'ACCEPTED_BY_RESTAURANT')}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'REJECTED_BY_RESTAURANT')}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {order.status === 'REJECTED_BY_RESTAURANT' && (
                      <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                        Rejected
                      </span>
                    )}
                    {order.status === 'ACCEPTED_BY_RESTAURANT' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'READY')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'READY' && (
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                        Waiting for Rider
                      </span>
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
