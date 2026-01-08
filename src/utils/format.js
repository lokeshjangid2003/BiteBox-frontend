export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(price);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  // Show relative time for recent items
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

export const getStatusColor = (status) => {
  const statusColors = {
    PLACED: 'bg-orange-500',
    ACCEPTED_BY_RESTAURANT: 'bg-blue-500',
    REJECTED_BY_RESTAURANT: 'bg-red-500',
    PREPARING: 'bg-yellow-500',
    READY: 'bg-green-500',
    PICKED_BY_RIDER: 'bg-purple-500',
    DELIVERED: 'bg-green-600',
  };
  return statusColors[status] || 'bg-gray-500';
};

export const getStatusText = (status) => {
  const statusTexts = {
    PLACED: 'Placed',
    ACCEPTED_BY_RESTAURANT: 'Accepted',
    REJECTED_BY_RESTAURANT: 'Rejected',
    PREPARING: 'Preparing',
    READY: 'Ready',
    PICKED_BY_RIDER: 'Out for Delivery',
    DELIVERED: 'Delivered',
  };
  return statusTexts[status] || status;
};
