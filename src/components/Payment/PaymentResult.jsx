import React, { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";

const PaymentResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    success,
    orderId,
    transactionId,
    amount,
    method,
    message,
    deliveryPin,
    isCashOrder,
    canRetry,
  } = location.state || {};

  useEffect(() => {
    if (!orderId) {
      navigate("/");
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  // Dynamic content based on payment method
  const isCash = method === "cash" || isCashOrder;
  const title = success
    ? isCash
      ? "Order Placed Successfully!"
      : "Payment Successful!"
    : "Payment Failed";

  const subtitle = success
    ? isCash
      ? "Please prepare cash for the meetup"
      : "Your payment has been processed successfully"
    : message || "Something went wrong with your payment";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Status Header */}
          <div
            className={`px-6 py-12 text-center ${
              success
                ? isCash
                  ? "bg-gradient-to-r from-purple-500 to-purple-600"
                  : "bg-gradient-to-r from-green-500 to-green-600"
                : "bg-gradient-to-r from-red-500 to-red-600"
            }`}
          >
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                success
                  ? isCash
                    ? "bg-purple-400"
                    : "bg-green-400"
                  : "bg-red-400"
              }`}
            >
              {success ? (
                isCash ? (
                  // Checkmark icon for cash orders
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  // Wallet icon for online payments
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                )
              ) : (
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mt-4">{title}</h1>
            <p className="text-white/80 mt-2">{subtitle}</p>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="space-y-4">
              {success && (
                <>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">
                      {isCash ? "Amount to Pay" : "Amount Paid"}
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatPrice(amount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-medium text-gray-900">
                      #{orderId.slice(-8)}
                    </span>
                  </div>
                  {transactionId && !isCash && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {transactionId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {isCash
                        ? "💵 Cash on Meetup"
                        : `${
                            method === "upi" ? "📱" : "💳"
                          } ${method?.toUpperCase()}`}
                    </span>
                  </div>
                </>
              )}

              {/* Failed payment details */}
              {!success && (
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-medium text-gray-900">
                    #{orderId.slice(-8)}
                  </span>
                </div>
              )}

              {/* Cash Order Notice */}
              {success && isCash && (
                <div className="bg-yellow-50 rounded-lg p-4 mt-4 border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-800">
                    💵 Cash Payment Required
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please keep <strong>{formatPrice(amount)}</strong> ready for
                    payment when you meet the seller.
                  </p>
                </div>
              )}

              {/* Delivery PIN for verification */}
              {success && deliveryPin && (
                <div className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-800">
                    🔐 Your Delivery PIN
                  </p>
                  <p className="text-2xl font-mono font-bold text-blue-700 mt-2 text-center">
                    {deliveryPin}
                  </p>
                  <p className="text-xs text-blue-600 mt-2 text-center">
                    Share this PIN with the seller to verify your identity
                    during meetup
                  </p>
                </div>
              )}

              {/* Online Payment Success Notice */}
              {success && !isCash && (
                <div className="bg-green-50 rounded-lg p-4 mt-4 border border-green-200">
                  <p className="text-sm text-green-800">
                    ✉️ Order confirmation has been sent to your email.
                  </p>
                </div>
              )}

              {/* Next Steps */}
              {success && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    📋 What's Next?
                  </p>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Contact the seller to arrange a meetup on campus</li>
                    <li>Meet the seller and collect your item</li>
                    {isCash && (
                      <li>Pay the seller {formatPrice(amount)} in cash</li>
                    )}
                    <li>
                      Confirm receipt in your orders to complete the transaction
                    </li>
                  </ol>
                </div>
              )}

              {/* Failed payment - retry info */}
              {!success && (
                <div className="bg-orange-50 rounded-lg p-4 mt-4 border border-orange-200">
                  <p className="text-sm font-medium text-orange-800">
                    💳 Don't worry!
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Your order has been saved. You can retry the payment anytime
                    from your orders page.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              {success ? (
                <>
                  <Link
                    to="/my-orders"
                    className="block w-full btn-primary text-center py-3"
                  >
                    View My Orders
                  </Link>
                  <Link
                    to="/marketplace"
                    className="block w-full btn-secondary text-center py-3"
                  >
                    Continue Shopping
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/my-orders"
                    className="block w-full btn-primary text-center py-3"
                  >
                    Go to My Orders to Retry Payment
                  </Link>
                  <Link
                    to="/marketplace"
                    className="block w-full btn-secondary text-center py-3"
                  >
                    Continue Shopping
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Support */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Having issues?{" "}
          <a href="#" className="text-primary-600 hover:text-primary-700">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};

export default PaymentResult;
