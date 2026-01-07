import { db } from './firebase.config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Submit a review, only if not reviewed yet
export async function submitSellerReview({ sellerId, sellerName, buyerId, buyerName, rating, comment, orderId }) {
  const reviewId = `${sellerId}_${buyerId}`;
  const reviewRef = doc(db, 'seller_reviews', reviewId);

  // Check for existing review
  const snap = await getDoc(reviewRef);
  if (snap.exists()) {
    throw new Error('You have already reviewed this seller.');
  }

  await setDoc(reviewRef, {
    sellerId,
    sellerName,
    buyerId,
    buyerName,
    rating: Number(rating),   // 1-5
    comment: comment || '',
    orderId,
    date: Date.now(),
  });
}

// Utility to check if already reviewed
export async function hasReviewedSeller(sellerId, buyerId) {
  const reviewId = `${sellerId}_${buyerId}`;
  const snap = await getDoc(doc(db, 'seller_reviews', reviewId));
  return snap.exists();
}