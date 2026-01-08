import { useAuth } from '../context/AuthContext';
import { restaurantAPI } from '../services/api';
import { useState, useEffect, useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const RestaurantHeader = () => {
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'RESTAURANT') {
      fetchRestaurants();
    }
  }, [user]);

  // Listen for restaurant creation/update events
  useEffect(() => {
    const handleRestaurantUpdate = () => {
      fetchRestaurants();
    };

    window.addEventListener('restaurant:created', handleRestaurantUpdate);
    window.addEventListener('restaurant:updated', handleRestaurantUpdate);

    return () => {
      window.removeEventListener('restaurant:created', handleRestaurantUpdate);
      window.removeEventListener('restaurant:updated', handleRestaurantUpdate);
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      // Filter restaurants owned by current user
      const userRestaurants = response.data.filter(
        (r) => r.ownerId === user.id || r.owner?.id === user.id
      );
      setRestaurants(userRestaurants);
      if (userRestaurants.length > 0) {
        setSelectedRestaurant(userRestaurants[0]);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">B</span>
        </div>
        <span className="text-lg font-bold text-gray-900">BiteBox</span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Restaurant Selector */}
        {restaurants.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="text-sm">🍕</span>
              <span className="font-medium text-gray-900">
                {selectedRestaurant?.name || 'Select Restaurant'}
              </span>
              <FiChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  {restaurants.map((restaurant) => (
                    <button
                      key={restaurant.id}
                      onClick={() => {
                        setSelectedRestaurant(restaurant);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                        selectedRestaurant?.id === restaurant.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-900'
                      }`}
                    >
                      {restaurant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-primary transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantHeader;
