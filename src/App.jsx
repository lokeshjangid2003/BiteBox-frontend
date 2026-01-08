import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantMenu from './pages/RestaurantMenu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import RestaurantLayout from './layouts/RestaurantLayout';
import RestaurantDashboard from './pages/restaurant/Dashboard';
import Menu from './pages/restaurant/Menu';
import RestaurantOrdersPage from './pages/restaurant/Orders';
import Notifications from './pages/restaurant/Notifications';
import RiderLayout from './layouts/RiderLayout';
import RiderDashboard from './pages/rider/Dashboard';
import RiderOrders from './pages/rider/Orders';
import RiderEarnings from './pages/rider/Earnings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is already logged in, redirect based on role
  if (user) {
    if (user.role === 'RESTAURANT') {
      return <Navigate to="/restaurant/dashboard" replace />;
    } else if (user.role === 'RIDER') {
      return <Navigate to="/rider/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
};

const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'RESTAURANT') {
      return <Navigate to="/restaurant/dashboard" replace />;
    } else if (user.role === 'RIDER') {
      return <Navigate to="/rider/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

const Layout = ({ children, showNavbar = true }) => {
  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes without navbar */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Layout showNavbar={false}>
                      <Login />
                    </Layout>
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Layout showNavbar={false}>
                      <Register />
                    </Layout>
                  </PublicRoute>
                }
              />

              {/* USER Role Routes */}
              <Route
                path="/"
                element={
                  <RoleBasedRoute allowedRoles={['USER']}>
                    <Layout showNavbar={true}>
                      <Home />
                    </Layout>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/restaurant/:id"
                element={
                  <RoleBasedRoute allowedRoles={['USER']}>
                    <Layout showNavbar={true}>
                      <RestaurantMenu />
                    </Layout>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <RoleBasedRoute allowedRoles={['USER']}>
                    <Layout showNavbar={true}>
                      <Cart />
                    </Layout>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <RoleBasedRoute allowedRoles={['USER']}>
                    <Layout showNavbar={true}>
                      <Orders />
                    </Layout>
                  </RoleBasedRoute>
                }
              />

              {/* RESTAURANT Role Routes */}
              <Route
                path="/restaurant/dashboard"
                element={
                  <RoleBasedRoute allowedRoles={['RESTAURANT']}>
                    <RestaurantLayout>
                      <RestaurantDashboard />
                    </RestaurantLayout>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/restaurant/orders"
                element={
                  <RoleBasedRoute allowedRoles={['RESTAURANT']}>
                    <RestaurantLayout>
                      <RestaurantOrdersPage />
                    </RestaurantLayout>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/restaurant/menu"
                element={
                  <RoleBasedRoute allowedRoles={['RESTAURANT']}>
                    <RestaurantLayout>
                      <Menu />
                    </RestaurantLayout>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/restaurant/notifications"
                element={
                  <RoleBasedRoute allowedRoles={['RESTAURANT']}>
                    <RestaurantLayout>
                      <Notifications />
                    </RestaurantLayout>
                  </RoleBasedRoute>
                }
              />

              {/* RIDER Role Routes */}
              <Route
                path="/rider/dashboard"
                element={
                  <RoleBasedRoute allowedRoles={['RIDER']}>
                    <RiderLayout>
                      <RiderDashboard />
                    </RiderLayout>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/rider/orders"
                element={
                  <RoleBasedRoute allowedRoles={['RIDER']}>
                    <RiderLayout>
                      <RiderOrders />
                    </RiderLayout>
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/rider/earnings"
                element={
                  <RoleBasedRoute allowedRoles={['RIDER']}>
                    <RiderLayout>
                      <RiderEarnings />
                    </RiderLayout>
                  </RoleBasedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
