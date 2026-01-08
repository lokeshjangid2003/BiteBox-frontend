import { useState } from 'react';
import { orderAPI } from '../services/api';
import { formatPrice } from '../utils/format';
import { FiMapPin, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DeliveryNotificationPopup = ({ order, onClose, onAccept }) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await orderAPI.assignOrder(order.id);
      toast.success('Delivery accepted successfully!');
      onAccept();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to accept delivery';
      toast.error(errorMessage);
      console.error('Accept delivery error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    onClose();
  };

  if (!order) return null;

  const orderSummary = order.orderItems
    ?.map((item) => `${item.quantity}x ${item.foodItem?.name || 'Item'}`)
    .join(', ') || 'No items';

  // Calculate estimated payout (you can adjust this logic)
  const estimatedPayout = parseFloat(order.totalAmount) * 0.1; // 10% of order value

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={handleReject}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">New Delivery Request</h2>
          <p className="text-sm text-gray-600">A new order is ready for pickup</p>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-4">
          {/* Restaurant */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Restaurant</p>
            <p className="text-lg font-bold text-gray-900">{order.restaurant?.name || 'Restaurant'}</p>
          </div>

          {/* Pickup Location */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <FiMapPin className="w-4 h-4 mr-1 text-primary" />
              Pickup Location
            </p>
            <p className="text-sm text-gray-900">{order.restaurant?.address || 'Address not available'}</p>
          </div>

          {/* Delivery Location */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center">
              <FiMapPin className="w-4 h-4 mr-1 text-green-500" />
              Delivery Location
            </p>
            <p className="text-sm text-gray-900">{order.deliveryAddress || 'Address not available'}</p>
          </div>

          {/* Order Items */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Order Items</p>
            <p className="text-sm text-gray-900">{orderSummary}</p>
          </div>

          {/* Estimated Payout */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-1">Estimated Payout</p>
            <p className="text-2xl font-bold text-blue-900">{formatPrice(estimatedPayout)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex space-x-3 border-t border-gray-200">
          <button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md"
          >
            {loading ? 'Accepting...' : 'Accept Delivery'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryNotificationPopup;
