import React from 'react';
import ProductCard from './ProductCard';
import { SectionLoader } from '../Common/LoadingSpinner';

const ProductList = ({ products, loading, emptyMessage = 'No products found' }) => {
  if (loading) {
    return <SectionLoader />;
  }

  if (! products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900">{emptyMessage}</h3>
        <p className="mt-2 text-gray-500">Check back later or try a different search. </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;