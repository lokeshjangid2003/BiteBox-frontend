import { formatPrice } from '../utils/format';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
      {/* Image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80';
            }}
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80"
            alt={item.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
        <p className="text-primary font-medium">{formatPrice(item.price)}</p>
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <span className="text-gray-600">-</span>
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <span className="text-gray-600">+</span>
        </button>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.id)}
        className="px-4 py-2 bg-red-50 text-primary rounded-lg hover:bg-red-100 transition-colors font-medium"
      >
        Remove
      </button>
    </div>
  );
};

export default CartItem;
