import { useState, useEffect } from 'react';
import RiderSidebar from '../components/RiderSidebar';
import RiderHeader from '../components/RiderHeader';
import DeliveryNotificationPopup from '../components/DeliveryNotificationPopup';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

const RiderLayout = ({ children }) => {
  const { user } = useAuth();
  const [newOrder, setNewOrder] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (user?.role === 'RIDER') {
      const socket = getSocket();
      
      if (socket) {
        // Listen for new orders that are ready for pickup
        const handleOrderUpdate = (order) => {
          // Check if this is a new order ready for pickup (READY status, no rider assigned)
          if (
            order.status === 'READY' &&
            !order.riderId
          ) {
            // Only show if we don't already have this order showing
            setNewOrder((prevOrder) => {
              if (!prevOrder || prevOrder.id !== order.id) {
                setShowNotification(true);
                return order;
              }
              return prevOrder;
            });
          }
        };

        socket.on('order:update', handleOrderUpdate);

        return () => {
          socket.off('order:update', handleOrderUpdate);
        };
      }
    }
  }, [user]);

  const handleCloseNotification = () => {
    setShowNotification(false);
    setNewOrder(null);
  };

  const handleAcceptOrder = () => {
    // Order will be assigned via the popup component
    setShowNotification(false);
    setNewOrder(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <RiderSidebar />
      <div className="flex-1 ml-64">
        <RiderHeader />
        <main className="bg-gray-50 min-h-screen">{children}</main>
      </div>
      
      {/* Delivery Notification Popup */}
      {showNotification && newOrder && (
        <DeliveryNotificationPopup
          order={newOrder}
          onClose={handleCloseNotification}
          onAccept={handleAcceptOrder}
        />
      )}
    </div>
  );
};

export default RiderLayout;
