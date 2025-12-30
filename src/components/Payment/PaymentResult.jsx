import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, orderId, transactionId, amount, method, message } = location. state || {};

  useEffect(() => {
    if (! orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Status Header */}
          <div className={`px-6 py-12 text-center ${success ?  'bg-green-500' : 'bg-red-500'}`}>
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${success ? 'bg-green-400' : 'bg-red-400'}`}>
              {success ? (
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mt-4">
              {success ? 'Payment Successful!' : 'Payment Failed'}
            </h1>
            <p className="text-white/80 mt-2">{message}</p>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="space-y-4">
              {success && (
                <>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="font-bold text-gray-900">{formatPrice(amount)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-medium text-gray-900">#{orderId.slice(-8)}</span>
                  </div>
                  {transactionId && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-medium text-gray-900 text-sm">{transactionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="font-medium text-gray-900 capitalize">{method}</span>
                  </div>
                </>
              )}

              {success && method === 'cash' && (
                <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Please keep {formatPrice(amount)} ready for payment when you receive your order. 
                  </p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-800">
                    ✉️ Order confirmation has been sent to your email.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              {success ?  (
                <>
                  <Link to="/orders" className="block w-full btn-primary text-center">
                    View My Orders
                  </Link>
                  <Link to="/marketplace" className="block w-full btn-secondary text-center">
                    Continue Shopping
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full btn-primary"
                  >
                    Try Again
                  </button>
                  <Link to="/cart" className="block w-full btn-secondary text-center">
                    Back to Cart
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Support */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Having issues? {' '}
          <a href="#" className="text-primary-600 hover: text-primary-700">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentResult;