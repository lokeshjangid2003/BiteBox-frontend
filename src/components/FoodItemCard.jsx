import { formatPrice } from '../utils/format';

const FoodItemCard = ({ item, onAddToCart }) => {
  return (
    <div className="card overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80';
            }}
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"
            alt={item.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
        
        {item.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">{formatPrice(item.price)}</span>
          <button
            onClick={onAddToCart}
            className="btn-primary px-4 py-2 text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;
