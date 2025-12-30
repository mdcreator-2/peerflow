import React from 'react';
import SkillCard from './SkillCard';
import { SectionLoader } from '../Common/LoadingSpinner';

const SkillsList = ({ skills, loading, emptyMessage = 'No skills found' }) => {
  if (loading) {
    return <SectionLoader />;
  }

  if (! skills || skills.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-lg font-medium text-gray-900">{emptyMessage}</h3>
        <p className="mt-2 text-gray-500">Be the first to offer a skill!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skills.map(skill => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
};

export default SkillsList;