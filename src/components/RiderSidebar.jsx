import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPackage, FiDollarSign, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { getSocket } from '../services/socket';

const RiderSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    fetchPendingOrdersCount();

    // Set up real-time updates
    const socket = getSocket();
    if (socket) {
      const handleOrderUpdate = () => {
        // Refresh count when orders change
        fetchPendingOrdersCount();
      };

      socket.on('order:update', handleOrderUpdate);
      return () => {
        socket.off('order:update', handleOrderUpdate);
      };
    }
  }, []);

  const fetchPendingOrdersCount = async () => {
    try {
      const response = await orderAPI.getRiderOrders('available');
      const availableOrders = response.data || [];
      setPendingOrdersCount(availableOrders.length);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      setPendingOrdersCount(0);
    }
  };

  const menuItems = [
    { path: '/rider/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/rider/orders', icon: FiPackage, label: 'Orders' },
    { path: '/rider/earnings', icon: FiDollarSign, label: 'Earnings' },
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
                {item.path === '/rider/orders' && pendingOrdersCount > 0 && (
                  <span className="ml-auto bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderSidebar;
