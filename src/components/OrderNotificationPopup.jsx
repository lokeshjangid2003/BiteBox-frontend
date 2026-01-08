import { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { formatPrice } from '../utils/format';
import { FiX, FiMoreVertical } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrderNotificationPopup = ({ order, onClose, onAccept }) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await orderAPI.updateStatus(order.id, { status: 'ACCEPTED_BY_RESTAURANT' });
      toast.success('Order accepted successfully!');
      onAccept();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to accept order';
      toast.error(errorMessage);
      console.error('Accept order error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    setLoading(true);
    try {
      await orderAPI.updateStatus(order.id, { status: 'REJECTED_BY_RESTAURANT' });
      toast.success('Order rejected');
      onAccept(); // Refresh orders list
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to reject order';
      toast.error(errorMessage);
      console.error('Reject order error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  const orderSummary = order.orderItems
    ?.map((item) => `${item.quantity}x ${item.foodItem?.name || 'Item'}`)
    .join(', ') || 'No items';

  // Calculate total item count
  const totalItemCount = order.orderItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative">
        {/* Notification Badge */}
        {totalItemCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full min-w-[32px] h-8 flex items-center justify-center text-sm font-bold z-10 px-2 shadow-lg">
            {totalItemCount}
          </div>
        )}

        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Profile Picture - More realistic style */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-300 via-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl shadow-md relative overflow-hidden">
                {order.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                {/* Add a subtle overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{order.user?.name || 'Customer'}</h3>
                <p className="text-sm text-gray-500">placed a new order</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <FiMoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Order Details */}
        <div className="p-6 border-b border-gray-200">
          <p className="font-semibold text-base text-gray-900 mb-3">{orderSummary}</p>
          <p className="text-3xl font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex space-x-3">
          <button
            onClick={handleDismiss}
            disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Dismiss
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md"
          >
            {loading ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderNotificationPopup;
