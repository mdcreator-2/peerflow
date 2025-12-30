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
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase.config';

const PRODUCTS_COLLECTION = 'products';

// Add this at the top of the file
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

// Upload image to ImgBB (free hosting)
const uploadToImgBB = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(
      `https://api.imgbb. com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response. json();

    if (data. success) {
      return data.data. url; // Returns direct image URL
    } else {
      throw new Error('ImgBB upload failed');
    }
  } catch (error) {
    console.error('ImgBB upload error:', error);
    return null;
  }
};

// Convert to Base64 (fallback)
const imageToBase64 = (file) => {
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
      let url = null;

      // Try ImgBB first if API key exists
      if (IMGBB_API_KEY) {
        url = await uploadToImgBB(file);
        if (url) {
          console.log('✅ Image uploaded to ImgBB:', url);
        }
      }

      // Fallback to Base64 if ImgBB fails or no API key
      if (!url) {
        if (file.size > 1 * 1024 * 1024) {
          console.warn('File too large for Base64, using placeholder');
          url = `https://via.placeholder.com/400x300?text=Image+Too+Large`;
        } else {
          url = await imageToBase64(file);
          console.log('✅ Image converted to Base64');
        }
      }

      imageUrls.push({
        url,
        uploaded_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      imageUrls.push({
        url: 'https://via.placeholder.com/400x300?text=Upload+Failed',
        uploaded_at: new Date().toISOString(),
      });
    }
  }

  return imageUrls;
};

// Create a new product
export const createProduct = async (sellerId, sellerInfo, productData, imageFiles = []) => {
  try {
    let images = [];
    if (imageFiles.length > 0) {
      images = await uploadProductImages(imageFiles);
    } else {
      images = [{
        url: 'https://via.placeholder.com/400x300?text=No+Image',
        uploaded_at: new Date().toISOString(),
      }];
    }

    const productRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      seller_id: sellerId,
      seller_name: sellerInfo?. displayName || 'Anonymous',
      seller_avatar: sellerInfo?. photoURL || '',
      seller_rating: sellerInfo?.ratings?.averageRating || 0,
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
        is_available: true,  // IMPORTANT: This must be true!
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

    return productRef. id;
  } catch (error) {
    console.error('Create product error:', error);
    throw error;
  }
};

// Get all available products - SIMPLIFIED QUERY (no complex ordering)
export const getProducts = async () => {
  try {
    // Simple query without ordering to avoid index issues
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('availability.is_available', '==', true)
    );

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ... doc.data(),
    }));

    console.log('Fetched products:', products.length); // Debug log
    return { products, hasMore: false };
  } catch (error) {
    console.error('Get products error:', error);
    
    // Fallback:  Get ALL products if the filtered query fails
    try {
      console.log('Trying fallback query...');
      const fallbackSnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      const allProducts = fallbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ... doc.data(),
      }));
      
      // Filter manually
      const availableProducts = allProducts.filter(p => 
        p.availability?. is_available === true || p.availability?.is_available === undefined
      );
      
      console.log('Fallback products:', availableProducts.length);
      return { products:  availableProducts, hasMore: false };
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return { products: [], hasMore: false };
    }
  }
};

// Get products by category
export const getProductsByCategory = async (category) => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('category', '==', category),
      where('availability.is_available', '==', true)
    );

    const snapshot = await getDocs(q);
    const products = snapshot.docs. map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { products, hasMore: false };
  } catch (error) {
    console. error('Get products by category error:', error);
    
    // Fallback
    try {
      const fallbackSnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
      const allProducts = fallbackSnapshot.docs.map(doc => ({
        id:  doc.id,
        ...doc.data(),
      }));
      
      const filtered = allProducts.filter(p => 
        p.category === category && 
        (p.availability?.is_available === true || p.availability?.is_available === undefined)
      );
      
      return { products: filtered, hasMore: false };
    } catch (fallbackError) {
      return { products: [], hasMore: false };
    }
  }
};

// Get single product by ID
export const getProductById = async (productId) => {
  try {
    const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));

    if (productDoc.exists()) {
      // Increment view count
      try {
        await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
          'metadata.views': increment(1),
          'metadata.last_viewed': serverTimestamp(),
        });
      } catch (e) {
        console.log('Could not update view count');
      }

      return { id: productDoc. id, ...productDoc.data() };
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
      where('seller_id', '==', sellerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ... doc.data(),
    }));
  } catch (error) {
    console.error('Get seller products error:', error);
    return [];
  }
};

// Update product
export const updateProduct = async (productId, updates, newImageFiles = []) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);

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
    console. error('Update product error:', error);
    throw error;
  }
};

// Mark product as sold
export const markProductAsSold = async (productId) => {
  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      'availability.is_available': false,
      'availability.sold_at': serverTimestamp(),
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
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    console. error('Delete product error:', error);
    throw error;
  }
};

// Search products
export const searchProducts = async (searchTerm) => {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const products = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(product =>
        (product.availability?.is_available !== false) &&
        (product.title?. toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    return products;
  } catch (error) {
    console.error('Search products error:', error);
    return [];
  }
};