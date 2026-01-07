import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase.config';

const CAMPUS_DOMAIN = import.meta.env.VITE_CAMPUS_DOMAIN || 'nitp.ac.in';

export const isCampusEmail = (email) => {
  return email.endsWith(`@${CAMPUS_DOMAIN}`);
};

export const signup = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });
    await sendEmailVerification(user);

    const campusVerified = isCampusEmail(email);
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      displayName: displayName,
      photoURL: '',
      bio: '',
      campusId: '',
      emailVerified: false,
      isCampusEmail: campusVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      role: 'buyer',
      location: {
        hostel: '',
        room: '',
      },
      ratings: {
        averageRating: 0,
        totalReviews: 0,
        count: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
      skills: [],
      seller_stats: {
        products_listed: 0,
        products_sold: 0,
        total_sales: 0,
        response_time_hours: 24,
      },
      preferences: {
        notifications_enabled: true,
        payment_method: 'cash',
      },
    });

    return { user, campusVerified };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const signin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Signin error:', error);
    throw error;
  }
};

export const signinWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: CAMPUS_DOMAIN });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      const campusVerified = isCampusEmail(user.email);
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        bio: '',
        campusId: '',
        emailVerified: user.emailVerified,
        isCampusEmail: campusVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: 'buyer',
        location: {
          hostel: '',
          room: '',
        },
        ratings: {
          averageRating: 0,
          totalReviews: 0,
          count: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
        skills: [],
        seller_stats: {
          products_listed: 0,
          products_sold: 0,
          total_sales: 0,
          response_time_hours: 24,
        },
        preferences: {
          notifications_enabled: true,
          payment_method: 'cash',
        },
      });
    }

    return user;
  } catch (error) {
    console.error('Google signin error:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const resendVerificationEmail = async () => {
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    throw error;
  }
};