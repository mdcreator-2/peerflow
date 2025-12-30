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

    const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      buyer_id:  buyerId,
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
        method: paymentInfo.method,
        status: 'pending',
        transaction_id: null,
        payment_date: null,
      },
      delivery:  {
        method:  deliveryInfo.method,
        pickup_location: deliveryInfo.method === 'pickup' ? deliveryInfo.pickup_location : '',
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
      return { id: orderDoc.id, ...orderDoc. data() };
    }
    
    return null;
  } catch (error) {
    console.error('Get order error:', error);
    throw error;
  }
};

// Get user's orders (as buyer) - with fallback
export const getUserOrders = async (userId) => {
  try {
    // Try with orderBy first
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('buyer_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs. map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Get user orders error (trying fallback):', error);
    
    // Fallback:  query without orderBy, sort manually
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('buyer_id', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id:  doc.id,
        ...doc.data(),
      }));
      
      // Sort manually by created_at (descending)
      return orders.sort((a, b) => {
        const aTime = a.created_at?. toMillis?. () || 0;
        const bTime = b.created_at?.toMillis?.() || 0;
        return bTime - aTime;
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return [];
    }
  }
};

// Get seller's orders - with fallback for index issues
export const getSellerOrders = async (sellerId) => {
  try {
    // Try with orderBy first
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
    console. error('Get seller orders error (trying fallback):', error);
    
    // Fallback: query without orderBy, then sort manually
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('seller_ids', 'array-contains', sellerId)
      );
      
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id:  doc.id,
        ...doc.data(),
      }));
      
      // Sort manually by created_at (descending)
      return orders. sort((a, b) => {
        const aTime = a.created_at?. toMillis?.() || 0;
        const bTime = b.created_at?.toMillis?. () || 0;
        return bTime - aTime;
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return [];
    }
  }
};

// Update order status
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

// Update payment status
export const updatePaymentStatus = async (orderId, paymentData) => {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      'payment.status': paymentData.status,
      'payment. transaction_id': paymentData.transaction_id || null,
      'payment.payment_date': paymentData.status === 'completed' ? serverTimestamp() : null,
      status: paymentData. status === 'completed' ?  'confirmed' : 'pending',
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
    
    if (! order) throw new Error('Order not found');

    console.log('🔄 Completing order:', orderId);
    console.log('📦 Products in order:', order.products);

    // Update product quantities and seller stats for each product
    for (const product of order.products) {
      console.log(`🔄 Updating product:  ${product.product_id}, quantity: ${product.quantity}`);
      
      // Decrement product quantity
      try {
        const result = await updateProductQuantity(product.product_id, product.quantity);
        console.log(`✅ Product ${product.product_id} updated: `, result);
      } catch (productError) {
        console.error(`❌ Failed to update product ${product.product_id}:`, productError);
      }
      
      // Update seller stats
      try {
        await updateDoc(doc(db, 'users', product.seller_id), {
          'seller_stats.products_sold': increment(product.quantity),
          'seller_stats. total_sales': increment(product. total),
        });
        console.log(`✅ Seller ${product.seller_id} stats updated`);
      } catch (sellerError) {
        console. error(`❌ Failed to update seller ${product.seller_id} stats:`, sellerError);
      }
    }

    // Update order status to completed
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      status: 'completed',
      'delivery.status': 'delivered',
      'delivery.delivered_at':  serverTimestamp(),
      completed_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    
    console.log(`✅ Order ${orderId} completed successfully`);
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
    console. error('Cancel order error:', error);
    throw error;
  }
};