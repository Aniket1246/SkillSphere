import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Target, Award, TrendingUp, CheckCircle } from "lucide-react";
import axios from "axios";
import LoginModal from "../components/LoginModal";

function LearningGuide({ user }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentSkills, setCurrentSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completedCourses, setCompletedCourses] = useState([]);

  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://127.0.0.1:5000/learning-progress/${user.uid}`);
      setCompletedCourses(response.data.completed || []);
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/learning-guide", {
        userId: user.uid,
        currentSkills,
        targetRole,
      });
      setLearningPath(response.data);
    } catch (error) {
      console.error("Error getting learning path:", error);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (courseId) => {
    try {
      await axios.post("http://127.0.0.1:5000/mark-complete", {
        userId: user.uid,
        courseId,
      });
      setCompletedCourses([...completedCourses, courseId]);
    } catch (error) {
      console.error("Error marking complete:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 py-12 px-4">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Personalized Learning Guide
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Identify skill gaps and get tailored course recommendations
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
              <Target className="text-blue-600" />
              Your Goals
            </h2>
            
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Current Skills
                </label>
                <textarea
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  placeholder="e.g., HTML, CSS, Basic JavaScript"
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Full Stack Developer"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Generate Learning Path"}
              </button>
            </form>

            {completedCourses.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                  🎉 {completedCourses.length} courses completed!
                </p>
              </div>
            )}
          </motion.div>

          {/* Learning Path Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
              <BookOpen className="text-blue-600" />
              Your Learning Path
            </h2>

            {!learningPath && !loading && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <TrendingUp size={64} className="mx-auto mb-4 opacity-50" />
                <p>Enter your skills and goals to get started</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {learningPath && (
              <div className="space-y-6">
                {/* Skill Gaps */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                    Skill Gaps Identified
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {learningPath.skillGaps?.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommended Courses */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                    <Award className="text-yellow-600" />
                    Recommended Courses
                  </h3>
                  <div className="space-y-3">
                    {learningPath.courses?.map((course, idx) => (
                      <div key={idx} className="p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 dark:text-white">{course.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{course.platform}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Duration: {course.duration} | Level: {course.level}
                            </p>
                          </div>
                          {completedCourses.includes(course.id) ? (
                            <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                          ) : (
                            <button
                              onClick={() => markComplete(course.id)}
                              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition flex-shrink-0"
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                {learningPath.certifications && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                      Recommended Certifications
                    </h3>
                    <ul className="space-y-2">
                      {learningPath.certifications.map((cert, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default LearningGuide;
