import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase.config';
import { updateProfile } from 'firebase/auth';

const AVATAR_SERVICES = {
  dicebear: (seed) => `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}`,
  uiAvatars: (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=14b8a6&color=fff&size=200`,
  boringAvatars: (name) => `https://source.boringavatars.com/beam/120/${encodeURIComponent(name)}?colors=14b8a6,0d9488,0f766e`,
};

export const generateAvatarUrl = (name) => {
  return AVATAR_SERVICES.uiAvatars(name || 'User');
};

const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (file.size > 500 * 1024) {
      reject(new Error('Image too large. Please use an image under 500KB.'));
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }

    return null;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    if (auth.currentUser && (updates.displayName || updates.photoURL)) {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName,
        photoURL: updates.photoURL,
      });
    }
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

export const uploadUserAvatar = async (userId, file) => {
  try {
    let url;

    if (file) {
      try {
        url = await imageToBase64(file);
      } catch {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const displayName = userDoc.data()?.displayName || 'User';
        url = generateAvatarUrl(displayName);
      }
    } else {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const displayName = userDoc.data()?.displayName || 'User';
      url = generateAvatarUrl(displayName);
    }

    await updateDoc(doc(db, 'users', userId), {
      photoURL: url,
      updatedAt: serverTimestamp(),
    });

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL: url });
    }

    return url;
  } catch (error) {
    console.error('Upload avatar error:', error);
    throw error;
  }
};

export const addUserSkill = async (userId, skill) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const currentSkills = userDoc.data()?.skills || [];

    await updateDoc(doc(db, 'users', userId), {
      skills: [...currentSkills, skill],
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Add skill error:', error);
    throw error;
  }
};

export const removeUserSkill = async (userId, skillName) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const currentSkills = userDoc.data()?.skills || [];
    const updatedSkills = currentSkills.filter(s => s.skill_name !== skillName);

    await updateDoc(doc(db, 'users', userId), {
      skills: updatedSkills,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Remove skill error:', error);
    throw error;
  }
};

export const updateUserLocation = async (userId, location) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      location: {
        hostel: location.hostel || '',
        room: location.room || '',
      },
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update location error:', error);
    throw error;
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      preferences,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    throw error;
  }
};

export const getPublicUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        displayName: data.displayName,
        photoURL: data.photoURL || generateAvatarUrl(data.displayName),
        bio: data.bio,
        location: data.location,
        ratings: data.ratings,
        skills: data.skills,
        seller_stats: {
          products_listed: data.seller_stats?.products_listed || 0,
          products_sold: data.seller_stats?.products_sold || 0,
        },
        createdAt: data.createdAt,
      };
    }

    return null;
  } catch (error) {
    console.error('Get public profile error:', error);
    throw error;
  }
};