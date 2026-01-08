import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { createOrder } from "../../services/orderService";
import { formatPrice } from "../../utils/formatters";
import { HOSTELS, PAYMENT_METHODS } from "../../utils/constants";
import { validateCheckoutForm } from "../../utils/validators";
import toast from "react-hot-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { currentUser, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    deliveryMethod: "pickup",
    hostel: userProfile?.location?.hostel || "",
    room: userProfile?.location?.room || "",
    phone: "",
    paymentMethod: "cash",
  });

  useEffect(() => {
    if (userProfile?.phone && !formData.phone) {
      setFormData((prev) => ({ ...prev, phone: userProfile.phone }));
    }
    // eslint-disable-next-line
  }, [userProfile]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateCheckoutForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      const deliveryInfo = {
        method: formData.deliveryMethod,
        hostel: formData.hostel,
        room: formData.room,
        phone: formData.phone,
        pickup_location: formData.deliveryMethod === "pickup" ? "Campus" : "",
        address:
          formData.deliveryMethod === "delivery"
            ? `${formData.hostel}, Room ${formData.room}`
            : "",
      };

      const paymentInfo = {
        method: formData.paymentMethod,
      };

      const { orderId, totalAmount, delivery_pin } = await createOrder(
        currentUser.uid,
        userProfile,
        cartItems,
        deliveryInfo,
        paymentInfo
      );

      // Different flow for Cash vs Online payment
      if (formData.paymentMethod === "cash") {
        // Cash on Meetup:  Clear cart and go directly to success page
        clearCart();
        toast.success("Order placed successfully!");

        // Navigate to success page with cash order details
        navigate("/payment/result", {
          state: {
            success: true,
            orderId,
            amount: totalAmount,
            method: "cash",
            message: "Order confirmed! Please prepare cash for the meetup.",
            deliveryPin: delivery_pin,
            isCashOrder: true,
          },
          replace: true, // Replace current history entry so back button doesn't go to checkout
        });
      } else {
        // Online Payment: Navigate to payment page
        navigate("/payment", {
          state: {
            orderId,
            amount: totalAmount,
            paymentMethod: formData.paymentMethod,
            deliveryPin: delivery_pin,
          },
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const deliveryFee =
    formData.deliveryMethod === "delivery"
      ? cartItems.reduce((sum, item) => sum + (item.delivery_fee || 0), 0)
      : 0;
  const total = subtotal + deliveryFee;

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg: px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Method */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Delivery Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.deliveryMethod === "pickup"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="pickup"
                      checked={formData.deliveryMethod === "pickup"}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus: ring-primary-500"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">
                        Campus Pickup
                      </span>
                      <p className="text-sm text-gray-500">
                        Meet the seller on campus
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.deliveryMethod === "delivery"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover: bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="delivery"
                      checked={formData.deliveryMethod === "delivery"}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">
                        Hostel Delivery
                      </span>
                      <p className="text-sm text-gray-500">
                        Seller will deliver to your hostel
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="hostel"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Hostel <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="hostel"
                      name="hostel"
                      value={formData.hostel}
                      onChange={handleChange}
                      className={`mt-1 input-field ${
                        errors.hostel ? "input-error" : ""
                      }`}
                    >
                      <option value="">Select hostel</option>
                      {HOSTELS.map((hostel) => (
                        <option key={hostel.id} value={hostel.id}>
                          {hostel.name}
                        </option>
                      ))}
                    </select>
                    {errors.hostel && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.hostel}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="room"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Room Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="room"
                      name="room"
                      value={formData.room}
                      onChange={handleChange}
                      className={`mt-1 input-field ${
                        errors.room ? "input-error" : ""
                      }`}
                      placeholder="e.g., 101"
                    />
                    {errors.room && (
                      <p className="mt-1 text-sm text-red-600">{errors.room}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`mt-1 input-field ${
                        errors.phone ? "input-error" : ""
                      }`}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                      autoComplete="tel"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.paymentMethod === method.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="ml-3 flex items-center">
                        <span className="text-xl mr-2">{method.icon}</span>
                        <span className="font-medium text-gray-900">
                          {method.name}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.paymentMethod && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.paymentMethod}
                  </p>
                )}

                {/* Cash on Meetup Info */}
                {formData.paymentMethod === "cash" && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>💵 Cash on Meetup: </strong> You'll pay the seller
                      directly when you meet on campus. Please have exact change
                      ready.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.image || "https://via.placeholder.com/48"}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <hr className="my-4" />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className="font-medium">
                      {deliveryFee > 0 ? formatPrice(deliveryFee) : "Free"}
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary-600">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary mt-6 py-3 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </>
                  ) : formData.paymentMethod === "cash" ? (
                    `Place Order - ${formatPrice(total)}`
                  ) : (
                    `Proceed to Pay ${formatPrice(total)}`
                  )}
                </button>

                <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
