import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiShoppingBag, FiMenu, FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';

const RestaurantSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'RESTAURANT') {
      fetchPendingOrdersCount();
    }
  }, [user]);

  const fetchPendingOrdersCount = async () => {
    try {
      const response = await orderAPI.getRestaurantOrders();
      const orders = response.data || [];
      const pending = orders.filter(
        (order) => order.status === 'PLACED' || order.status === 'ACCEPTED_BY_RESTAURANT'
      ).length;
      setPendingOrdersCount(pending);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  const menuItems = [
    { path: '/restaurant/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/restaurant/orders', icon: FiShoppingBag, label: 'Orders' },
    { path: '/restaurant/menu', icon: FiMenu, label: 'Menu' },
    { path: '/restaurant/notifications', icon: FiBell, label: 'Notifications' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-gray-800 min-h-screen fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">B</span>
          </div>
          <span className="text-xl font-bold text-white">BiteBox</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.path === '/restaurant/orders' && pendingOrdersCount > 0 && (
                  <span className="ml-auto bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default RestaurantSidebar;
