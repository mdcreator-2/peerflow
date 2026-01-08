import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase.config';
import { updateProductQuantity } from './productService';

const ORDERS_COLLECTION = 'orders';

// Generate a 4-digit delivery PIN for handshake verification
const generateDeliveryPin = () => {
  return Math.floor(1000 + Math. random() * 9000).toString();
};

export const createOrder = async (buyerId, buyerInfo, cartItems, deliveryInfo, paymentInfo) => {
  try {
    const subtotal = cartItems. reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = deliveryInfo.method === 'delivery' ? 
      cartItems.reduce((sum, item) => sum + (item.delivery_fee || 0), 0) : 0;
    const totalAmount = subtotal + deliveryFee;

    const products = cartItems.map(item => ({
      product_id: item. id,
      product_name: item. title,
      price: item.price,
      quantity: item.quantity,
      total:  item.price * item.quantity,
      seller_id: item.seller_id,
      seller_name: item.seller_name,
    }));

    const sellerIds = [... new Set(cartItems.map(item => item.seller_id))];

    // Generate delivery PIN for handshake verification
    const delivery_pin = generateDeliveryPin();

    // Determine initial status based on payment method
    const isCashPayment = paymentInfo.method === 'cash';
    const initialPaymentStatus = isCashPayment ? 'unpaid_cash' : 'pending';
    const initialOrderStatus = isCashPayment ? 'waiting_for_meetup' : 'payment_required';

    const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      buyer_id: buyerId,
      buyer_name: buyerInfo. displayName,
      buyer_email: buyerInfo.email,
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
        method:  paymentInfo.method, // 'cash' | 'upi' | 'card' (online)
        status: initialPaymentStatus, // 'paid' | 'pending' | 'unpaid_cash'
        transaction_id: null,
        payment_date: null,
      },
      // Updated meetup-focused delivery object
      meetup: {
        location: deliveryInfo.pickup_location || deliveryInfo.meetup_location || '',
        hostel: deliveryInfo.hostel || '',
        room: deliveryInfo. room || '',
        phone: deliveryInfo. phone || '',
        notes: deliveryInfo. notes || '',
        status: 'pending',
        met_at: null,
      },
      // Handshake verification fields
      handshake:  {
        delivery_pin,
        seller_confirmed: false,
        seller_confirmed_at: null,
        buyer_confirmed: false,
        buyer_confirmed_at: null,
      },
      status: initialOrderStatus, // 'payment_required' | 'waiting_for_meetup' | 'completed'
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      completed_at: null,
      review_submitted: false,
    });

    return { orderId: orderRef. id, totalAmount, delivery_pin, paymentMethod: paymentInfo.method };
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId));
    
    if (orderDoc.exists()) {
      return { id: orderDoc.id, ... orderDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Get order error:', error);
    throw error;
  }
};

const fetchOrdersWithFallback = async (queryConstraints) => {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), ...queryConstraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch {
    const [whereConstraint] = queryConstraints;
    const qFallback = query(collection(db, ORDERS_COLLECTION), whereConstraint);
    const snapshot = await getDocs(qFallback);
    const orders = snapshot.docs.map(doc => ({ id: doc. id, ...doc. data() }));
    
    return orders. sort((a, b) => {
      const aTime = a.created_at?. toMillis?. () || 0;
      const bTime = b. created_at?.toMillis?.() || 0;
      return bTime - aTime;
    });
  }
};

export const getUserOrders = async (userId) => {
  try {
    return await fetchOrdersWithFallback([
      where('buyer_id', '==', userId)
    ]);
  } catch (error) {
    console.error('Get user orders error:', error);
    return [];
  }
};

