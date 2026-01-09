import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: "🛍️",
      title: "Buy & Sell",
      description:
        "List your unused items or find great deals from fellow students.",
    },
    {
      icon: "🤝",
      title: "Skill Barter",
      description:
        "Exchange skills with peers.  Teach what you know, learn what you need.",
    },
    {
      icon: "🔒",
      title: "Campus Verified",
      description:
        "Trade safely within the NIT Patna community with verified users.",
    },
    {
      icon: "💬",
      title: "Direct Connect",
      description: "Chat directly with buyers and sellers.  No middlemen.",
    },
  ];

  const stats = [
    { value: "500+", label: "Active Users" },
    { value: "1000+", label: "Items Listed" },
    { value: "200+", label: "Skills Shared" },
    { value: "₹50K+", label: "Saved by Students" },
  ];

  const categories = [
    {
      icon: "📱",
      name: "Electronics",
      link: "/marketplace? category=electronics",
    },
    { icon: "📚", name: "Books", link: "/marketplace?category=books" },
    { icon: "👕", name: "Clothing", link: "/marketplace?category=clothing" },
    { icon: "🪑", name: "Furniture", link: "/marketplace?category=furniture" },
    { icon: "💻", name: "Tech Skills", link: "/skills? category=tech" },
    { icon: "🎵", name: "Music", link: "/skills?category=music" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - New Design */}
      <section className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div
              className={`transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-emerald-600 tracking-wide">
                  EXCLUSIVE FOR NIT PATNA
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Your Campus
                <span className="block text-emerald-500 mt-1">
                  Community Hub
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg text-gray-600 max-w-lg leading-relaxed">
                The ultimate marketplace and skill-sharing platform for NIT
                Patna. Buy essentials, sell your extras, and barter skills to
                grow together.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/skills"
                      className="group inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                    >
                      Start Bartering
                      <svg
                        className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                    <Link
                      to="/marketplace"
                      className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold rounded-full border-2 border-gray-300 text-gray-700 hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 hover:scale-105"
                    >
                      Explore Marketplace
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="group inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                    >
                      Start Bartering
                      <svg
                        className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                    <Link
                      to="/marketplace"
                      className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold rounded-full border-2 border-gray-300 text-gray-700 hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 hover:scale-105"
                    >
                      Explore Marketplace
                    </Link>
                  </>
                )}
              </div>

              {/* Social Proof */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[
                    "https://randomuser.me/api/portraits/women/44.jpg",
                    "https://randomuser.me/api/portraits/men/32.jpg",
                    "https://randomuser.me/api/portraits/women/68.jpg",
                  ].map((avatar, i) => (
                    <img
                      key={i}
                      src={avatar}
                      alt="User"
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm">
                  Joined by{" "}
                  <span className="font-semibold text-gray-900">500+</span> NIT
                  Patna students
                </p>
              </div>
            </div>

            {/* Right Content - Image with Floating Cards */}
            <div
              className={`relative transition-all duration-1000 delay-300 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              {/* Main Image Container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Campus students collaborating"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Card - Skill Exchange (Top Right) */}
              <div
                className="absolute -top-4 -right-4 lg:top-6 lg:-right-8 bg-white rounded-xl shadow-xl p-4 animate-float"
                style={{ animationDelay: "0s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🎸</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Skill Exchange
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      Guitar Lessons
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Card - New Listing (Bottom Left) */}
              <div
                className="absolute -bottom-4 -left-4 lg:bottom-12 lg:-left-8 bg-white rounded-xl shadow-xl p-4 animate-float-delayed"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">💻</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      New Listing
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      MacBook Pro M1
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-100 rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>

      {/* Stats Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-primary-600">
                  {stat.value}
                </p>
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
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover: shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sign Up
              </h3>
              <p className="text-gray-600">
                Create an account with your campus email for verified status
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                List or Browse
              </h3>
              <p className="text-gray-600">
                Post items for sale or skills to teach. Find what you need.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect & Exchange
              </h3>
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
            Join hundreds of NIT Patna students already using PeerFlow to buy,
            sell, and share skills.
          </p>
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/create-product"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-colors"
              >
                📦 Sell Something
              </Link>
              <Link
                to="/post-skill"
                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg border-2 border-white text-white hover:bg-white/10 transition-colors"
              >
                🎯 Offer a Skill
              </Link>
            </div>
          ) : (
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-colors"
            >
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
