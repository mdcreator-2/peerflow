import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice, formatRelativeTime, truncateText } from '../../utils/formatters';
import { PRODUCT_CONDITIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();

  const condition = PRODUCT_CONDITIONS.find(c => c. id === product.condition);
  const mainImage = product.images?.[0]?.url || 'https://via.placeholder.com/300x200? text=No+Image';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInCart(product.id)) {
      toast.error('Already in cart!');
      return;
    }
    
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: mainImage,
      seller_id: product.seller_id,
      seller_name: product. seller_name,
      maxQuantity: product.quantity,
      delivery_fee: product.delivery_options?.delivery_fee || 0,
    });
    
    toast.success('Added to cart! ');
  };

  return (
    <Link to={`/product/${product.id}`} className="card group">
      <div className="relative overflow-hidden">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {condition && (
          <span className="absolute top-2 left-2 badge badge-primary">
            {condition. name}
          </span>
        )}
        {! product.availability?. is_available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">SOLD</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
          {product.title}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {truncateText(product. description, 80)}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(product.price)}
          </span>
          {product.availability?.is_available && (
            <button
              onClick={handleAddToCart}
              disabled={isInCart(product.id)}
              className={`p-2 rounded-lg transition-colors ${
                isInCart(product.id)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              }`}
            >
              {isInCart(product.id) ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-. 184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )}
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
              {product.seller_name?. charAt(0) || '? '}
            </div>
            <span className="truncate max-w-[100px]">{product.seller_name}</span>
          </div>
          <span>{formatRelativeTime(product.availability?.created_at)}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;