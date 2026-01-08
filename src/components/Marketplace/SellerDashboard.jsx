import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerProducts, deleteProduct } from '../../services/productService';
import { getSellerOrders, sellerConfirmHandover, calculateSellerRevenue, calculatePendingRevenue } from '../../services/orderService';
import { getUserSkills } from '../../services/skillService';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUSES } from '../../utils/constants';
import { SectionLoader } from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [products, setProducts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [productsData, ordersData, skillsData] = await Promise.all([
        getSellerProducts(currentUser.uid),
        getSellerOrders(currentUser.uid),
        getUserSkills(currentUser.uid).catch(() => []),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
      setSkills(skillsData);
    } catch (error) {
      console. error('Error fetching seller data:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (! confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(productId, currentUser.uid);
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Handle seller confirming handover
  const handleConfirmHandover = async (orderId) => {
    setConfirmingOrderId(orderId);
    try {
      await sellerConfirmHandover(orderId, currentUser.uid);
      toast.success('Item marked as handed over!  Waiting for buyer to confirm receipt.');
      // Refresh orders
      const updatedOrders = await getSellerOrders(currentUser.uid);
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Error confirming handover:', error);
      toast.error(error.message || 'Failed to confirm handover');
    } finally {
      setConfirmingOrderId(null);
    }
  };

  // Calculate revenue directly from orders
  const calculatedRevenue = calculateSellerRevenue(orders, currentUser. uid);
  const pendingRevenue = calculatePendingRevenue(orders, currentUser.uid);

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p. availability?. is_available).length,
    soldProducts: products.filter(p => ! p.availability?.is_available).length,
    totalSkills: skills.length,
    totalOrders: orders. length,
    pendingOrders: orders.filter(o => 
      o.status === 'waiting_for_meetup' || o.status === 'seller_confirmed'
    ).length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    // Use calculated revenue instead of userProfile stats
    totalSales: calculatedRevenue,
    pendingSales: pendingRevenue,
    itemsSold: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => {
        const sellerProducts = o.products.filter(p => p.seller_id === currentUser.uid);
        return sum + sellerProducts. reduce((s, p) => s + p.quantity, 0);
      }, 0),
  };

  if (loading) {
    return <SectionLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg: px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
              <p className="text-primary-100">Manage your products, skills, and track your sales</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Link 
                to="/create-product" 
                className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                + List Product
              </Link>
              <Link 
                to="/post-skill" 
                className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover: bg-primary-400 transition-colors border border-primary-400"
              >
                + Post Skill
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-primary-500">
            <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-primary-600">{formatPrice(stats.totalSales)}</p>
            {stats.pendingSales > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                + {formatPrice(stats.pendingSales)} pending
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
            <p className="text-sm text-gray-500 mb-1">Items Sold</p>
            <p className="text-2xl font-bold text-green-600">{stats.itemsSold}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 mb-1">Active Listings</p>
            <p className="text-2xl font-bold text-blue-600">{stats. activeProducts}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500 mb-1">Pending Meetups</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 mb-1">Skills Posted</p>
            <p className="text-2xl font-bold text-purple-600">{stats. totalSkills}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'products', label: 'My Products', icon: '📦', count: products.length },
                { id:  'orders', label: 'Orders Received', icon: '📋', count: orders.length },
                { id: 'skills', label: 'My Skills', icon: '🎯', count: skills. length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 bg-primary-50'
                      :  'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-primary-200 text-primary-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-sm text-primary-600 hover: text-primary-700"
                    >
                      View All →
                    </button>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No orders yet</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map(order => {
                        const status = ORDER_STATUSES[order.status] || ORDER_STATUSES. pending;
                        return (
                          <div key={order.id} className="bg-white p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">#{order.id. slice(-6)}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                order.status === 'seller_confirmed' ? 'bg-orange-100 text-orange-700' : 
                                order.status === 'waiting_for_meetup' ? 'bg-purple-100 text-purple-700' : 
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {status. name}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{formatPrice(order.order_summary?. total_amount)}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Active Products */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Active Products</h3>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="text-sm text-primary-600 hover: text-primary-700"
                    >
                      View All →
                    </button>
                  </div>
                  {products.filter(p => p. availability?.is_available).length === 0 ? (
                    <p className="text-gray-500 text-sm">No active products</p>
                  ) : (
                    <div className="space-y-3">
                      {products.filter(p => p. availability?.is_available).slice(0, 3).map(product => (
                        <div key={product.id} className="bg-white p-3 rounded-lg flex items-center gap-3">
                          <img
                            src={product.images?.[0]?.url || 'https://via.placeholder.com/40'}
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product. title}</p>
                            <p className="text-xs text-gray-500">{formatPrice(product.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
                    <p className="text-gray-500 mt-1">Start selling by listing your first product. </p>
                    <Link to="/create-product" className="btn-primary mt-4 inline-block">
                      List Product
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.images?.[0]?.url || 'https://via.placeholder.com/60'}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{product.title}</h4>
                            <p className="text-sm text-gray-500">
                              {formatPrice(product.price)} • Qty: {product.quantity}
                            </p>
                            <span className={`inline-flex items-center text-xs mt-1 ${product.availability?.is_available ? 'text-green-600' : 'text-red-600'}`}>
                              <span className={`w-2 h-2 rounded-full mr-1 ${product.availability?. is_available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              {product.availability?.is_available ? 'Active' : 'Sold Out'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                            title="View"
                          >
                            👁️
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product. id)}
                            className="p-2 text-gray-500 hover: text-red-600 hover: bg-white rounded-lg transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                {orders. length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900">No orders received yet</h3>
                    <p className="text-gray-500 mt-1">Orders from buyers will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
                      const canConfirmHandover = order.status === 'waiting_for_meetup';
                      const isConfirming = confirmingOrderId === order.id;
                      
                      return (
                        <div key={order.id} className="p-5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-gray-900">Order #{order.id. slice(-8)}</p>
                              <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-700' :
                              order.status === 'seller_confirmed' ? 'bg-orange-100 text-orange-700' :
                              order.status === 'waiting_for_meetup' ? 'bg-purple-100 text-purple-700' : 
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {status.icon} {status.name}
                            </span>
                          </div>
                          
                          {/* Products in order */}
                          <div className="space-y-2 mb-3">
                            {order.products.map((product, idx) => (
                              <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded">
                                <span>{product.product_name} × {product.quantity}</span>
                                <span className="font-medium">{formatPrice(product.total)}</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Meetup Info */}
                          {order.meetup && (
                            <div className="bg-white p-3 rounded-lg mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">📍 Meetup Location</p>
                              <p className="text-sm text-gray-600">
                                {order.meetup.location || order.meetup.hostel || 'Not specified'}
                                {order.meetup.room && `, Room ${order.meetup. room}`}
                              </p>
                              {order.meetup. phone && (
                                <p className="text-sm text-gray-600">📞 {order. meetup.phone}</p>
                              )}
                            </div>
                          )}
                          
                          {/* Delivery PIN (only show to seller for verification reference) */}
                          {order.handshake?. delivery_pin && order.status !== 'completed' && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-200">
                              <p className="text-sm font-medium text-blue-700">🔐 Delivery PIN</p>
                              <p className="text-xs text-blue-600">
                                Ask buyer for this PIN to verify identity:  
                                <span className="font-mono font-bold ml-2">{order.handshake. delivery_pin}</span>
                              </p>
                            </div>
                          )}
                          
                          <div className="pt-3 border-t border-gray-200 flex flex-wrap justify-between gap-2">
                            <div className="text-sm">
                              <span className="text-gray-500">Buyer:  </span>
                              <span className="font-medium">{order.buyer_name}</span>
                            </div>
                            <div className="text-lg font-bold text-primary-600">
                              {formatPrice(order.order_summary?.total_amount)}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          {canConfirmHandover && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <button
                                onClick={() => handleConfirmHandover(order.id)}
                                disabled={isConfirming}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                                  isConfirming
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                {isConfirming ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Confirming...
                                  </span>
                                ) : (
                                  '🤝 Mark as Handed Over'
                                )}
                              </button>
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                Click this after you've given the item to the buyer
                              </p>
                            </div>
                          )}
                          
                          {order.status === 'seller_confirmed' && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="bg-orange-50 p-3 rounded-lg text-center">
                                <p className="text-sm font-medium text-orange-700">⏳ Waiting for Buyer Confirmation</p>
                                <p className="text-xs text-orange-600 mt-1">
                                  The buyer needs to confirm they received the item
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {order.status === 'completed' && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="bg-green-50 p-3 rounded-lg text-center">
                                <p className="text-sm font-medium text-green-700">✅ Transaction Complete</p>
                                <p className="text-xs text-green-600 mt-1">
                                  This order has been successfully completed
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div>
                {skills.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🎯</div>
                    <h3 className="text-lg font-medium text-gray-900">No skills posted yet</h3>
                    <p className="text-gray-500 mt-1">Share your skills and find people to barter with. </p>
                    <Link to="/post-skill" className="btn-primary mt-4 inline-block">
                      Post a Skill
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {skills.map(skill => (
                      <div key={skill.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{skill.title}</h4>
                            <p className="text-sm text-gray-500">{skill.category}</p>
                          </div>
                          <Link
                            to={`/skill/${skill.id}`}
                            className="text-primary-600 hover: text-primary-700 text-sm font-medium"
                          >
                            View →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;