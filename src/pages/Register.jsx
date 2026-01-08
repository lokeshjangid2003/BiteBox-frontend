import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'USER', // Default role
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await register(formData);

    if (result.success) {
      toast.success('Registration successful! Please login to continue.');
      // Clear all user data and cart data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Clear all cart-related localStorage items
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cart_') || key.startsWith('restaurantId_')) {
          localStorage.removeItem(key);
        }
      });
      // Also clear legacy keys
      localStorage.removeItem('cart');
      localStorage.removeItem('restaurantId');
      navigate('/login', { replace: true });
    } else {
      toast.error(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-4">
        {/* Logo */}
        <div className="flex items-center justify-center mb-2">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <span className="text-2xl font-bold text-gray-900 ml-2">BiteBox</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Create your account</h2>
        <p className="text-center text-gray-600 text-sm mb-4">Join BiteBox and start your journey</p>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a...
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* User Role */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'USER' })}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.role === 'USER'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    formData.role === 'USER'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FiUser className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-xs text-gray-900 mb-0.5">Customer</h3>
                <p className="text-xs text-gray-600 leading-tight">Order food</p>
              </div>
            </button>

            {/* Restaurant Role */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'RESTAURANT' })}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.role === 'RESTAURANT'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    formData.role === 'RESTAURANT'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FiShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-xs text-gray-900 mb-0.5">Restaurant</h3>
                <p className="text-xs text-gray-600 leading-tight">Manage</p>
              </div>
            </button>

            {/* Rider Role */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'RIDER' })}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.role === 'RIDER'
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                    formData.role === 'RIDER'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <FiTruck className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-xs text-gray-900 mb-0.5">Rider</h3>
                <p className="text-xs text-gray-600 leading-tight">Deliver</p>
              </div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="input-field pl-8 py-2 text-sm"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="input-field pl-8 py-2 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min 6 characters)"
                className="input-field pl-8 py-2 text-sm"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="relative">
                <FiPhone className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="input-field pl-8 py-2 text-sm"
                  required
                  minLength={10}
                  maxLength={15}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="input-field pl-8 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 text-base mt-2"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
