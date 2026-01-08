import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import toast from 'react-hot-toast';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      setRestaurants(response.data);
    } catch (error) {
      toast.error('Failed to load restaurants');
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96 bg-gradient-to-r from-primary/90 to-red-600/90 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80)',
          }}
        ></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Discover the best food & drinks
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Order delicious food from your favorite restaurants
          </p>
          <button
            onClick={() => window.scrollTo({ top: document.getElementById('restaurants').offsetTop - 100, behavior: 'smooth' })}
            className="btn-primary text-lg px-8 py-4"
          >
            View Restaurants
          </button>
        </div>
      </div>

      {/* Restaurants Section */}
      <div id="restaurants" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Restaurants</h2>
        
        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No restaurants available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
