import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getUserOrders,
  buyerConfirmReceipt,
} from "../../services/orderService";
import { useAuth } from "../../hooks/useAuth";
import { formatPrice, formatDate } from "../../utils/formatters";
import { ORDER_STATUSES } from "../../utils/constants";
import { SectionLoader } from "../Common/LoadingSpinner";
import toast from "react-hot-toast";

const MyOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [confirmingOrderId, setConfirmingOrderId] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [enteredPin, setEnteredPin] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersData = await getUserOrders(currentUser.uid);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceipt = async (orderId, usePin = false) => {
    if (usePin) {
      setSelectedOrderId(orderId);
      setShowPinModal(true);
      return;
    }

    setConfirmingOrderId(orderId);
    try {
      await buyerConfirmReceipt(orderId, currentUser.uid);
      toast.success("Item received!  Order completed successfully.");
      // Refresh orders
      const updatedOrders = await getUserOrders(currentUser.uid);
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error confirming receipt:", error);
      toast.error(error.message || "Failed to confirm receipt");
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handlePinSubmit = async () => {
    if (!enteredPin || enteredPin.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }

    setConfirmingOrderId(selectedOrderId);
    try {
      await buyerConfirmReceipt(selectedOrderId, currentUser.uid, enteredPin);
      toast.success("Item received! Order completed successfully.");
      setShowPinModal(false);
      setEnteredPin("");
      setSelectedOrderId(null);
      // Refresh orders
      const updatedOrders = await getUserOrders(currentUser.uid);
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error confirming receipt:", error);
      toast.error(error.message || "Failed to confirm receipt");
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setEnteredPin("");
    setSelectedOrderId(null);
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    waiting_for_meetup: orders.filter((o) => o.status === "waiting_for_meetup")
      .length,
    seller_confirmed: orders.filter((o) => o.status === "seller_confirmed")
      .length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  if (loading) {
    return <SectionLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">
            Track your purchases and meetup status
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`p-4 rounded-lg text-center transition-colors ${
              filter === "all"
                ? "bg-primary-100 border-2 border-primary-500"
                : "bg-white"
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">All Orders</p>
          </button>
          <button
            onClick={() => setFilter("waiting_for_meetup")}
            className={`p-4 rounded-lg text-center transition-colors ${
              filter === "waiting_for_meetup"
                ? "bg-purple-100 border-2 border-purple-500"
                : "bg-white"
            }`}
          >
            <p className="text-2xl font-bold text-purple-600">
              {stats.waiting_for_meetup}
            </p>
            <p className="text-sm text-gray-500">Awaiting Meetup</p>
          </button>
          <button
            onClick={() => setFilter("seller_confirmed")}
            className={`p-4 rounded-lg text-center transition-colors ${
              filter === "seller_confirmed"
                ? "bg-orange-100 border-2 border-orange-500"
                : "bg-white"
            }`}
          >
            <p className="text-2xl font-bold text-orange-600">
              {stats.seller_confirmed}
            </p>
            <p className="text-sm text-gray-500">Confirm Receipt</p>
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`p-4 rounded-lg text-center transition-colors ${
              filter === "completed"
                ? "bg-green-100 border-2 border-green-500"
                : "bg-white"
            }`}
          >
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
            <p className="text-sm text-gray-500">Completed</p>
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`p-4 rounded-lg text-center transition-colors ${
              filter === "cancelled"
                ? "bg-red-100 border-2 border-red-500"
                : "bg-white"
            }`}
          >
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-sm text-gray-500">Cancelled</p>
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "all"
                ? "No orders yet"
                : `No ${filter.replace("_", " ")} orders`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === "all"
                ? "Start shopping to see your orders here!"
                : "Try selecting a different filter above. "}
            </p>
            {filter === "all" && (
              <Link to="/marketplace" className="btn-primary">
                Browse Marketplace
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const status =
                ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
              const canConfirmReceipt = order.status === "seller_confirmed";
              const isConfirming = confirmingOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order placed on {formatDate(order.created_at)}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        ID: {order.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "seller_confirmed"
                            ? "bg-orange-100 text-orange-700"
                            : order.status === "waiting_for_meetup"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {status.icon} {status.name}
                      </span>
                    </div>
                  </div>

                  {/* Order Products */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.products.map((product, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {product.product_name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Qty: {product.quantity} ×{" "}
                              {formatPrice(product.price)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Seller: {product.seller_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatPrice(product.total)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Meetup Info */}
                    {order.meetup &&
                      order.status !== "completed" &&
                      order.status !== "cancelled" && (
                        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h4 className="font-medium text-purple-800 mb-2">
                            📍 Meetup Details
                          </h4>
                          <p className="text-sm text-purple-700">
                            Location:{" "}
                            {order.meetup.location ||
                              order.meetup.hostel ||
                              "Contact seller"}
                            {order.meetup.room && `, Room ${order.meetup.room}`}
                          </p>
                          {order.meetup.phone && (
                            <p className="text-sm text-purple-700">
                              📞 {order.meetup.phone}
                            </p>
                          )}
                        </div>
                      )}

                    {/* Delivery PIN for Buyer */}
                    {order.handshake?.delivery_pin &&
                      order.status !== "completed" &&
                      order.status !== "cancelled" && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-800 mb-1">
                            🔐 Your Delivery PIN
                          </h4>
                          <p className="text-2xl font-mono font-bold text-blue-700">
                            {order.handshake.delivery_pin}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Share this PIN with the seller when you meet to
                            verify your identity
                          </p>
                        </div>
                      )}

                    {/* Order Summary */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Subtotal</span>
                        <span>
                          {formatPrice(order.order_summary?.subtotal)}
                        </span>
                      </div>
                      {order.order_summary?.delivery_fee > 0 && (
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Delivery Fee</span>
                          <span>
                            {formatPrice(order.order_summary?.delivery_fee)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-gray-100">
                        <span>Total</span>
                        <span className="text-primary-600">
                          {formatPrice(order.order_summary?.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Status-specific messages */}
                    {order.status === "waiting_for_meetup" && (
                      <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-800">
                          📍 Awaiting Meetup
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          Contact the seller to arrange a meetup on campus. Once
                          you meet, the seller will confirm the handover.
                        </p>
                      </div>
                    )}

                    {/* Confirm Receipt Action for Buyer */}
                    {canConfirmReceipt && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                          <p className="text-sm font-medium text-orange-800">
                            🤝 Seller has handed over the item!{" "}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            Please confirm that you have received the item to
                            complete this order.
                          </p>
                        </div>
                        <button
                          onClick={() => handleConfirmReceipt(order.id)}
                          disabled={isConfirming}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                            isConfirming
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {isConfirming ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg
                                className="animate-spin h-5 w-5"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Confirming...
                            </span>
                          ) : (
                            "✅ Confirm Receipt - I have the item"
                          )}
                        </button>
                      </div>
                    )}

                    {/* Payment Action for Buyer if pending payment */}
                    {order.status === "pending" && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                          <p className="text-sm font-medium text-orange-800">
                            You have not made the Payment!{" "}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            You can pay now to complete this order.
                          </p>
                        </div>
                        <button
                          onClick={() => handleConfirmPayment(order.id)}
                          disabled={isConfirming}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                            isConfirming
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {isConfirming ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg
                                className="animate-spin h-5 w-5"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Confirming...
                            </span>
                          ) : (
                            "✅ Confirm Payment"
                          )}
                        </button>
                      </div>
                    )}

                    {/* Completed Order */}
                    {order.status === "completed" && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-800">
                          ✅ Order Completed
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          This transaction has been successfully completed.
                          Thank you for using PeerFlow!
                        </p>
                      </div>
                    )}

                    {/* Cancelled Order */}
                    {order.status === "cancelled" && (
                      <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm font-medium text-red-800">
                          ❌ Order Cancelled
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          This order has been cancelled.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PIN Verification Modal */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔐 Enter Delivery PIN
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the 4-digit PIN you shared with the seller to verify the
                transaction.
              </p>
              <input
                type="text"
                value={enteredPin}
                onChange={(e) =>
                  setEnteredPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="Enter 4-digit PIN"
                className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus: ring-primary-500 focus: border-transparent"
                maxLength={4}
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closePinModal}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinSubmit}
                  disabled={enteredPin.length !== 4 || confirmingOrderId}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                    enteredPin.length === 4 && !confirmingOrderId
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {confirmingOrderId ? "Verifying..." : "Verify & Complete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
