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
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase.config';

const PRODUCTS_COLLECTION = 'products';
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

const uploadToImgBB = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (data.success) {
      return data.data.url;
    } else {
      throw new Error('ImgBB upload failed');
    }
  } catch (error) {
    console.error('ImgBB upload error:', error);
    return null;
  }
};

const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const uploadProductImages = async (files) => {
  const imageUrls = [];

  for (const file of files) {
    try {
      let url = null;

      if (IMGBB_API_KEY) {
        url = await uploadToImgBB(file);
      }

      if (!url) {
        if (file.size > 1 * 1024 * 1024) {
          url = `https://via.placeholder.com/400x300?text=Image+Too+Large`;
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
      imageUrls.push({
        url: 'https://via.placeholder.com/400x300?text=Upload+Failed',
        uploaded_at: new Date().toISOString(),
      });
    }
  }

  return imageUrls;
};

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
      seller_name: sellerInfo?.displayName || 'Anonymous',
      seller_avatar: sellerInfo?.photoURL || '',
      seller_rating: sellerInfo?.ratings?.averageRating || 0,
      title: productData.title,
      description: productData.description,
      category: productData.category,
      price: parseFloat(productData.price),
      quantity: parseInt(productData.quantity),
      condition: productData.condition,
      images: images,
      location: {
        hostel: productData.hostel || '',
        pickup_available: productData.pickup_available ?? true,
        delivery_available: productData.delivery_available ?? false,
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
        delivery_fee: parseFloat(productData.delivery_fee) || 0,
      },
      reviews_count: 0,
      average_rating: 0,
      metadata: {
        views: 0,
        saved_by: 0,
        last_viewed: null,
      },
    });

    return productRef.id;
  } catch (error) {
    console.error('Create product error:', error);
    throw error;
  }
};

const fetchProductsWithFallback = async (queryConstraints, filterFn = null) => {
  try {
    const q = query(collection(db, PRODUCTS_COLLECTION), ...queryConstraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Query error, using fallback:', error);
    const fallbackSnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const allProducts = fallbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return filterFn ? allProducts.filter(filterFn) : allProducts;
  }
};

export const getProducts = async () => {
  try {
    const products = await fetchProductsWithFallback(
      [where('availability.is_available', '==', true)],
      p => p.availability?.is_available === true || p.availability?.is_available === undefined
    );
    return { products, hasMore: false };
  } catch (error) {
    console.error('Get products error:', error);
    return { products: [], hasMore: false };
  }
};

export const getProductsByCategory = async (category) => {
  try {
    const products = await fetchProductsWithFallback(
      [
        where('category', '==', category),
        where('availability.is_available', '==', true)
      ],
      p => p.category === category && 
           (p.availability?.is_available === true || p.availability?.is_available === undefined)
    );
    return { products, hasMore: false };
  } catch (error) {
    console.error('Get products by category error:', error);
    return { products: [], hasMore: false };
  }
};

export const getProductById = async (productId) => {
  try {
    const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));

    if (productDoc.exists()) {
      try {
        await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
          'metadata.views': increment(1),
          'metadata.last_viewed': serverTimestamp(),
        });
      } catch {
        // Silent fail for view count update
      }

      return { id: productDoc.id, ...productDoc.data() };
    }

    return null;
  } catch (error) {
    console.error('Get product error:', error);
    throw error;
  }
};

export const getSellerProducts = async (sellerId) => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('seller_id', '==', sellerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get seller products error:', error);
    return [];
  }
};

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
    console.error('Update product error:', error);
    throw error;
  }
};

export const updateProductQuantity = async (productId, quantityPurchased) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const productDoc = await getDoc(productRef);
    
    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }
    
    const currentQuantity = productDoc.data().quantity || 0;
    const newQuantity = Math.max(0, currentQuantity - quantityPurchased);
    
    const updates = {
      quantity: newQuantity,
      'availability.updated_at': serverTimestamp(),
    };
    
    if (newQuantity === 0) {
      updates['availability.is_available'] = false;
      updates['availability.sold_at'] = serverTimestamp();
    }
    
    await updateDoc(productRef, updates);
    
    return { 
      previousQuantity: currentQuantity, 
      newQuantity, 
      isSoldOut: newQuantity === 0 
    };
  } catch (error) {
    console.error('Update product quantity error:', error);
    throw error;
  }
};

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

export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    console.error('Delete product error:', error);
    throw error;
  }
};

export const searchProducts = async (searchTerm) => {
  try {
    const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const products = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(product =>
        (product.availability?.is_available !== false) &&
        (product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    return products;
  } catch (error) {
    console.error('Search products error:', error);
    return [];
  }
};