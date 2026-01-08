import { formatPrice, formatDate, getStatusText, getStatusColor } from '../utils/format';

const OrderCard = ({ order }) => {
  const statusColor = getStatusColor(order.status);
  const statusText = getStatusText(order.status);

  return (
    <div className="card p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side - Restaurant Info */}
        <div className="flex items-start space-x-4 flex-1">
          {/* Restaurant Image */}
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            {order.restaurant?.imageUrl ? (
              <img
                src={order.restaurant.imageUrl}
                alt={order.restaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80';
                }}
              />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80"
                alt={order.restaurant?.name || 'Restaurant'}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Order Details */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {order.restaurant?.name || 'Restaurant'}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              {formatDate(order.createdAt)}
            </p>
            <p className="text-2xl font-bold text-primary">
              {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>

        {/* Right Side - Status and Actions */}
        <div className="flex flex-col md:items-end space-y-3">
          {/* Status Badge */}
          <span
            className={`px-4 py-2 rounded-lg text-white font-medium text-sm ${statusColor}`}
          >
            {statusText}
          </span>

          {/* View Details Button */}
          <button className="btn-primary px-6 py-2 text-sm">
            View Details
          </button>
        </div>
      </div>

      {/* Order Items Preview */}
      {order.orderItems && order.orderItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {order.orderItems.slice(0, 3).map((orderItem) => (
              <div key={orderItem.id} className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                  {orderItem.foodItem?.imageUrl ? (
                    <img
                      src={orderItem.foodItem.imageUrl}
                      alt={orderItem.foodItem.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80';
                      }}
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80"
                      alt={orderItem.foodItem?.name || 'Food item'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
            {order.orderItems.length > 3 && (
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-lg bg-gray-100">
                <span className="text-gray-600 font-medium">
                  +{order.orderItems.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
