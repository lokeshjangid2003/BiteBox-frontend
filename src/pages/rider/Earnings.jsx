import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../utils/format';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Earnings = () => {
  const [earnings, setEarnings] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily'); // daily, weekly, monthly

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  const fetchEarnings = async () => {
    try {
      // Fetch all assigned orders (includes both PICKED_BY_RIDER and DELIVERED)
      const response = await orderAPI.getRiderOrders('assigned');
      const allOrders = response.data || [];
      
      // Filter delivered orders only
      const deliveredOrders = allOrders.filter(order => order.status === 'DELIVERED');

      // Calculate earnings (10% of order value)
      const calculateEarnings = (orders) => {
        return orders.reduce(
          (sum, order) => sum + parseFloat(order.totalAmount || 0) * 0.1,
          0
        );
      };

      // Get date ranges
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Filter orders by date
      const todayOrders = deliveredOrders.filter(
        order => new Date(order.updatedAt) >= today
      );
      const weekOrders = deliveredOrders.filter(
        order => new Date(order.updatedAt) >= weekStart
      );
      const monthOrders = deliveredOrders.filter(
        order => new Date(order.updatedAt) >= monthStart
      );

      setEarnings({
        today: calculateEarnings(todayOrders),
        thisWeek: calculateEarnings(weekOrders),
        thisMonth: calculateEarnings(monthOrders),
      });

      // Generate earnings history
      const history = generateEarningsHistory(deliveredOrders);
      setEarningsHistory(history);
    } catch (error) {
      toast.error('Failed to load earnings');
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEarningsHistory = (orders) => {
    // Group orders by date
    const grouped = orders.reduce((acc, order) => {
      const date = new Date(order.updatedAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(order);
      return acc;
    }, {});

    // Convert to array and calculate earnings per day
    return Object.entries(grouped)
      .map(([date, dayOrders]) => {
        const earnings = dayOrders.reduce(
          (sum, order) => sum + parseFloat(order.totalAmount || 0) * 0.1,
          0
        );
        return {
          date,
          deliveries: dayOrders.length,
          earnings,
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30); // Last 30 days
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
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-2">Track your delivery earnings</p>
        </div>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Today's Earnings */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(earnings.today)}
              </p>
            </div>
            <FiDollarSign className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        {/* This Week's Earnings */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(earnings.thisWeek)}
              </p>
            </div>
            <FiTrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* This Month's Earnings */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(earnings.thisMonth)}
              </p>
            </div>
            <FiDollarSign className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Earnings History</h2>

        {earningsHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No earnings history yet</p>
            <p className="text-sm text-gray-500 mt-2">Complete deliveries to start earning</p>
          </div>
        ) : (
          <div className="space-y-4">
            {earningsHistory.map((entry, index) => {
              const date = new Date(entry.date);
              const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
              const dayNumber = date.getDate();
              const monthName = date.toLocaleDateString('en-IN', { month: 'short' });

              return (
                <div
                  key={entry.date}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {dayName}, {dayNumber} {monthName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {entry.deliveries} {entry.deliveries === 1 ? 'Delivery' : 'Deliveries'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      {formatPrice(entry.earnings)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;
