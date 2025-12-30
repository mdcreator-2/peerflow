import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerProducts, deleteProduct } from '../../services/productService';
import { getSellerOrders } from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice, formatDate } from '../../utils/formatters';
import { ORDER_STATUSES } from '../../utils/constants';
import { SectionLoader } from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [productsData, ordersData] = await Promise.all([
        getSellerProducts(currentUser.uid),
        getSellerOrders(currentUser.uid),
      ]);
      setProducts(productsData);
      setOrders(ordersData);
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

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p. availability?. is_available).length,
    soldProducts: products.filter(p => ! p.availability?.is_available).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length,
    totalSales: userProfile?.seller_stats?.total_sales || 0,
  };

  if (loading) {
    return <SectionLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <Link to="/create-product" className="btn-primary">
            + List New Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Sold</p>
            <p className="text-2xl font-bold text-blue-600">{stats. soldProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold text-primary-600">{formatPrice(stats.totalSales)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'products'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'orders'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover: text-gray-700'
                }`}
              >
                Orders ({orders.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                {products.length === 0 ?  (
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
                      <div key={product. id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.images?.[0]?.url || 'https://via.placeholder.com/60'}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{product. title}</h4>
                            <p className="text-sm text-gray-500">
                              {formatPrice(product.price)} • Qty: {product.quantity}
                            </p>
                            <span className={`text-xs ${product.availability?.is_available ? 'text-green-600' : 'text-red-600'}`}>
                              {product.availability?. is_available ? '● Active' : '● Sold'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="p-2 text-gray-500 hover:text-primary-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <Link
                            to={`/edit-product/${product. id}`}
                            className="p-2 text-gray-500 hover: text-blue-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-gray-500 hover: text-red-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-. 867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                {orders.length === 0 ?  (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                    <p className="text-gray-500 mt-1">Orders will appear here when someone buys your products.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => {
                      const status = ORDER_STATUSES[order.status] || ORDER_STATUSES. pending;
                      return (
                        <div key={order.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm text-gray-500">Order #{order. id. slice(-8)}</p>
                              <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                            </div>
                            <span className={`badge badge-${status. color}`}>
                              {status.icon} {status.name}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {order.products.map((product, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{product.product_name} × {product.quantity}</span>
                                <span className="font-medium">{formatPrice(product. total)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                            <span className="text-sm text-gray-500">Buyer:  {order.buyer_name}</span>
                            <span className="font-bold">{formatPrice(order.order_summary.total_amount)}</span>
                          </div>
                        </div>
                      );
                    })}
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