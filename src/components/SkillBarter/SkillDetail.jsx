import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSkillById, createBarterRequest } from '../../services/skillService';
import { useAuth } from '../../hooks/useAuth';
import { formatRelativeTime } from '../../utils/formatters';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS, TIME_PREFERENCES } from '../../utils/constants';
import { PageLoader } from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const SkillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    hours_needed: '1',
    learning_goal: '',
    offered_skill_name: '',
    hours_available: '1',
    offered_proficiency:  'beginner',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSkill();
  }, [id]);

  const fetchSkill = async () => {
    try {
      const data = await getSkillById(id);
      if (data) {
        setSkill(data);
      } else {
        toast.error('Skill not found');
        navigate('/skills');
      }
    } catch (error) {
      console.error('Error fetching skill:', error);
      toast.error('Error loading skill');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!requestData.offered_skill_name. trim()) {
      toast.error('Please enter a skill you can offer');
      return;
    }

    setSubmitting(true);

    try {
      await createBarterRequest({
        requester_id: currentUser.uid,
        requester_name: userProfile.displayName,
        requester_avatar: userProfile.photoURL,
        provider_id: skill. provider_id,
        provider_name:  skill.provider_name,
        provider_avatar: skill.provider_avatar,
        skill_id: skill.id,
        skill_name: skill.skill_name,
        ... requestData,
      });

      toast.success('Barter request sent! ');
      setShowRequestModal(false);
      navigate('/barter-requests');
    } catch (error) {
      console.error('Error creating barter request:', error);
      toast.error('Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!skill) {
    return null;
  }

  const category = SKILL_CATEGORIES.find(c => c.id === skill.category);
  const proficiency = PROFICIENCY_LEVELS. find(p => p.id === skill. proficiency_level);
  const timePreference = TIME_PREFERENCES.find(t => t.id === skill.availability?. preferred_time);
  const isOwner = currentUser?. uid === skill.provider_id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm: px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/skills" className="hover:text-primary-600">Skills</Link>
          <span>/</span>
          <span className="text-gray-900">{skill.skill_name}</span>
        </nav>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                {category?. icon || '✨'}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">{skill.skill_name}</h1>
                <p className="text-primary-100">{category?.name || 'Other'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {proficiency && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {proficiency.name}
                </span>
              )}
              {skill.years_experience > 0 && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {skill.years_experience} years exp
                </span>
              )}
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {skill.metadata?.completed_exchanges || 0} exchanges completed
              </span>
            </div>
          </div>

          <div className="p-6 lg:p-8">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Skill</h2>
              <p className="text-gray-600 whitespace-pre-line">{skill.description}</p>
            </div>

            {/* Learning Outcomes */}
            {skill.learning_outcomes?. length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h2>
                <ul className="space-y-2">
                  {skill.learning_outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary-500 mt-0.5">✓</span>
                      <span className="text-gray-600">{outcome. outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Barter Rate */}
            <div className="bg-primary-50 rounded-lg p-5 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Barter Rate</h2>
              <div className="flex items-center justify-center space-x-4 text-lg">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">{skill.barter_rate?. hours_to_give || 1}</p>
                  <p className="text-sm text-gray-500">hours teaching</p>
                </div>
                <span className="text-2xl text-gray-400">=</span>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary-600">{skill.barter_rate?.hours_to_receive || 1}</p>
                  <p className="text-sm text-gray-500">hours learning</p>
                </div>
              </div>
              
              {skill.barter_rate?.preferred_skills?. length > 0 && (
                <div className="mt-4 pt-4 border-t border-primary-100">
                  <p className="text-sm text-gray-600 mb-2">Looking to learn: </p>
                  <div className="flex flex-wrap gap-2">
                    {skill.barter_rate.preferred_skills. map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {skill.barter_rate?.alternative_rate && (
                <p className="mt-4 text-sm text-gray-600">
                  <span className="font-medium">Alternative: </span> {skill. barter_rate. alternative_rate}
                </p>
              )}
            </div>

            {/* Availability */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Availability</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-900">{skill.availability?.days_per_week || 2}</p>
                  <p className="text-sm text-gray-500">days/week</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-gray-900">{skill.availability?.hours_per_session || 1}</p>
                  <p className="text-sm text-gray-500">hrs/session</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-gray-900">{timePreference?.name || 'Flexible'}</p>
                  <p className="text-sm text-gray-500">preferred time</p>
                </div>
              </div>
            </div>

            {/* Provider Info */}
            <div className="bg-gray-50 rounded-lg p-5 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About the Teacher</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {skill.provider_avatar ?  (
                    <img
                      src={skill.provider_avatar}
                      alt={skill.provider_name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-medium">
                      {skill.provider_name?. charAt(0) || '? '}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{skill.provider_name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{skill.provider_rating?. toFixed(1) || 'New'}</span>
                      <span className="mx-2">•</span>
                      <span>Joined {formatRelativeTime(skill.created_at)}</span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/user/${skill.provider_id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  View Profile
                </Link>
              </div>
            </div>

            {/* Actions */}
            {! isOwner && skill.is_active && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="w-full btn-primary py-3 text-lg"
              >
                🤝 Request to Learn
              </button>
            )}

            {isOwner && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  This is your skill listing. {' '}
                  <Link to={`/edit-skill/${skill.id}`} className="font-medium underline">
                    Edit listing
                  </Link>
                </p>
              </div>
            )}

            {! skill.is_active && (
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  This skill is currently inactive. 
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRequestModal(false)} />

            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-auto p-6 z-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Request to Learn</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What skill can you offer in exchange?  <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="offered_skill_name"
                    value={requestData. offered_skill_name}
                    onChange={handleRequestChange}
                    className="input-field"
                    placeholder="e.g., Web Development, Photography"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your proficiency
                    </label>
                    <select
                      name="offered_proficiency"
                      value={requestData. offered_proficiency}
                      onChange={handleRequestChange}
                      className="input-field"
                    >
                      {PROFICIENCY_LEVELS.map(level => (
                        <option key={level.id} value={level. id}>{level.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hours you can offer
                    </label>
                    <input
                      type="number"
                      name="hours_available"
                      min="1"
                      max="20"
                      value={requestData.hours_available}
                      onChange={handleRequestChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours of {skill.skill_name} you need
                  </label>
                  <input
                    type="number"
                    name="hours_needed"
                    min="1"
                    max="20"
                    value={requestData.hours_needed}
                    onChange={handleRequestChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What do you want to achieve?
                  </label>
                  <textarea
                    name="learning_goal"
                    rows={2}
                    value={requestData.learning_goal}
                    onChange={handleRequestChange}
                    className="input-field"
                    placeholder="Your learning goals..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={requestData.notes}
                    onChange={handleRequestChange}
                    className="input-field"
                    placeholder="Any other information..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 btn-primary"
                  >
                    {submitting ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillDetail;