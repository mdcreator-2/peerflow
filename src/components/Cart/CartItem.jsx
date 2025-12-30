import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatters';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-0">
      <Link to={`/product/${item.id}`} className="flex-shrink-0">
        <img
          src={item.image || 'https://via.placeholder.com/80'}
          alt={item.title}
          className="w-20 h-20 object-cover rounded-lg"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/product/${item.id}`} className="font-medium text-gray-900 hover: text-primary-600 line-clamp-1">
          {item.title}
        </Link>
        <p className="text-sm text-gray-500">{item.seller_name}</p>
        <p className="text-primary-600 font-semibold mt-1">{formatPrice(item. price)}</p>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => updateQuantity(item.id, item. quantity - 1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-50"
          >
            -
          </button>
          <span className="px-3 py-1 font-medium">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.maxQuantity}
            className="px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            +
          </button>
        </div>

        <button
          onClick={() => removeFromCart(item.id)}
          className="p-2 text-gray-400 hover: text-red-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-. 867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="text-right">
        <p className="font-bold text-gray-900">{formatPrice(item. price * item.quantity)}</p>
      </div>
    </div>
  );
};

export default CartItem;