import React from 'react';
import { Link } from 'react-router-dom';
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/formatters';

const SkillCard = ({ skill }) => {
  const category = SKILL_CATEGORIES.find(c => c.id === skill.category);
  const proficiency = PROFICIENCY_LEVELS.find(p => p.id === skill.proficiency_level);

  return (
    <Link to={`/skill/${skill.id}`} className="card group p-5 hover:border-primary-200 border border-transparent transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl">
            {category?.icon || '✨'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {skill.skill_name}
            </h3>
            <p className="text-sm text-gray-500">{category?.name || 'Other'}</p>
          </div>
        </div>
        {proficiency && (
          <span className="badge badge-primary text-xs">
            {proficiency.name}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {skill.description}
      </p>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-500 mb-1">Barter Rate</p>
        <p className="text-sm font-medium text-gray-900">
          {skill. barter_rate?. hours_to_give || 1} hr teaching = {skill.barter_rate?.hours_to_receive || 1} hr learning
        </p>
        {skill.barter_rate?.preferred_skills?.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Looking for:  {skill.barter_rate.preferred_skills.slice(0, 2).join(', ')}
            {skill.barter_rate.preferred_skills.length > 2 && '... '}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          {skill.provider_avatar ?  (
            <img
              src={skill. provider_avatar}
              alt={skill. provider_name}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
              {skill.provider_name?. charAt(0) || '?'}
            </div>
          )}
          <span>{skill.provider_name}</span>
          {skill.provider_rating > 0 && (
            <span className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-0.5">{skill.provider_rating. toFixed(1)}</span>
            </span>
          )}
        </div>
        <span>{formatRelativeTime(skill.created_at)}</span>
      </div>
    </Link>
  );
};

export default SkillCard;