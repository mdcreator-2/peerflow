import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSkill } from '../../services/skillService';
import { useAuth } from '../../hooks/useAuth';
import { validateSkillForm } from '../../utils/validators';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS, TIME_PREFERENCES } from '../../utils/constants';
import toast from 'react-hot-toast';

const PostSkill = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    skill_name: '',
    description: '',
    category: '',
    proficiency_level: '',
    years_experience: '',
    hours_to_give:  '1',
    hours_to_receive:  '1',
    preferred_skills: '',
    alternative_rate: '',
    days_per_week: '2',
    hours_per_session: '1',
    preferred_time: 'evening',
  });
  const [learningOutcomes, setLearningOutcomes] = useState(['']);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOutcomeChange = (index, value) => {
    const updated = [...learningOutcomes];
    updated[index] = value;
    setLearningOutcomes(updated);
  };

  const addOutcome = () => {
    if (learningOutcomes.length < 5) {
      setLearningOutcomes([...learningOutcomes, '']);
    }
  };

  const removeOutcome = (index) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateSkillForm(formData);
    if (!validation. isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      const skillData = {
        ...formData,
        learning_outcomes: learningOutcomes
          .filter(o => o.trim())
          .map(outcome => ({ outcome, estimated_duration_hours: 1 })),
        preferred_skills: formData.preferred_skills
          .split(',')
          .map(s => s.trim())
          .filter(s => s),
      };

      const skillId = await createSkill(currentUser.uid, userProfile, skillData);
      toast.success('Skill posted successfully!');
      navigate(`/skill/${skillId}`);
    } catch (error) {
      console.error('Error creating skill:', error);
      toast.error('Failed to post skill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6 lg:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Offer a Skill</h1>
          <p className="text-gray-500 mb-6">Share what you can teach and what you'd like to learn in return.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skill Name */}
            <div>
              <label htmlFor="skill_name" className="block text-sm font-medium text-gray-700">
                Skill Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="skill_name"
                name="skill_name"
                value={formData.skill_name}
                onChange={handleChange}
                className={`mt-1 input-field ${errors.skill_name ? 'input-error' : ''}`}
                placeholder="e.g., Guitar Lessons, Python Programming, Graphic Design"
              />
              {errors. skill_name && <p className="mt-1 text-sm text-red-600">{errors. skill_name}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`mt-1 input-field ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe what you'll teach, your teaching style, and what students will learn..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors. description}</p>}
            </div>

            {/* Category & Proficiency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors. category ? 'input-error' : ''}`}
                >
                  <option value="">Select category</option>
                  {SKILL_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat. icon} {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="proficiency_level" className="block text-sm font-medium text-gray-700">
                  Your Proficiency <span className="text-red-500">*</span>
                </label>
                <select
                  id="proficiency_level"
                  name="proficiency_level"
                  value={formData. proficiency_level}
                  onChange={handleChange}
                  className={`mt-1 input-field ${errors.proficiency_level ? 'input-error' : ''}`}
                >
                  <option value="">Select level</option>
                  {PROFICIENCY_LEVELS. map(level => (
                    <option key={level.id} value={level. id}>
                      {level.name} - {level.description}
                    </option>
                  ))}
                </select>
                {errors.proficiency_level && <p className="mt-1 text-sm text-red-600">{errors.proficiency_level}</p>}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <input
                type="number"
                id="years_experience"
                name="years_experience"
                min="0"
                max="50"
                value={formData. years_experience}
                onChange={handleChange}
                className="mt-1 input-field w-32"
                placeholder="0"
              />
            </div>

            {/* Learning Outcomes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What Students Will Learn
              </label>
              <div className="space-y-2">
                {learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => handleOutcomeChange(index, e.target.value)}
                      className="input-field"
                      placeholder={`Learning outcome ${index + 1}`}
                    />
                    {learningOutcomes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOutcome(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {learningOutcomes.length < 5 && (
                <button
                  type="button"
                  onClick={addOutcome}
                  className="mt-2 text-sm text-primary-600 hover: text-primary-700"
                >
                  + Add another outcome
                </button>
              )}
            </div>

            {/* Barter Rate */}
            <div className="bg-primary-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Barter Rate</h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="hours_to_give"
                    min="1"
                    max="10"
                    value={formData.hours_to_give}
                    onChange={handleChange}
                    className="input-field w-20 text-center"
                  />
                  <span className="text-sm text-gray-600">hr of teaching</span>
                </div>
                <span className="text-gray-400">=</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="hours_to_receive"
                    min="1"
                    max="10"
                    value={formData.hours_to_receive}
                    onChange={handleChange}
                    className="input-field w-20 text-center"
                  />
                  <span className="text-sm text-gray-600">hr of learning</span>
                </div>
              </div>
            </div>

            {/* Preferred Skills to Learn */}
            <div>
              <label htmlFor="preferred_skills" className="block text-sm font-medium text-gray-700">
                Skills You Want to Learn (comma separated)
              </label>
              <input
                type="text"
                id="preferred_skills"
                name="preferred_skills"
                value={formData.preferred_skills}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="e.g., Web Development, Photography, Spanish"
              />
              <p className="mt-1 text-xs text-gray-500">
                These help us match you with compatible learners
              </p>
            </div>

            {/* Alternative Rate */}
            <div>
              <label htmlFor="alternative_rate" className="block text-sm font-medium text-gray-700">
                Alternative Compensation (Optional)
              </label>
              <input
                type="text"
                id="alternative_rate"
                name="alternative_rate"
                value={formData.alternative_rate}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="e.g., ₹100/hr or marketplace discount"
              />
            </div>

            {/* Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="days_per_week" className="block text-sm font-medium text-gray-700">
                  Days per Week
                </label>
                <select
                  id="days_per_week"
                  name="days_per_week"
                  value={formData. days_per_week}
                  onChange={handleChange}
                  className="mt-1 input-field"
                >
                  {[1, 2, 3, 4, 5, 6, 7]. map(n => (
                    <option key={n} value={n}>{n} day{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="hours_per_session" className="block text-sm font-medium text-gray-700">
                  Hours per Session
                </label>
                <select
                  id="hours_per_session"
                  name="hours_per_session"
                  value={formData.hours_per_session}
                  onChange={handleChange}
                  className="mt-1 input-field"
                >
                  {[0.5, 1, 1.5, 2, 2.5, 3]. map(n => (
                    <option key={n} value={n}>{n} hour{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="preferred_time" className="block text-sm font-medium text-gray-700">
                  Preferred Time
                </label>
                <select
                  id="preferred_time"
                  name="preferred_time"
                  value={formData.preferred_time}
                  onChange={handleChange}
                  className="mt-1 input-field"
                >
                  {TIME_PREFERENCES. map(time => (
                    <option key={time. id} value={time.id}>
                      {time.name} ({time.time})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Posting...
                  </>
                ) : (
                  'Post Skill'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostSkill;