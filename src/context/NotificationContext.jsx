import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getSocket, subscribeToOrder } from '../services/socket';
import { orderAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  useEffect(() => {
    if (user?.role === 'RESTAURANT') {
      const socket = getSocket();
      
      if (socket) {
        // Listen for order updates
        socket.on('order:update', (order) => {
          // If it's a new order (PLACED status), show notification
          if (order.status === 'PLACED') {
            // Check if order belongs to user's restaurants
            // This will be handled by checking restaurant ownership
            setNewOrderNotification(order);
            setShowNotificationPopup(true);
          }
        });

        return () => {
          socket.off('order:update');
        };
      }
    }
  }, [user]);

  const handleCloseNotification = () => {
    setShowNotificationPopup(false);
    setNewOrderNotification(null);
  };

  const handleAcceptOrder = () => {
    // Refresh orders list or update state
    setShowNotificationPopup(false);
    setNewOrderNotification(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        newOrderNotification,
        showNotificationPopup,
        handleCloseNotification,
        handleAcceptOrder,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
