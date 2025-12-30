import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getPublicUserProfile } from '../../services/userService';
import { getSellerProducts } from '../../services/productService';
import { getUserSkills } from '../../services/skillService';
import { formatDate, formatPrice } from '../../utils/formatters';
import { HOSTELS } from '../../utils/constants';
import { PageLoader, SectionLoader } from '../Common/LoadingSpinner';
import ProductCard from '../Marketplace/ProductCard';
import SkillCard from '../SkillBarter/SkillCard';

const UserProfile = () => {
  const { id } = useParams();
  const { currentUser, userProfile:  currentUserProfile } = useAuth();
  
  const isOwnProfile = ! id || id === currentUser?. uid;
  const userId = isOwnProfile ? currentUser?.uid : id;

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      const [profileData, productsData, skillsData] = await Promise.all([
        isOwnProfile ? Promise.resolve(currentUserProfile) : getPublicUserProfile(userId),
        getSellerProducts(userId),
        getUserSkills(userId),
      ]);

      setProfile(profileData);
      setProducts(productsData);
      setSkills(skillsData);
    } catch (error) {
      console. error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (! profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">User not found</h2>
          <Link to="/" className="text-primary-600 hover:text-primary-700 mt-2 block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const hostel = HOSTELS. find(h => h.id === profile.location?. hostel);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm: px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-12">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.displayName}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-primary-100 text-primary-600 flex items-center justify-center text-4xl font-bold shadow-lg">
                    {profile.displayName?. charAt(0) || '? '}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                      {profile. displayName}
                      {profile.isCampusEmail && (
                        <span className="ml-2 text-primary-500" title="Verified Campus Email">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6. 267 3.455a3. 066 3.066 0 001.745-. 723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c. 051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-. 723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-. 723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00. 723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </h1>
                    <p className="text-gray-500">{hostel?.name || 'NIT Patna'}</p>
                  </div>
                  {isOwnProfile && (
                    <Link to="/profile/edit" className="mt-4 sm:mt-0 btn-secondary text-sm">
                      Edit Profile
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{profile.ratings?. averageRating?. toFixed(1) || '0.0'}</p>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{profile.ratings?.totalReviews || 0}</p>
                <p className="text-sm text-gray-500">Reviews</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{profile. seller_stats?.products_sold || 0}</p>
                <p className="text-sm text-gray-500">Items Sold</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{skills.length}</p>
                <p className="text-sm text-gray-500">Skills</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="mt-6">
                <p className="text-gray-600">{profile.bio}</p>
              </div>
            )}

            {/* Skills Tags */}
            {profile.skills?. length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills. map((skill, index) => (
                  <span key={index} className="badge badge-primary">
                    {skill. skill_name}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-4 text-sm text-gray-400">
              Member since {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 px-6 py-4 text-sm font-medium text-center border-b-2 ${
                  activeTab === 'products'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover: text-gray-700'
                }`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`flex-1 px-6 py-4 text-sm font-medium text-center border-b-2 ${
                  activeTab === 'skills'
                    ? 'border-primary-500 text-primary-600'
                    :  'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Skills ({skills.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                {products.length === 0 ?  (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📦</div>
                    <p className="text-gray-500">No products listed yet</p>
                    {isOwnProfile && (
                      <Link to="/create-product" className="btn-primary mt-4 inline-block">
                        List a Product
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products. filter(p => p.availability?. is_available).map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'skills' && (
              <div>
                {skills.length === 0 ?  (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🎯</div>
                    <p className="text-gray-500">No skills offered yet</p>
                    {isOwnProfile && (
                      <Link to="/post-skill" className="btn-primary mt-4 inline-block">
                        Offer a Skill
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {skills.filter(s => s. is_active).map(skill => (
                      <SkillCard key={skill.id} skill={skill} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;