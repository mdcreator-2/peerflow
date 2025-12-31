import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '🛍️',
      title: 'Buy & Sell',
      description: 'List your unused items or find great deals from fellow students.',
    },
    {
      icon: '🤝',
      title: 'Skill Barter',
      description: 'Exchange skills with peers.  Teach what you know, learn what you need.',
    },
    {
      icon: '🔒',
      title: 'Campus Verified',
      description:  'Trade safely within the NIT Patna community with verified users.',
    },
    {
      icon: '💬',
      title:  'Direct Connect',
      description:  'Chat directly with buyers and sellers.  No middlemen.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Active Users' },
    { value: '1000+', label:  'Items Listed' },
    { value: '200+', label: 'Skills Shared' },
    { value: '₹50K+', label: 'Saved by Students' },
  ];

  const categories = [
    { icon: '📱', name: 'Electronics', link: '/marketplace? category=electronics' },
    { icon:  '📚', name: 'Books', link:  '/marketplace?category=books' },
    { icon: '👕', name: 'Clothing', link:  '/marketplace?category=clothing' },
    { icon: '🪑', name: 'Furniture', link: '/marketplace?category=furniture' },
    { icon: '💻', name: 'Tech Skills', link: '/skills? category=tech' },
    { icon: '🎵', name: 'Music', link: '/skills?category=music' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Campus Marketplace
              <span className="block text-primary-200 mt-2">+ Skill Barter</span>
            </h1>
            <p className="mt-6 text-xl text-primary-100 max-w-2xl mx-auto">
              Buy, sell, and exchange skills within the NIT Patna community. 
              Save money, reduce waste, and build connections.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/marketplace" className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-colors">
                    Browse Marketplace
                  </Link>
                  <Link to="/skills" className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg border-2 border-white text-white hover: bg-white/10 transition-colors">
                    Explore Skills
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg bg-white text-primary-700 hover: bg-primary-50 transition-colors">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg border-2 border-white text-white hover: bg-white/10 transition-colors">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="relative h-16">
          <svg className="absolute bottom-0 w-full h-16 text-gray-50" preserveAspectRatio="none" viewBox="0 0 1440 54">
            <path fill="currentColor" d="M0 22L60 16. 7C120 11 240 1. 00001 360 0.700012C480 1.00001 600 11 720 21.3C840 32 960 43 1080 43C1200 43 1320 32 1380 27.3L1440 22V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-primary-600">{stat.value}</p>
                <p className="text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              A complete platform for campus commerce and skill exchange
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover: shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg: text-4xl font-bold text-gray-900">
              Popular Categories
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <p className="font-medium text-gray-900">{category.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create an account with your campus email for verified status
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">List or Browse</h3>
              <p className="text-gray-600">
                Post items for sale or skills to teach. Find what you need. 
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect & Exchange</h3>
              <p className="text-gray-600">
                Meet on campus, complete the exchange, and leave a review
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm: px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg: text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of NIT Patna students already using PeerFlow to buy, sell, and share skills.
          </p>
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/create-product" className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-colors">
                📦 Sell Something
              </Link>
              <Link to="/post-skill" className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg border-2 border-white text-white hover:bg-white/10 transition-colors">
                🎯 Offer a Skill
              </Link>
            </div>
          ) : (
            <Link to="/signup" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-colors">
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;