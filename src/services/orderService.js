import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase.config';
import { updateProductQuantity } from './productService';

const ORDERS_COLLECTION = 'orders';

// Create a new order
export const createOrder = async (buyerId, buyerInfo, cartItems, deliveryInfo, paymentInfo) => {
  try {
    // Calculate order totals
    const subtotal = cartItems. reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = deliveryInfo.method === 'delivery' ? 
      cartItems.reduce((sum, item) => sum + (item.delivery_fee || 0), 0) : 0;
    const totalAmount = subtotal + deliveryFee;

    // Create products array for order
    const products = cartItems.map(item => ({
      product_id: item. id,
      product_name: item. title,
      price: item.price,
      quantity: item.quantity,
      total:  item.price * item.quantity,
      seller_id: item.seller_id,
      seller_name: item.seller_name,
    }));

    // Get unique sellers
    const sellerIds = [... new Set(cartItems.map(item => item.seller_id))];

    const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      buyer_id: buyerId,
      buyer_name: buyerInfo.displayName,
      buyer_email: buyerInfo. email,
      seller_ids: sellerIds,
      products,
      order_summary: {
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        currency: 'INR',
        item_count: cartItems.reduce((sum, item) => sum + item. quantity, 0),
      },
      payment:  {
        method: paymentInfo.method,
        status: 'pending',
        transaction_id: null,
        payment_date: null,
      },
      delivery:  {
        method:  deliveryInfo.method,
        pickup_location: deliveryInfo.method === 'pickup' ? deliveryInfo. pickup_location : '',
        delivery_address: deliveryInfo. method === 'delivery' ? deliveryInfo.address : '',
        hostel:  deliveryInfo.hostel || '',
        room:  deliveryInfo.room || '',
        phone: deliveryInfo. phone || '',
        status: 'pending',
        delivered_at: null,
      },
      status: 'pending',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      completed_at: null,
      review_submitted: false,
    });

    return { orderId: orderRef. id, totalAmount };
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    
    if (orderDoc.exists()) {
      return { id: orderDoc. id, ...orderDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Get order error:', error);
    throw error;
  }
};

// Get user's orders (as buyer)
export const getUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('buyer_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id:  doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Get user orders error:', error);
    throw error;
  }
};

// Get seller's orders
export const getSellerOrders = async (sellerId) => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('seller_ids', 'array-contains', sellerId),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc. id,
      ... doc.data(),
    }));
  } catch (error) {
    console. error('Get seller orders error:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const updates = {
      status,
      updated_at:  serverTimestamp(),
    };

    if (status === 'completed') {
      updates.completed_at = serverTimestamp();
    }

    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updates);
  } catch (error) {
    console. error('Update order status error:', error);
    throw error;
  }
};

// Update payment status
export const updatePaymentStatus = async (orderId, paymentData) => {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      'payment.status': paymentData.status,
      'payment. transaction_id': paymentData.transaction_id || null,
      'payment.payment_date': paymentData. status === 'completed' ? serverTimestamp() : null,
      status: paymentData.status === 'completed' ?  'confirmed' : 'pending',
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    throw error;
  }
};

// Complete order and update all related data
export const completeOrder = async (orderId) => {
  try {
    const order = await getOrderById(orderId);
    
    if (!order) throw new Error('Order not found');

    // Mark all products as sold
    for (const product of order.products) {
      await updateProductQuantity(product.product_id, product.quantity);
      
      // Update seller stats
      await updateDoc(doc(db, 'users', product.seller_id), {
        'seller_stats.products_sold': increment(1),
        'seller_stats.total_sales': increment(product.total),
      });
    }

    // Update order status
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status: 'completed',
      'delivery.status': 'delivered',
      'delivery.delivered_at': serverTimestamp(),
      completed_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console. error('Complete order error:', error);
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId) => {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status: 'cancelled',
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    throw error;
  }
};