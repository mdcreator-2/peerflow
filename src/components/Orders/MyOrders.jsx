import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getUserOrders,
  buyerConfirmReceipt,
  getOrderById,
} from "../../services/orderService";
import { useAuth } from "../../hooks/useAuth";
import { formatPrice, formatDate } from "../../utils/formatters";
import { ORDER_STATUSES } from "../../utils/constants";
import { SectionLoader } from "../Common/LoadingSpinner";
import toast from "react-hot-toast";

const MyOrders = () => {
  const navigate = useNavigate();
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
      const updatedOrders = await getUserOrders(currentUser.uid);
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error confirming receipt:", error);
      toast.error(error.message || "Failed to confirm receipt");
    } finally {
      setConfirmingOrderId(null);
    }
  };

  const handleCompletePayment = async (orderId) => {
    try {
      const order = await getOrderById(orderId);
      if (!order) {
        toast.error("Order not found");
        return;
      }

      navigate("/payment", {
        state: {
          orderId: order.id,
          amount: order.order_summary?.total_amount,
          paymentMethod: order.payment?.method,
          deliveryPin: order.handshake?.delivery_pin,
          isRetryPayment: true,
        },
      });
    } catch (error) {
      console.error("Error fetching order for payment:", error);
      toast.error("Failed to process payment.  Please try again.");
    }
  };

  const closePinModal = () => {
    setShowPinModal(false);
    setEnteredPin("");
    setSelectedOrderId(null);
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "payment_pending") {
      return (
        (order.status === "payment_required" || order.status === "pending") &&
        order.payment?.method !== "cash"
      );
    }
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    payment_pending: orders.filter(
      (o) =>
        (o.status === "payment_required" || o.status === "pending") &&
        o.payment?.method !== "cash"
    ).length,
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
      <div className="max-w-4xl mx-auto px-4 sm: px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">
            Track your purchases and meetup status
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-purple-600">
              {stats.waiting_for_meetup}
            </p>
            <p className="text-sm text-gray-500">Awaiting Meetup</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-orange-600">
              {stats.payment_pending}
            </p>
            <p className="text-sm text-gray-500">Payment Pending</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex">
            {[
              { id: "all", label: "All", count: stats.total },
              {
                id: "payment_pending",
                label: "Payment Pending",
                count: stats.payment_pending,
              },
              {
                id: "waiting_for_meetup",
                label: "Awaiting Meetup",
                count: stats.waiting_for_meetup,
              },
              {
                id: "seller_confirmed",
                label: "Ready to Receive",
                count: stats.seller_confirmed,
              },
              { id: "completed", label: "Completed", count: stats.completed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  filter === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900">
              {filter === "all"
                ? "No orders yet"
                : `No ${filter.replace("_", " ")} orders`}
            </h3>
            <p className="text-gray-500 mt-1">
              {filter === "all"
                ? "Start shopping to see your orders here!"
                : "Try selecting a different filter above. "}
            </p>
            {filter === "all" && (
              <Link to="/marketplace" className="btn-primary mt-4 inline-block">
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
              const isOnlinePayment = order.payment?.method !== "cash";
              const needsPayment =
                (order.status === "payment_required" ||
                  order.status === "pending") &&
                isOnlinePayment;
              const isCashOrder = order.payment?.method === "cash";

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
                            : needsPayment
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {needsPayment
                          ? "💳 Payment Required"
                          : `${status.icon} ${status.name}`}
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
                            <p className="font-medium text-gray-900">
                              {product.product_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {product.quantity} ×{" "}
                              {formatPrice(product.price)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Seller: {product.seller_name}
                            </p>
                          </div>
                          <p className="font-medium text-gray-900">
                            {formatPrice(product.total)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Payment: </span>
                        <span
                          className={`${
                            isCashOrder ? "text-blue-600" : "text-green-600"
                          }`}
                        >
                          {isCashOrder
                            ? "💵 Cash on Meetup"
                            : `${
                                order.payment?.method === "upi" ? "📱" : "💳"
                              } ${order.payment?.method?.toUpperCase()}`}
                        </span>
                        {order.payment?.status === "unpaid_cash" && (
                          <span className="ml-2 text-yellow-600">
                            (Pay on meetup)
                          </span>
                        )}
                        {order.payment?.status === "paid" && (
                          <span className="ml-2 text-green-600">(Paid ✓)</span>
                        )}
                        {needsPayment && (
                          <span className="ml-2 text-orange-600">
                            (Not paid)
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Total: </span>
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(order.order_summary?.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Delivery PIN for buyer - only show when payment is done */}
                    {order.handshake?.delivery_pin &&
                      order.status !== "completed" &&
                      order.status !== "cancelled" &&
                      !needsPayment && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-800">
                            🔐 Your Delivery PIN
                          </p>
                          <p className="text-2xl font-mono font-bold text-blue-700 mt-1">
                            {order.handshake.delivery_pin}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Share this PIN with the seller to verify your
                            identity during meetup
                          </p>
                        </div>
                      )}

                    {/* Cash Order Reminder */}
                    {isCashOrder && order.status === "waiting_for_meetup" && (
                      <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm font-medium text-yellow-800">
                          💵 Cash Payment Required
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Please have{" "}
                          <strong>
                            {formatPrice(order.order_summary?.total_amount)}
                          </strong>{" "}
                          ready when you meet the seller.
                        </p>
                      </div>
                    )}

                    {/* Awaiting Meetup - Online Payment */}
                    {order.status === "waiting_for_meetup" && !isCashOrder && (
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
                            🤝 Seller has handed over the item!
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            Please confirm that you have received the item to
                            complete the order.
                            {isCashOrder &&
                              " Make sure you've paid the cash amount. "}
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

                    {/* Complete Payment Action for Pending Online Orders */}
                    {needsPayment && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                          <p className="text-sm font-medium text-orange-800">
                            💳 Payment Required
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            You selected online payment but haven't completed it
                            yet. Complete your payment to proceed with the
                            order.
                          </p>
                        </div>
                        <button
                          onClick={() => handleCompletePayment(order.id)}
                          className="w-full py-3 px-4 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                        >
                          💳 Complete Payment -{" "}
                          {formatPrice(order.order_summary?.total_amount)}
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                🔐 Enter Delivery PIN
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter the 4-digit PIN to confirm receipt of the item.
              </p>
              <input
                type="text"
                maxLength="4"
                value={enteredPin}
                onChange={(e) =>
                  setEnteredPin(e.target.value.replace(/\D/g, ""))
                }
                className="w-full text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg p-4 focus:border-primary-500 focus: outline-none"
                placeholder="• • • •"
                autoFocus
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closePinModal}
                  className="flex-1 py-3 px-4 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinSubmit}
                  disabled={confirmingOrderId}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    confirmingOrderId
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  }`}
                >
                  {confirmingOrderId ? "Verifying..." : "Confirm"}
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
