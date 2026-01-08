import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, restaurantAPI } from '../../services/api';
import { FiPackage, FiDollarSign, FiClock, FiGrid, FiPlus, FiX, FiMapPin, FiPhone } from 'react-icons/fi';
import { formatPrice } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    newOrders: 0,
    revenueToday: 0,
    ordersToday: 0,
    menuItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRestaurants, setUserRestaurants] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Set up real-time updates via Socket.io
    const socket = getSocket();
    if (socket) {
      const handleOrderUpdate = (updatedOrder) => {
        setRecentOrders((prevOrders) => {
          const existingIndex = prevOrders.findIndex((o) => o.id === updatedOrder.id);
          if (existingIndex >= 0) {
            // Update existing order
            const newOrders = [...prevOrders];
            newOrders[existingIndex] = updatedOrder;
            return newOrders;
          } else {
            // New order - add to beginning
            return [updatedOrder, ...prevOrders].slice(0, 10);
          }
        });
        // Recalculate stats
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
      // Fetch user's restaurants
      const restaurantsRes = await restaurantAPI.getAll();
      const filteredRestaurants = restaurantsRes.data.filter(
        (r) => r.ownerId === user.id || r.owner?.id === user.id
      );
      setUserRestaurants(filteredRestaurants);

      if (filteredRestaurants.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch restaurant orders
      const ordersRes = await orderAPI.getRestaurantOrders();
      const allOrders = ordersRes.data || [];

      // Fetch menu items count
      let totalMenuItems = 0;
      for (const restaurant of filteredRestaurants) {
        try {
          const foodItemsRes = await restaurantAPI.getFoodItems(restaurant.id);
          totalMenuItems += foodItemsRes.data?.length || 0;
        } catch (error) {
          console.error('Error fetching food items:', error);
        }
      }

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = allOrders.filter(
        (order) => order.createdAt?.startsWith(today)
      );
      const pendingOrders = allOrders.filter(
        (order) => order.status === 'PLACED' || order.status === 'ACCEPTED_BY_RESTAURANT'
      );

      const revenue = todayOrders.reduce(
        (sum, order) => sum + parseFloat(order.totalAmount || 0),
        0
      );

      setStats({
        newOrders: pendingOrders.length,
        revenueToday: revenue,
        ordersToday: todayOrders.length,
        menuItems: totalMenuItems,
      });

      setRecentOrders(allOrders.slice(0, 10));
    } catch (error) {
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

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const response = await restaurantAPI.create(restaurantForm);
      toast.success('Restaurant created successfully!');
      setShowCreateModal(false);
      setRestaurantForm({
        name: '',
        description: '',
        address: '',
        phone: '',
        imageUrl: '',
      });
      // Trigger event to refresh restaurant header
      window.dispatchEvent(new Event('restaurant:created'));
      fetchDashboardData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Failed to create restaurant';
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

  // Show create restaurant UI if no restaurants exist
  if (userRestaurants.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMapPin className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to BiteBox!</h1>
            <p className="text-gray-600 mb-6">
              You don't have any restaurants yet. Create your first restaurant to get started.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Your First Restaurant</span>
            </button>
          </div>
        </div>

        {/* Create Restaurant Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Restaurant</h2>

              <form onSubmit={handleCreateRestaurant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                    className="input-field"
                    required
                    placeholder="e.g., Pizza Palace"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={restaurantForm.description}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Tell customers about your restaurant..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={restaurantForm.address}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                      className="input-field pl-10"
                      required
                      placeholder="Restaurant address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={restaurantForm.phone}
                      onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                      className="input-field pl-10"
                      placeholder="Restaurant phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={restaurantForm.imageUrl}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, imageUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Create Restaurant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {userRestaurants.length > 0 && (
            <p className="text-gray-600 mt-1">
              {userRestaurants.length === 1 
                ? `Restaurant: ${userRestaurants[0].name}`
                : `${userRestaurants.length} Restaurants`}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Restaurant</span>
          </button>
          <button
            onClick={() => navigate('/restaurant/menu')}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">New Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newOrders}</p>
            </div>
            <FiPackage className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Revenue Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stats.revenueToday)}
              </p>
            </div>
            <FiDollarSign className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Orders Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ordersToday}</p>
            </div>
            <FiClock className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Menu Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.menuItems}</p>
            </div>
            <FiGrid className="w-10 h-10 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Order Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Order Management</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Summary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-600 text-xs">🍕</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.user?.name || 'Customer'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.orderItems?.length || 0}x items
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {order.orderItems
                          ?.map((item) => `${item.quantity}x ${item.foodItem?.name || 'Item'}`)
                          .join(', ') || 'No items'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'DELIVERED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PREPARING'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {order.status === 'PLACED'
                          ? 'Pending'
                          : order.status === 'ACCEPTED_BY_RESTAURANT'
                          ? 'Accepted'
                          : order.status === 'PREPARING'
                          ? 'Preparing'
                          : order.status === 'READY'
                          ? 'Ready'
                          : order.status === 'PICKED_BY_RIDER'
                          ? 'On the Way'
                          : 'Delivered'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {order.status === 'PLACED' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'ACCEPTED_BY_RESTAURANT')}
                            className="px-3 py-1 bg-primary text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        {order.status === 'ACCEPTED_BY_RESTAURANT' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.status === 'PREPARING' && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'READY')}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === 'READY' && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Waiting for Rider
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Restaurant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Restaurant</h2>

            <form onSubmit={handleCreateRestaurant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={restaurantForm.name}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="e.g., Pizza Palace"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={restaurantForm.description}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Tell customers about your restaurant..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={restaurantForm.address}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                    className="input-field pl-10"
                    required
                    placeholder="Restaurant address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={restaurantForm.phone}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                    className="input-field pl-10"
                    placeholder="Restaurant phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={restaurantForm.imageUrl}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, imageUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
