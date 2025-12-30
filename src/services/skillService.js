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

const SKILLS_COLLECTION = 'skills';
const BARTER_REQUESTS_COLLECTION = 'barter_requests';

// Create a new skill offering
export const createSkill = async (providerId, providerInfo, skillData) => {
  try {
    const skillRef = await addDoc(collection(db, SKILLS_COLLECTION), {
      provider_id: providerId,
      provider_name: providerInfo. displayName,
      provider_avatar: providerInfo.photoURL || '',
      provider_rating: providerInfo.ratings?. averageRating || 0,
      skill_name: skillData.skill_name,
      category: skillData.category,
      description:  skillData.description,
      proficiency_level: skillData. proficiency_level,
      years_experience: parseInt(skillData.years_experience) || 0,
      learning_outcomes: skillData.learning_outcomes || [],
      barter_rate: {
        hours_to_give: parseInt(skillData.hours_to_give) || 1,
        hours_to_receive: parseInt(skillData.hours_to_receive) || 1,
        preferred_skills: skillData.preferred_skills || [],
        alternative_rate: skillData.alternative_rate || '',
      },
      availability: {
        days_per_week: parseInt(skillData.days_per_week) || 2,
        hours_per_session: parseInt(skillData.hours_per_session) || 1,
        preferred_time:  skillData.preferred_time || 'evening',
        available_slots: skillData.available_slots || [],
      },
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      is_active: true,
      reviews_count: 0,
      average_rating: 0,
      metadata: {
        views: 0,
        requests_received: 0,
        completed_exchanges: 0,
      },
    });

    return skillRef. id;
  } catch (error) {
    console.error('Create skill error:', error);
    throw error;
  }
};