export const getSellerOrders = async (sellerId) => {
  try {
    return await fetchOrdersWithFallback([
      where('seller_ids', 'array-contains', sellerId)
    ]);
  } catch (error) {
    console.error('Get seller orders error:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const updates = {
      status,
      updated_at: serverTimestamp(),
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

export const updatePaymentStatus = async (orderId, paymentData) => {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      'payment.status': paymentData.status,
      'payment. transaction_id': paymentData.transaction_id || null,
      'payment.payment_date': paymentData. status === 'paid' ? serverTimestamp() : null,
      // Move to waiting_for_meetup when payment is successful
      status: paymentData.status === 'paid' ?  'waiting_for_meetup' :  'payment_required',
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    throw error;
  }
};

// Seller confirms they have handed over the item
export const sellerConfirmHandover = async (orderId, sellerId) => {
  try {
    const order = await getOrderById(orderId);
    
    if (!order) throw new Error('Order not found');
    if (! order.seller_ids.includes(sellerId)) throw new Error('Unauthorized:  Not a seller for this order');
    if (order.status !== 'waiting_for_meetup') throw new Error('Order is not ready for handover confirmation');

    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      'handshake.seller_confirmed': true,
      'handshake.seller_confirmed_at': serverTimestamp(),
      status: 'seller_confirmed',
      'meetup.status': 'handed_over',
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Seller confirm handover error:', error);
    throw error;
  }
};

// Buyer confirms they have received the item (with optional PIN verification)
export const buyerConfirmReceipt = async (orderId, buyerId, enteredPin = null) => {
  try {
    const order = await getOrderById(orderId);
    
    if (!order) throw new Error('Order not found');
    if (order.buyer_id !== buyerId) throw new Error('Unauthorized: Not the buyer for this order');
    if (order.status !== 'seller_confirmed') throw new Error('Seller has not confirmed handover yet');
    
    // Optional PIN verification for extra security
    if (enteredPin && order.handshake?. delivery_pin !== enteredPin) {
      throw new Error('Invalid delivery PIN');
    }

    // If it was cash payment, mark as paid now
    const paymentUpdate = order.payment?.status === 'unpaid_cash' 
      ? { 'payment.status':  'paid', 'payment.payment_date': serverTimestamp() }
      : {};

    // Update order to completed
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      'handshake.buyer_confirmed': true,
      'handshake.buyer_confirmed_at': serverTimestamp(),
      status: 'completed',
      'meetup.status': 'completed',
      'meetup.met_at': serverTimestamp(),
      completed_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      ...paymentUpdate,
    });

    // Update seller stats and product quantities
    for (const product of order.products) {
      try {
        await updateProductQuantity(product.product_id, product.quantity);
      } catch (productError) {
        console.error(`Failed to update product ${product.product_id}:`, productError);
      }
      
      try {
        await updateDoc(doc(db, 'users', product.seller_id), {
          'seller_stats.products_sold': increment(product.quantity),
          'seller_stats. total_sales': increment(product.total),
        });
      } catch (sellerError) {
        console.error(`Failed to update seller ${product.seller_id} stats:`, sellerError);
      }
    }
  } catch (error) {
    console. error('Buyer confirm receipt error:', error);
    throw error;
  }
};

// Legacy function - now just for manual completion by admin if needed
export const completeOrder = async (orderId) => {
  try {
    const order = await getOrderById(orderId);
    
    if (!order) throw new Error('Order not found');

    for (const product of order.products) {
      try {
        await updateProductQuantity(product.product_id, product.quantity);
      } catch (productError) {
        console.error(`Failed to update product ${product.product_id}:`, productError);
      }
      
      try {
        await updateDoc(doc(db, 'users', product. seller_id), {
          'seller_stats.products_sold': increment(product. quantity),
          'seller_stats.total_sales': increment(product.total),
        });
      } catch (sellerError) {
        console.error(`Failed to update seller ${product. seller_id} stats:`, sellerError);
      }
    }

    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status: 'completed',
      'meetup.status': 'completed',
      'meetup.met_at': serverTimestamp(),
      completed_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Complete order error:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status: 'cancelled',
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console. error('Cancel order error:', error);
    throw error;
  }
};

// Calculate seller revenue from orders (for dashboard)
export const calculateSellerRevenue = (orders, sellerId) => {
  return orders
    .filter(order => order.status === 'completed' || order.status === 'seller_confirmed')
    .reduce((total, order) => {
      const sellerProducts = order.products. filter(p => p.seller_id === sellerId);
      const orderTotal = sellerProducts. reduce((sum, p) => sum + p.total, 0);
      return total + orderTotal;
    }, 0);
};

// Calculate pending revenue (orders not yet completed)
export const calculatePendingRevenue = (orders, sellerId) => {
  return orders
    .filter(order => order.status === 'waiting_for_meetup' || order.status === 'seller_confirmed')
    .reduce((total, order) => {
      const sellerProducts = order.products. filter(p => p.seller_id === sellerId);
      const orderTotal = sellerProducts.reduce((sum, p) => sum + p.total, 0);
      return total + orderTotal;
    }, 0);
};