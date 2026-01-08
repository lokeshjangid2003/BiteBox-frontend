import { useState, useEffect } from 'react';
import RestaurantSidebar from '../components/RestaurantSidebar';
import RestaurantHeader from '../components/RestaurantHeader';
import OrderNotificationPopup from '../components/OrderNotificationPopup';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { restaurantAPI } from '../services/api';

const RestaurantLayout = ({ children }) => {
  const { user } = useAuth();
  const [newOrder, setNewOrder] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [userRestaurants, setUserRestaurants] = useState([]);

  useEffect(() => {
    if (user?.role === 'RESTAURANT') {
      fetchUserRestaurants();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'RESTAURANT' && userRestaurants.length > 0) {
      const socket = getSocket();
      
      if (socket) {
        // Listen for new orders
        const handleOrderUpdate = (order) => {
          // Check if this is a new order (PLACED status) for one of user's restaurants
          const restaurantIds = userRestaurants.map(r => r.id);
          if (
            order.status === 'PLACED' &&
            order.restaurantId &&
            restaurantIds.includes(order.restaurantId)
          ) {
            // Only show if we don't already have this order showing
            if (!newOrder || newOrder.id !== order.id) {
              setNewOrder(order);
              setShowNotification(true);
            }
          }
        };

        socket.on('order:update', handleOrderUpdate);

        return () => {
          socket.off('order:update', handleOrderUpdate);
        };
      }
    }
  }, [user, userRestaurants, newOrder]);

  const fetchUserRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      const restaurants = response.data.filter(
        (r) => r.ownerId === user.id || r.owner?.id === user.id
      );
      setUserRestaurants(restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNewOrder(null);
  };

  const handleAcceptOrder = () => {
    // Order will be updated via the popup component
    // Just refresh the view
    setShowNotification(false);
    setNewOrder(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RestaurantSidebar />
      <div className="flex-1 ml-64">
        <RestaurantHeader />
        <main className="bg-gray-50 min-h-screen">{children}</main>
      </div>
      
      {/* Notification Popup */}
      {showNotification && newOrder && (
        <OrderNotificationPopup
          order={newOrder}
          onClose={handleCloseNotification}
          onAccept={handleAcceptOrder}
        />
      )}
    </div>
  );
};

export default RestaurantLayout;
