import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase.config';

const PRODUCTS_COLLECTION = 'products';
const PRODUCTS_PER_PAGE = 12;

// Free image hosting using ImgBB API (free tier:  100 images/hour)
// Get your free API key from: https://api.imgbb.com/
const IMGBB_API_KEY = '55339b1b0471e7ffc420a83196b7dada'; // Optional - get free key from imgbb.com

// Upload image to ImgBB (free hosting)
export const uploadImageToImgBB = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body:  formData,
    });

    const data = await response.json();
    
    if (data. success) {
      return data.data. url;
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('ImgBB upload error:', error);
    return null;
  }
};

// Convert image to Base64 (alternative - stores in Firestore directly)
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Upload product images - tries ImgBB first, falls back to Base64
export const uploadProductImages = async (files) => {
  const imageUrls = [];

  for (const file of files) {
    try {
      let url;

      // Try ImgBB if API key is set
      if (IMGBB_API_KEY && IMGBB_API_KEY !== 'YOUR_IMGBB_API_KEY') {
        url = await uploadImageToImgBB(file);
      }

      // Fallback to Base64 if ImgBB fails or no API key
      if (!url) {
        // For Base64, we'll limit file size to avoid Firestore limits
        if (file.size > 1 * 1024 * 1024) { // 1MB limit for Base64
          console.warn('File too large for Base64, using placeholder');
          url = `https://via.placeholder.com/400x300?text=${encodeURIComponent(file.name)}`;
        } else {
          url = await imageToBase64(file);
        }
      }

      imageUrls.push({
        url,
        uploaded_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      // Use placeholder on error
      imageUrls.push({
        url: 'https://via.placeholder.com/400x300?text=Product+Image',
        uploaded_at: new Date().toISOString(),
      });
    }
  }

  return imageUrls;
};

// Create a new product
export const createProduct = async (sellerId, sellerInfo, productData, imageFiles = []) => {
  try {
    // Upload images first
    let images = [];
    if (imageFiles.length > 0) {
      images = await uploadProductImages(imageFiles);
    } else {
      // Default placeholder if no images
      images = [{
        url: 'https://via.placeholder.com/400x300?text=No+Image',
        uploaded_at: new Date().toISOString(),
      }];
    }

    // Create product document
    const productRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      seller_id: sellerId,
      seller_name: sellerInfo. displayName || 'Anonymous',
      seller_avatar: sellerInfo. photoURL || '',
      seller_rating: sellerInfo. ratings?.averageRating || 0,
      title: productData.title,
      description:  productData.description,
      category: productData.category,
      price:  parseFloat(productData. price),
      quantity: parseInt(productData.quantity),
      condition: productData.condition,
      images:  images,
      location: {
        hostel: productData.hostel || '',
        pickup_available: productData.pickup_available ??  true,
        delivery_available: productData. delivery_available ?? false,
      },
      availability: {
        is_available: true,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        sold_at: null,
      },
      delivery_options: {
        pickup_on_campus: productData.pickup_available ?? true,
        delivery_available: productData.delivery_available ?? false,
        delivery_fee: parseFloat(productData. delivery_fee) || 0,
      },
      reviews_count: 0,
      average_rating: 0,
      metadata: {
        views: 0,
        saved_by: 0,
        last_viewed: null,
      },
    });

    // Update seller stats
    const sellerRef = doc(db, 'users', sellerId);
    await updateDoc(sellerRef, {
      'seller_stats.products_listed': increment(1),
      role: 'both',
    });

    return productRef.id;
  } catch (error) {
    console.error('Create product error:', error);
    throw error;
  }
};

// Get all available products with pagination
export const getProducts = async (lastDoc = null, filters = {}) => {
  try {
    let q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('availability.is_available', '==', true),
      orderBy('availability.created_at', 'desc'),
      limit(PRODUCTS_PER_PAGE)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ... doc.data(),
    }));

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return { products, lastVisible, hasMore: snapshot.docs.length === PRODUCTS_PER_PAGE };
  } catch (error) {
    console. error('Get products error:', error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (category, lastDoc = null) => {
  try {
    let q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('category', '==', category),
      where('availability.is_available', '==', true),
      orderBy('availability.created_at', 'desc'),
      limit(PRODUCTS_PER_PAGE)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ... doc.data(),
    }));

    const lastVisible = snapshot. docs[snapshot.docs.length - 1];

    return { products, lastVisible, hasMore: snapshot. docs.length === PRODUCTS_PER_PAGE };
  } catch (error) {
    console.error('Get products by category error:', error);
    throw error;
  }
};

// Get single product by ID
export const getProductById = async (productId) => {
  try {
    const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));

    if (productDoc.exists()) {
      // Increment view count
      await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
        'metadata.views': increment(1),
        'metadata.last_viewed': serverTimestamp(),
      });

      return { id: productDoc.id, ...productDoc. data() };
    }

    return null;
  } catch (error) {
    console.error('Get product error:', error);
    throw error;
  }
};

// Get products by seller
export const getSellerProducts = async (sellerId) => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('seller_id', '==', sellerId),
      orderBy('availability.created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc. id,
      ... doc.data(),
    }));
  } catch (error) {
    console. error('Get seller products error:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (productId, updates, newImageFiles = []) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);

    // If new images are provided, upload them
    if (newImageFiles.length > 0) {
      const newImageUrls = await uploadProductImages(newImageFiles);
      const productDoc = await getDoc(productRef);
      const existingImages = productDoc.data()?.images || [];
      updates.images = [...existingImages, ...newImageUrls];
    }

    await updateDoc(productRef, {
      ...updates,
      'availability.updated_at': serverTimestamp(),
    });
  } catch (error) {
    console.error('Update product error:', error);
    throw error;
  }
};

// Mark product as sold
export const markProductAsSold = async (productId) => {
  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      'availability.is_available': false,
      'availability. sold_at': serverTimestamp(),
      'availability.updated_at': serverTimestamp(),
    });
  } catch (error) {
    console.error('Mark as sold error:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (productId, sellerId) => {
  try {
    // Delete product document
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));

    // Update seller stats
    await updateDoc(doc(db, 'users', sellerId), {
      'seller_stats.products_listed': increment(-1),
    });
  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
};

// Search products by title
export const searchProducts = async (searchTerm) => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('availability.is_available', '==', true),
      orderBy('title'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    const products = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product. description.toLowerCase().includes(searchTerm. toLowerCase())
      );

    return products;
  } catch (error) {
    console.error('Search products error:', error);
    throw error;
  }
};