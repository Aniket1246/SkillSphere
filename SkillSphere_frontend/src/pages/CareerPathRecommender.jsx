import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, Target, Sparkles, ArrowRight } from "lucide-react";
import axios from "axios";
import LoginModal from "../components/LoginModal";

function CareerPathRecommender({ user }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    skills: "",
    education: "",
    interests: "",
    experience: "",
  });
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/career-recommend", {
        ...formData,
        userId: user.uid,
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error getting recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-12 px-4">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI Career Path Recommender
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Discover your ideal career path based on your unique profile
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
              <Target className="text-purple-600" />
              Your Profile
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., Python, Communication, Problem Solving"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Education Level
                </label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select...</option>
                  <option value="high_school">High School</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Interests
                </label>
                <textarea
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="What are you passionate about?"
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Experience (years)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Analyzing..." : "Get Recommendations"}
                <ArrowRight size={20} />
              </button>
            </form>
          </motion.div>

          {/* Recommendations Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
              <Sparkles className="text-purple-600" />
              Recommendations
            </h2>

            {!recommendations && !loading && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <Briefcase size={64} className="mx-auto mb-4 opacity-50" />
                <p>Fill out the form to get personalized career recommendations</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            )}

            {recommendations && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                    <Briefcase size={20} className="text-purple-600" />
                    Top Career Paths
                  </h3>
                  <div className="space-y-3">
                    {recommendations.careers?.map((career, idx) => (
                      <div key={idx} className="p-4 bg-purple-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-semibold text-gray-800 dark:text-white">{career.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{career.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                            Match: {career.matchScore}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                    <TrendingUp size={20} className="text-green-600" />
                    Trending Industries
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.trendingIndustries?.map((industry, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                    Next Steps
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.nextSteps?.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CareerPathRecommender;
