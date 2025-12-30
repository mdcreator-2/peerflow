import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAvailableSkills, getSkillsByCategory, getSkillMatches } from '../services/skillService';
import { useAuth } from '../hooks/useAuth';
import SkillsList from '../components/SkillBarter/SkillsList';
import SearchBar from '../components/Common/SearchBar';
import { SKILL_CATEGORIES } from '../utils/constants';

const SkillBarter = () => {
  const { isAuthenticated, currentUser, userProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [skills, setSkills] = useState([]);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showMatches, setShowMatches] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, [selectedCategory, currentUser]);

  useEffect(() => {
    if (isAuthenticated && userProfile?. skills?. length > 0) {
      fetchMatches();
    }
  }, [isAuthenticated, userProfile]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      let result;
      if (selectedCategory) {
        result = await getSkillsByCategory(selectedCategory, currentUser?. uid);
      } else {
        result = await getAvailableSkills(currentUser?.uid);
      }
      setSkills(result || []);
    } catch (error) {
      console. error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const matches = await getSkillMatches(currentUser. uid, userProfile. skills);
      setMatchedSkills(matches || []);
    } catch (error) {
      console. error('Error fetching matches:', error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowMatches(false);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) {
      fetchSkills();
      return;
    }

    const filtered = skills.filter(skill =>
      skill.skill_name.toLowerCase().includes(query.toLowerCase()) ||
      skill. description.toLowerCase().includes(query.toLowerCase())
    );
    setSkills(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Skill Barter</h1>
              <p className="text-primary-100 mt-1">Exchange skills with fellow students</p>
            </div>
            {isAuthenticated && (
              <Link to="/post-skill" className="inline-flex items-center px-6 py-3 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Offer a Skill
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="mt-8">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search skills..."
              className="max-w-xl"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Matched Skills Section */}
        {isAuthenticated && matchedSkills.length > 0 && ! selectedCategory && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                🎯 Recommended for You
              </h2>
              <button
                onClick={() => setShowMatches(!showMatches)}
                className="text-sm text-primary-600 hover: text-primary-700"
              >
                {showMatches ? 'Show All' : 'View All Matches'}
              </button>
            </div>
            {! showMatches && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg: grid-cols-3 gap-4">
                {matchedSkills.slice(0, 3).map(skill => (
                  <Link
                    key={skill.id}
                    to={`/skill/${skill. id}`}
                    className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center">
                        {SKILL_CATEGORIES. find(c => c.id === skill. category)?.icon || '✨'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{skill.skill_name}</h3>
                        <p className="text-sm text-gray-500">by {skill.provider_name}</p>
                      </div>
                    </div>
                    {skill.matchScore > 0 && (
                      <p className="text-xs text-primary-600 mt-2">
                        ⚡ High compatibility with your skills
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !selectedCategory
                      ?  'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Skills
                </button>
                {SKILL_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{category. icon}</span>
                    {category. name}
                  </button>
                ))}
              </nav>

              {/* Quick Links */}
              {isAuthenticated && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
                  <nav className="space-y-2">
                    <Link
                      to="/my-skills"
                      className="block text-sm text-gray-600 hover: text-primary-600"
                    >
                      📋 My Skills
                    </Link>
                    <Link
                      to="/barter-requests"
                      className="block text-sm text-gray-600 hover:text-primary-600"
                    >
                      🔄 Barter Requests
                    </Link>
                  </nav>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters */}
            {selectedCategory && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-gray-500">Filters:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-700">
                  {SKILL_CATEGORIES. find(c => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => handleCategoryChange('')}
                    className="ml-2 hover: text-primary-900"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">
              {showMatches ? matchedSkills.length : skills.length} skill{(showMatches ? matchedSkills.length : skills.length) !== 1 ?  's' : ''} found
            </p>

            {/* Skills Grid */}
            <SkillsList
              skills={showMatches ? matchedSkills : skills}
              loading={loading}
              emptyMessage={
                selectedCategory
                  ?  `No skills in ${SKILL_CATEGORIES.find(c => c.id === selectedCategory)?.name}`
                  : 'No skills available.  Be the first to offer one!'
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillBarter;