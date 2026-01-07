import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserOrders } from "../../services/orderService";
import { submitSellerReview } from "../../services/reviewService";
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
  const [showReview, setShowReview] = useState(null); // holds orderId to show review form
  const [reviewData, setReviewData] = useState({ rating: "", comment: "" });
  const canReview = (order) => !order.sellerReviewed;

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const fetchOrders = async () => {
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

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
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
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage your purchases</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`p-4 rounded-lg text-left transition-colors ${
              filter === "all"
                ? "bg-primary-100 border-2 border-primary-500"
                : "bg-white shadow hover:shadow-md"
            }`}
          >
            <p className="text-sm text-gray-500">All Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`p-4 rounded-lg text-left transition-colors ${
              filter === "pending"
                ? "bg-yellow-100 border-2 border-yellow-500"
                : "bg-white shadow hover:shadow-md"
            }`}
          >
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`p-4 rounded-lg text-left transition-colors ${
              filter === "confirmed"
                ? "bg-blue-100 border-2 border-blue-500"
                : "bg-white shadow hover:shadow-md"
            }`}
          >
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.confirmed}
            </p>
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`p-4 rounded-lg text-left transition-colors ${
              filter === "completed"
                ? "bg-green-100 border-2 border-green-500"
                : "bg-white shadow hover: shadow-md"
            }`}
          >
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completed}
            </p>
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`p-4 rounded-lg text-left transition-colors ${
              filter === "cancelled"
                ? "bg-red-100 border-2 border-red-500"
                : "bg-white shadow hover:shadow-md"
            }`}
          >
            <p className="text-sm text-gray-500">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === "all" ? "No orders yet" : `No ${filter} orders`}
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
                            : order.status === "confirmed"
                            ? "bg-blue-100 text-blue-700"
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

                    {/* Order Summary */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Subtotal</span>
                        <span>
                          {formatPrice(order.order_summary?.subtotal || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Delivery</span>
                        <span>
                          {order.order_summary?.delivery_fee > 0
                            ? formatPrice(order.order_summary.delivery_fee)
                            : "Free"}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary-600">
                          {formatPrice(order.order_summary?.total_amount || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Delivery & Payment Info */}
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Delivery Method</p>
                        <p className="font-medium capitalize">
                          {order.delivery?.method === "pickup"
                            ? "📍 Campus Pickup"
                            : "🚚 Delivery"}
                        </p>
                        {order.delivery?.pickup_location && (
                          <p className="text-gray-500">
                            {order.delivery.pickup_location}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Payment</p>
                        <p className="font-medium capitalize">
                          {order.payment?.method === "cash"
                            ? "💵 Cash on Delivery"
                            : order.payment?.method === "upi"
                            ? "📱 UPI"
                            : "💳 Card"}
                        </p>
                        <p
                          className={`text-xs ${
                            order.payment?.status === "completed"
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {order.payment?.status === "completed"
                            ? "✓ Paid"
                            : "⏳ Pending"}
                        </p>
                      </div>
                    </div>
                    {canReview(order) && (
                      <>
                        {!showReview || showReview !== order.id ? (
                          <button
                            onClick={() => setShowReview(order.id)}
                            className="btn-primary-small"
                          >
                            Rate Seller
                          </button>
                        ) : (
                          <div className="bg-gray-100 p-2 rounded-lg mt-2">
                            <label>
                              <span>Rating (1-5):</span>
                              <select
                                value={reviewData.rating}
                                onChange={(e) =>
                                  setReviewData({
                                    ...reviewData,
                                    rating: e.target.value,
                                  })
                                }
                                required
                              >
                                <option value="">Select</option>
                                {[1, 2, 3, 4, 5].map((val) => (
                                  <option key={val} value={val}>
                                    {val}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label>
                              <span>Comment (optional):</span>
                              <textarea
                                value={reviewData.comment}
                                onChange={(e) =>
                                  setReviewData({
                                    ...reviewData,
                                    comment: e.target.value,
                                  })
                                }
                                className="input-field"
                              />
                            </label>
                            <button
                              onClick={async () => {
                                try {
                                  await submitSellerReview({
                                    sellerId: order.seller_id,
                                    sellerName: order.seller_name,
                                    buyerId: currentUser.uid,
                                    buyerName: currentUser.displayName,
                                    rating: reviewData.rating,
                                    comment: reviewData.comment,
                                    orderId: order.id,
                                  });
                                  alert("Review submitted!");
                                  setShowReview(null);
                                } catch (err) {
                                  alert(err.message); // can be "already reviewed" or Firestore error
                                }
                              }}
                              className="btn-primary-small mt-2"
                            >
                              Submit Review
                            </button>
                            <button
                              onClick={() => setShowReview(null)}
                              className="btn-secondary ml-2"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
