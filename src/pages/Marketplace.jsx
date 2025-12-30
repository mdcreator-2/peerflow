import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts, getProductsByCategory, searchProducts } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import ProductList from '../components/Marketplace/ProductList';
import SearchBar from '../components/Common/SearchBar';
import { PRODUCT_CATEGORIES } from '../utils/constants';

const Marketplace = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let result;
      if (selectedCategory) {
        result = await getProductsByCategory(selectedCategory);
      } else {
        result = await getProducts();
      }
      setProducts(result. products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (! query.trim()) {
      fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const results = await searchProducts(query);
      setProducts(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    if (categoryId) {
      setSearchParams({ category:  categoryId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg: px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-500 mt-1">Find great deals from fellow students</p>
            </div>
            {isAuthenticated && (
              <Link to="/create-product" className="btn-primary inline-flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Sell Something
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="mt-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search products..."
              className="max-w-xl"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    ! selectedCategory
                      ? 'bg-primary-50 text-primary-700'
                      :  'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Products
                </button>
                {PRODUCT_CATEGORIES.map(category => (
                  <button
                    key={category. id}
                    onClick={() => handleCategoryChange(category. id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{category. icon}</span>
                    {category. name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters */}
            {(selectedCategory || searchQuery) && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-gray-500">Filters:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                    {PRODUCT_CATEGORIES. find(c => c.id === selectedCategory)?.name}
                    <button
                      onClick={() => handleCategoryChange('')}
                      className="ml-2 hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                    "{searchQuery}"
                    <button
                      onClick={() => handleSearch('')}
                      className="ml-2 hover:text-gray-900"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>

            {/* Product Grid */}
            <ProductList
              products={products}
              loading={loading}
              emptyMessage={
                searchQuery
                  ? `No products found for "${searchQuery}"`
                  : selectedCategory
                  ?  `No products in ${PRODUCT_CATEGORIES. find(c => c.id === selectedCategory)?.name}`
                  : 'No products available'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;