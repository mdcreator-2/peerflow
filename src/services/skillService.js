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
} from 'firebase/firestore';
import { db } from './firebase.config';

const SKILLS_COLLECTION = 'skills';
const BARTER_REQUESTS_COLLECTION = 'barter_requests';

export const createSkill = async (providerId, providerInfo, skillData) => {
  try {
    const skillRef = await addDoc(collection(db, SKILLS_COLLECTION), {
      provider_id: providerId,
      provider_name: providerInfo?.displayName || 'Anonymous',
      provider_avatar: providerInfo?.photoURL || '',
      provider_rating: providerInfo?.ratings?.averageRating || 0,
      skill_name: skillData.skill_name,
      category: skillData.category,
      description: skillData.description,
      proficiency_level: skillData.proficiency_level,
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
        hours_per_session: parseFloat(skillData.hours_per_session) || 1,
        preferred_time: skillData.preferred_time || 'evening',
        available_slots: [],
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

    return skillRef.id;
  } catch (error) {
    console.error('Create skill error:', error);
    throw error;
  }
};

export const getAvailableSkills = async (currentUserId = null) => {
  try {
    const snapshot = await getDocs(collection(db, SKILLS_COLLECTION));
    
    let skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    skills = skills.filter(skill => {
      const isActive = skill.is_active !== false;
      const notCurrentUser = !currentUserId || skill.provider_id !== currentUserId;
      return isActive && notCurrentUser;
    });

    return skills;
  } catch (error) {
    console.error('Get skills error:', error);
    return [];
  }
};

export const getSkillsByCategory = async (category, currentUserId = null) => {
  try {
    const snapshot = await getDocs(collection(db, SKILLS_COLLECTION));
    
    let skills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    skills = skills.filter(skill => {
      const matchesCategory = skill.category === category;
      const isActive = skill.is_active !== false;
      const notCurrentUser = !currentUserId || skill.provider_id !== currentUserId;
      return matchesCategory && isActive && notCurrentUser;
    });

    return skills;
  } catch (error) {
    console.error('Get skills by category error:', error);
    return [];
  }
};

export const getSkillById = async (skillId) => {
  try {
    const skillDoc = await getDoc(doc(db, SKILLS_COLLECTION, skillId));

    if (skillDoc.exists()) {
      return { id: skillDoc.id, ...skillDoc.data() };
    }

    return null;
  } catch (error) {
    console.error('Get skill error:', error);
    throw error;
  }
};

export const getUserSkills = async (userId) => {
  try {
    const q = query(
      collection(db, SKILLS_COLLECTION),
      where('provider_id', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get user skills error:', error);
    return [];
  }
};

export const getSkillMatches = async (userId, userSkills = []) => {
  try {
    const allSkills = await getAvailableSkills(userId);
    
    if (!userSkills || userSkills.length === 0) {
      return allSkills.slice(0, 5);
    }

    const scoredSkills = allSkills.map((skill) => {
      let score = 0;
      
      const preferredSkills = skill.barter_rate?.preferred_skills || [];
      if (preferredSkills.length > 0) {
        const matchCount = preferredSkills.filter((pref) =>
          userSkills.some((us) => 
            us.skill_name?.toLowerCase().includes(pref.toLowerCase()) ||
            pref.toLowerCase().includes(us.skill_name?.toLowerCase())
          )
        ).length;
        score += matchCount * 10;
      }

      score += (skill.average_rating || 0) * 2;

      return { ...skill, matchScore: score };
    });

    return scoredSkills
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  } catch (error) {
    console.error('Skill matching error:', error);
    return [];
  }
};

export const updateSkill = async (skillId, updates) => {
  try {
    await updateDoc(doc(db, SKILLS_COLLECTION, skillId), {
      ...updates,
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update skill error:', error);
    throw error;
  }
};

export const deleteSkill = async (skillId) => {
  try {
    await deleteDoc(doc(db, SKILLS_COLLECTION, skillId));
  } catch (error) {
    console.error('Delete skill error:', error);
    throw error;
  }
};

export const createBarterRequest = async (requestData) => {
  try {
    const requestRef = await addDoc(collection(db, BARTER_REQUESTS_COLLECTION), {
      requester_id: requestData.requester_id,
      requester_name: requestData.requester_name,
      requester_avatar: requestData.requester_avatar || '',
      provider_id: requestData.provider_id,
      provider_name: requestData.provider_name,
      provider_avatar: requestData.provider_avatar || '',
      skill_requested: {
        skill_id: requestData.skill_id,
        skill_name: requestData.skill_name,
        hours_needed: parseInt(requestData.hours_needed) || 1,
        learning_goal: requestData.learning_goal || '',
      },
      skill_offered: {
        skill_name: requestData.offered_skill_name,
        hours_available: parseInt(requestData.hours_available) || 1,
        proficiency_level: requestData.offered_proficiency || 'beginner',
      },
      status: 'pending',
      created_at: serverTimestamp(),
      started_at: null,
      completed_at: null,
      agreed_terms: {},
      sessions_completed: 0,
      notes: requestData.notes || '',
    });

    return requestRef.id;
  } catch (error) {
    console.error('Create barter request error:', error);
    throw error;
  }
};

export const getUserBarterRequests = async (userId) => {
  try {
    const sentQuery = query(
      collection(db, BARTER_REQUESTS_COLLECTION),
      where('requester_id', '==', userId)
    );
    const sentSnapshot = await getDocs(sentQuery);
    const sentRequests = sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const receivedQuery = query(
      collection(db, BARTER_REQUESTS_COLLECTION),
      where('provider_id', '==', userId)
    );
    const receivedSnapshot = await getDocs(receivedQuery);
    const receivedRequests = receivedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { sentRequests, receivedRequests };
  } catch (error) {
    console.error('Get barter requests error:', error);
    return { sentRequests: [], receivedRequests: [] };
  }
};

export const updateBarterRequestStatus = async (requestId, newStatus) => {
  try {
    const updates = {
      status: newStatus,
      updated_at: serverTimestamp(),
    };

    if (newStatus === 'in_progress') {
      updates.started_at = serverTimestamp();
    } else if (newStatus === 'completed') {
      updates.completed_at = serverTimestamp();
    }

    await updateDoc(doc(db, BARTER_REQUESTS_COLLECTION, requestId), updates);
  } catch (error) {
    console.error('Update barter status error:', error);
    throw error;
  }
};