import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import FoodItemCard from '../components/FoodItemCard';
import toast from 'react-hot-toast';

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      const [restaurantRes, foodItemsRes] = await Promise.all([
        restaurantAPI.getById(id),
        restaurantAPI.getFoodItems(id),
      ]);
      setRestaurant(restaurantRes.data);
      setFoodItems(foodItemsRes.data);
    } catch (error) {
      toast.error('Failed to load restaurant menu');
      console.error('Error fetching restaurant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item, id);
    toast.success(`${item.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Restaurant not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 btn-primary"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Restaurant Header */}
      <div className="relative h-64 bg-gradient-to-r from-primary/90 to-red-600/90">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: restaurant.imageUrl
              ? `url(${restaurant.imageUrl})`
              : 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80)',
          }}
        ></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="text-white/90 text-lg max-w-2xl">{restaurant.description}</p>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Menu</h2>
        
        {foodItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No food items available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                onAddToCart={() => handleAddToCart(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
