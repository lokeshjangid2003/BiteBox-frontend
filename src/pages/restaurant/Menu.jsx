import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { restaurantAPI, foodItemAPI } from '../../services/api';
import { formatPrice } from '../../utils/format';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Menu = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    isAvailable: true,
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchFoodItems();
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      const userRestaurants = response.data.filter(
        (r) => r.ownerId === user.id || r.owner?.id === user.id
      );
      setRestaurants(userRestaurants);
      if (userRestaurants.length > 0) {
        // Always set the first restaurant as selected
        setSelectedRestaurant(userRestaurants[0]);
      }
    } catch (error) {
      toast.error('Failed to load restaurants');
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodItems = async () => {
    if (!selectedRestaurant) return;
    try {
      const response = await restaurantAPI.getFoodItems(selectedRestaurant.id);
      setFoodItems(response.data || []);
    } catch (error) {
      toast.error('Failed to load menu items');
      console.error('Error fetching food items:', error);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        imageUrl: item.imageUrl || '',
        isAvailable: item.isAvailable,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        isAvailable: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      isAvailable: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) {
      toast.error('Please select a restaurant');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        await foodItemAPI.update(editingItem.id, formData);
        toast.success('Menu item updated successfully!');
      } else {
        // Create new item
        await foodItemAPI.create(selectedRestaurant.id, formData);
        toast.success('Menu item added successfully!');
      }
      handleCloseModal();
      fetchFoodItems();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save menu item';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await foodItemAPI.delete(itemId);
      toast.success('Menu item deleted successfully!');
      fetchFoodItems();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete menu item';
      toast.error(errorMessage);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await foodItemAPI.update(item.id, {
        isAvailable: !item.isAvailable,
      });
      toast.success(`Item ${!item.isAvailable ? 'enabled' : 'disabled'} successfully!`);
      fetchFoodItems();
    } catch (error) {
      toast.error('Failed to update item availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Menu</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-4">You don't have any restaurants yet.</p>
          <p className="text-sm text-gray-500">Create a restaurant first to add menu items.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
          <p className="text-gray-600 mt-2">Manage your menu items</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Restaurant Selector */}
          {restaurants.length > 1 && (
            <select
              value={selectedRestaurant?.id || ''}
              onChange={(e) => {
                const restaurant = restaurants.find((r) => r.id === e.target.value);
                setSelectedRestaurant(restaurant);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          )}
          {restaurants.length === 1 && selectedRestaurant && (
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
              {selectedRestaurant.name}
            </div>
          )}
          {/* Add Menu Item Button - Always Visible */}
          <button
            onClick={() => {
              if (!selectedRestaurant) {
                if (restaurants.length === 0) {
                  toast.error('Please create a restaurant first');
                } else {
                  toast.error('Please select a restaurant first');
                }
                return;
              }
              handleOpenModal();
            }}
            style={{ backgroundColor: '#ff4d4f' }}
            className="text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-200 flex items-center justify-center space-x-2 whitespace-nowrap shadow-lg min-w-[160px]"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Menu Items Grid */}
      {foodItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mb-6">
            <FiPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">No menu items yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Add your first menu item to get started
            </p>
          </div>
          <button 
            onClick={() => {
              if (!selectedRestaurant) {
                toast.error('Please select a restaurant first');
                return;
              }
              handleOpenModal();
            }} 
            style={{ backgroundColor: '#ff4d4f' }}
            className="text-white px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity duration-200 inline-flex items-center space-x-2 shadow-lg text-lg"
          >
            <FiPlus className="w-6 h-6" />
            <span>Add Your First Menu Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
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
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                {item.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">{formatPrice(item.price)}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.isAvailable
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {item.isAvailable ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                  Available
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
