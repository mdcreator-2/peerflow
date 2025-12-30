import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Auth Pages
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

// Main Pages
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import SkillBarter from './pages/SkillBarter';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Marketplace Components
import ProductDetail from './components/Marketplace/ProductDetail';
import CreateProduct from './components/Marketplace/CreateProduct';
import SellerDashboard from './components/Marketplace/SellerDashboard';

// Skill Barter Components
import SkillDetail from './components/SkillBarter/SkillDetail';
import PostSkill from './components/SkillBarter/PostSkill';
import BarterRequests from './components/SkillBarter/BarterRequests';

// Cart & Payment Components
import Cart from './components/Cart/Cart';
import Checkout from './components/Cart/Checkout';
import PaymentPage from './components/Payment/PaymentPage';
import PaymentResult from './components/Payment/PaymentResult';

// Profile Components
import EditProfile from './components/Profile/EditProfile';
import UserProfile from './components/Profile/UserProfile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme:  {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />

            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Marketplace Routes */}
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                
                {/* Skill Barter Routes */}
                <Route path="/skills" element={<SkillBarter />} />
                <Route path="/skill/:id" element={<SkillDetail />} />

                {/* Public User Profile */}
                <Route path="/user/: id" element={<UserProfile />} />

                {/* Protected Routes - Require Authentication */}
                <Route
                  path="/create-product"
                  element={
                    <ProtectedRoute>
                      <CreateProduct />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-products"
                  element={
                    <ProtectedRoute>
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/post-skill"
                  element={
                    <ProtectedRoute>
                      <PostSkill />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-skills"
                  element={
                    <ProtectedRoute>
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/barter-requests"
                  element={
                    <ProtectedRoute>
                      <BarterRequests />
                    </ProtectedRoute>
                  }
                />
                
                {/* Cart & Checkout */}
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment/result"
                  element={
                    <ProtectedRoute>
                      <PaymentResult />
                    </ProtectedRoute>
                  }
                />

                {/* Profile Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/edit"
                  element={
                    <ProtectedRoute>
                      <EditProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;