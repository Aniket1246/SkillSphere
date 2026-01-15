import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, MapPin, Briefcase, Search, BarChart3 } from "lucide-react";
import axios from "axios";

function JobTrendTracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popularRoles, setPopularRoles] = useState([]);

  useEffect(() => {
    loadPopularRoles();
  }, []);

  const loadPopularRoles = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/job-trends/popular");
      setPopularRoles(response.data.roles || []);
    } catch (error) {
      console.error("Error loading popular roles:", error);
    }
  };

  const searchTrends = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/job-trends/search", {
        role: searchQuery,
        location: location,
      });
      setTrends(response.data);
    } catch (error) {
      console.error("Error searching trends:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickSearch = (role) => {
    setSearchQuery(role);
    setLoading(true);

    axios.post("http://127.0.0.1:5000/job-trends/search", {
      role: role,
      location: location,
    })
      .then(response => setTrends(response.data))
      .catch(error => console.error("Error:", error))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a14] text-gray-900 dark:text-gray-100 py-12 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Job Trend Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Real-time insights on job demand, salaries, and market trends
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <form onSubmit={searchTrends} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Job Role / Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Software Engineer, Data Scientist"
                    className="input-field pl-10"
                    required
                  />
                  <Briefcase className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Location (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., San Francisco, Remote"
                    className="input-field pl-10"
                  />
                  <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Search size={20} />
              {loading ? "Searching..." : "Search Trends"}
            </button>
          </form>

          {/* Quick Search Buttons */}
          <div className="mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Popular Searches:</p>
            <div className="flex flex-wrap gap-2">
              {popularRoles.map((role, idx) => (
                <button
                  key={idx}
                  onClick={() => quickSearch(role)}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Results Display */}
        {trends && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Demand Score</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">{trends.demandScore}/100</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {trends.demandTrend === "increasing" ? "📈 Increasing" : "📉 Stable"}
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <DollarSign className="text-blue-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Avg Salary</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{trends.avgSalary}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Range: {trends.salaryRange}
                </p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Briefcase className="text-purple-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Open Positions</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">{trends.openPositions}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Last 30 days
                </p>
              </div>
            </div>

            {/* Top Skills Required */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                <BarChart3 className="text-blue-600" />
                Top Skills Required
              </h3>
              <div className="space-y-3">
                {trends.topSkills?.map((skill, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{skill.name}</span>
                      <span className="text-gray-600 dark:text-gray-400">{skill.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Companies Hiring */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Top Companies Hiring
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {trends.topCompanies?.map((company, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">{company.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{company.openings} openings</p>
                    </div>
                    <span className="text-2xl">{company.logo || "🏢"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Projections */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Growth Projections
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    Next 6 Months
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">{trends.shortTermOutlook}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Next 2-3 Years
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">{trends.longTermOutlook}</p>
                </div>
              </div>
            </div>

            {/* Related Roles */}
            {trends.relatedRoles && (
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                  Related Roles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trends.relatedRoles.map((role, idx) => (
                    <button
                      key={idx}
                      onClick={() => quickSearch(role)}
                      className="px-4 py-2 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-800 transition"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!trends && !loading && (
          <div className="text-center py-12 glass-card rounded-2xl">
            <BarChart3 size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              Search for a job role to see market trends and insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobTrendTracker;
