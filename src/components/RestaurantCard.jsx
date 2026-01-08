import { FiClock, FiStar } from 'react-icons/fi';

const RestaurantCard = ({ restaurant, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="card cursor-pointer overflow-hidden hover:scale-105 transition-transform duration-200"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80';
            }}
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80"
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{restaurant.name}</h3>
        
        {restaurant.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{restaurant.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <FiClock className="w-4 h-4" />
            <span>30-35 mins</span>
          </div>
          <div className="flex items-center space-x-1">
            <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium">4.5</span>
          </div>
          <div className="text-primary font-medium">
            ₹200 for one
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
