import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { updatePaymentStatus } from '../../services/orderService';
import { processPayment, processUPIPayment, processCardPayment, processCashPayment } from '../../services/paymentService';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const { orderId, amount, paymentMethod } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  useEffect(() => {
    if (! orderId || !amount) {
      navigate('/cart');
    }
  }, [orderId, amount, navigate]);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ... prev, [name]:  value }));
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      let result;

      switch (paymentMethod) {
        case 'upi':
          if (!upiId. trim()) {
            toast.error('Please enter UPI ID');
            setLoading(false);
            return;
          }
          result = await processUPIPayment(upiId, amount);
          break;

        case 'card':
          if (! cardDetails.number || !cardDetails.cvv) {
            toast. error('Please fill all card details');
            setLoading(false);
            return;
          }
          result = await processCardPayment(cardDetails, amount);
          break;

        case 'cash':
        default:
          result = await processCashPayment(amount);
          break;
      }

      // Update order payment status
      await updatePaymentStatus(orderId, {
        status: result.pending ? 'pending' : 'completed',
        transaction_id: result. transaction_id,
      });

      // Clear cart
      clearCart();

      // Navigate to result page
      navigate('/payment/result', {
        state: {
          success: true,
          orderId,
          transactionId: result. transaction_id,
          amount,
          method: paymentMethod,
          message: result.message,
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      navigate('/payment/result', {
        state: {
          success: false,
          orderId,
          amount,
          method:  paymentMethod,
          message: error.message || 'Payment failed. Please try again.',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (! orderId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg: px-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8 text-white text-center">
            <p className="text-primary-100 text-sm mb-1">Amount to Pay</p>
            <p className="text-4xl font-bold">{formatPrice(amount)}</p>
            <p className="text-primary-100 text-sm mt-2">Order #{orderId. slice(-8)}</p>
          </div>

          <div className="p-6">
            {/* UPI Payment */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Enter UPI ID</h3>
                <div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e. target.value)}
                    placeholder="yourname@upi"
                    className="input-field text-center text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    e.g., yourname@paytm, yourname@gpay
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">Or scan QR code</p>
                  <div className="w-40 h-40 mx-auto bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h. 01M12 12h4. 01M16 20h4M4 12h4m12 0h. 01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <p className="text-xs">QR Code</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card Payment */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    name="number"
                    value={cardDetails.number}
                    onChange={handleCardChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    name="name"
                    value={cardDetails.name}
                    onChange={handleCardChange}
                    placeholder="JOHN DOE"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input
                      type="text"
                      name="expiry"
                      value={cardDetails. expiry}
                      onChange={handleCardChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                      placeholder="•••"
                      maxLength="4"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Your payment info is secure and encrypted</span>
                </div>
              </div>
            )}

            {/* Cash Payment */}
            {paymentMethod === 'cash' && (
              <div className="text-center py-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">💵</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash on Pickup/Delivery</h3>
                <p className="text-gray-600 text-sm">
                  Pay {formatPrice(amount)} when you receive your order. 
                </p>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Please keep exact change ready for faster transaction.
                  </p>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full btn-primary mt-6 py-3 text-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : paymentMethod === 'cash' ? (
                'Confirm Order'
              ) : (
                `Pay ${formatPrice(amount)}`
              )}
            </button>

            <button
              onClick={() => navigate('/cart')}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
            >
              Cancel and return to cart
            </button>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-. 682. 057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure payment powered by CircleShare</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;