// Get all active skills (excluding current user's)
export const getAvailableSkills = async (userId = null) => {
  try {
    let q = query(
      collection(db, SKILLS_COLLECTION),
      where('is_active', '==', true),
      orderBy('created_at', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    let skills = snapshot.docs.map(doc => ({
      id:  doc.id,
      ...doc.data(),
    }));

    // Filter out current user's skills
    if (userId) {
      skills = skills.filter(skill => skill.provider_id !== userId);
    }

    return skills;
  } catch (error) {
    console. error('Get skills error:', error);
    throw error;
  }
};

// Get skills by category
export const getSkillsByCategory = async (category, userId = null) => {
  try {
    const q = query(
      collection(db, SKILLS_COLLECTION),
      where('category', '==', category),
      where('is_active', '==', true),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    let skills = snapshot.docs.map(doc => ({
      id: doc.id,
      ... doc.data(),
    }));

    if (userId) {
      skills = skills. filter(skill => skill.provider_id !== userId);
    }

    return skills;
  } catch (error) {
    console.error('Get skills by category error:', error);
    throw error;
  }
};

// Get single skill by ID
export const getSkillById = async (skillId) => {
  try {
    const skillDoc = await getDoc(doc(db, SKILLS_COLLECTION, skillId));
    
    if (skillDoc.exists()) {
      // Increment view count
      await updateDoc(doc(db, SKILLS_COLLECTION, skillId), {
        'metadata.views': increment(1),
      });

      return { id: skillDoc. id, ...skillDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Get skill error:', error);
    throw error;
  }
};

// Get user's skills
export const getUserSkills = async (userId) => {
  try {
    const q = query(
      collection(db, SKILLS_COLLECTION),
      where('provider_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc. id,
      ... doc.data(),
    }));
  } catch (error) {
    console. error('Get user skills error:', error);
    throw error;
  }
};

// Update skill
export const updateSkill = async (skillId, updates) => {
  try {
    await updateDoc(doc(db, SKILLS_COLLECTION, skillId), {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console. error('Update skill error:', error);
    throw error;
  }
};

// Delete skill
export const deleteSkill = async (skillId) => {
  try {
    await deleteDoc(doc(db, SKILLS_COLLECTION, skillId));
  } catch (error) {
    console.error('Delete skill error:', error);
    throw error;
  }
};

// Toggle skill active status
export const toggleSkillStatus = async (skillId, isActive) => {
  try {
    await updateDoc(doc(db, SKILLS_COLLECTION, skillId), {
      is_active: isActive,
      updated_at:  serverTimestamp(),
    });
  } catch (error) {
    console.error('Toggle skill status error:', error);
    throw error;
  }
};

// Create barter request
export const createBarterRequest = async (requestData) => {
  try {
    const requestRef = await addDoc(collection(db, BARTER_REQUESTS_COLLECTION), {
      requester_id: requestData.requester_id,
      requester_name: requestData.requester_name,
      requester_avatar: requestData.requester_avatar || '',
      provider_id: requestData.provider_id,
      provider_name: requestData.provider_name,
      provider_avatar: requestData.provider_avatar || '',
      skill_requested:  {
        skill_id: requestData.skill_id,
        skill_name: requestData. skill_name,
        hours_needed: parseInt(requestData.hours_needed) || 1,
        learning_goal: requestData.learning_goal || '',
      },
      skill_offered:  {
        skill_name: requestData.offered_skill_name || '',
        hours_available: parseInt(requestData.hours_available) || 1,
        proficiency_level: requestData.offered_proficiency || 'beginner',
      },
      status: 'pending',
      created_at: serverTimestamp(),
      started_at: null,
      completed_at: null,
      agreed_terms: {
        total_sessions: 0,
        session_duration_hours: 1,
        meeting_location: '',
        start_date: null,
        end_date: null,
      },
      sessions_completed: 0,
      last_session_date: null,
      notes: requestData.notes || '',
    });

    // Update skill metadata
    await updateDoc(doc(db, SKILLS_COLLECTION, requestData.skill_id), {
      'metadata.requests_received': increment(1),
    });

    return requestRef.id;
  } catch (error) {
    console.error('Create barter request error:', error);
    throw error;
  }
};

// Get barter requests for user (both as requester and provider)
export const getUserBarterRequests = async (userId) => {
  try {
    // Get requests where user is requester
    const requesterQuery = query(
      collection(db, BARTER_REQUESTS_COLLECTION),
      where('requester_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    // Get requests where user is provider
    const providerQuery = query(
      collection(db, BARTER_REQUESTS_COLLECTION),
      where('provider_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const [requesterSnapshot, providerSnapshot] = await Promise.all([
      getDocs(requesterQuery),
      getDocs(providerQuery),
    ]);

    const sentRequests = requesterSnapshot.docs.map(doc => ({
      id: doc. id,
      type: 'sent',
      ... doc.data(),
    }));

    const receivedRequests = providerSnapshot.docs.map(doc => ({
      id:  doc.id,
      type: 'received',
      ... doc.data(),
    }));

    return { sentRequests, receivedRequests };
  } catch (error) {
    console.error('Get barter requests error:', error);
    throw error;
  }
};

// Update barter request status
export const updateBarterRequestStatus = async (requestId, status, additionalData = {}) => {
  try {
    const updates = {
      status,
      ...additionalData,
    };

    if (status === 'accepted') {
      updates.started_at = serverTimestamp();
    } else if (status === 'completed') {
      updates.completed_at = serverTimestamp();
    }

    await updateDoc(doc(db, BARTER_REQUESTS_COLLECTION, requestId), updates);
  } catch (error) {
    console.error('Update barter request error:', error);
    throw error;
  }
};

// Skill matching algorithm
export const getSkillMatches = async (userId, userSkills) => {
  try {
    const allSkills = await getAvailableSkills(userId);
    
    if (!userSkills || userSkills.length === 0) {
      // If user has no skills, just return top rated skills
      return allSkills.sort((a, b) => b.average_rating - a. average_rating).slice(0, 5);
    }

    // Score each skill based on compatibility
    const scoredSkills = allSkills.map(skill => {
      let score = 0;

      // Check if provider's preferred skills match user's skills
      const preferredSkills = skill.barter_rate?. preferred_skills || [];
      const userSkillNames = userSkills. map(s => s.skill_name?. toLowerCase() || s.toLowerCase());

      for (const pref of preferredSkills) {
        if (userSkillNames.some(us => us.includes(pref.toLowerCase()) || pref.toLowerCase().includes(us))) {
          score += 20;
        }
      }

      // Boost score for high-rated providers
      score += (skill.average_rating || 0) * 5;

      // Boost score for providers with completed exchanges
      score += (skill.metadata?.completed_exchanges || 0) * 3;

      return { ... skill, matchScore: score };
    });

    // Return top matches
    return scoredSkills
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  } catch (error) {
    console.error('Skill matching error:', error);
    throw error;
  }
};