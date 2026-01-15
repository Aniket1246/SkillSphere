import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, TrendingUp, Target, Sparkles, ArrowRight, Loader2, CheckCircle, FileText } from "lucide-react";
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
  const [step, setStep] = useState(1);
  const [importingResume, setImportingResume] = useState(false);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingResume(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        // Call backend to extract data
        const response = await axios.post("http://127.0.0.1:5000/parse-resume-data", {
          resumeText: text
        });

        const { data } = response.data;

        // Auto-fill form
        setFormData(prev => ({
          ...prev,
          skills: data.skills || prev.skills,
          // Map other fields if possible, or just skills/bio
          interests: data.bio ? `Derived from bio: ${data.bio}` : prev.interests
        }));

        toast.success("Form auto-filled from resume!");
      } catch (err) {
        console.error("Resume parse error", err);
        toast.error("Failed to parse resume.");
      } finally {
        setImportingResume(false);
      }
    };

    if (file.name.endsWith('.pdf')) {
      // PDF handling handled in ResumeAnalyzer usually, for now simplified to text
      toast.info("For best results, upload .txt for now, or ensure PDF parsing is enabled.");
      // We'd need pdf.js here similar to ResumeAnalyzer. 
      // For "One-Click" let's assume text for MVP or re-use logic.
      // Let's just mock read text for non-text files for safety or warn.
    }
    reader.readAsText(file);
  };

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

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a14] text-gray-900 dark:text-gray-100 py-12 px-4 overflow-hidden relative">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-violet-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-fuchsia-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="inline-block mb-4"
          >
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl">
              <Target className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            AI Career Path Recommender
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base md:text-xl max-w-2xl mx-auto px-4">
            Discover your ideal career path with AI-powered insights tailored to your unique profile
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
                <Sparkles className="text-purple-600" />
                Input Your Profile
              </h2>
              <div className="relative">
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".txt,.md"
                  onChange={handleResumeUpload}
                />
                <label
                  htmlFor="resume-upload"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all ${importingResume
                    ? "bg-gray-100 text-gray-400 cursor-wait"
                    : "bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300"
                    }`}
                >
                  {importingResume ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {importingResume ? "Analyzing..." : "Auto-fill from Resume"}
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${s <= step ? 'bg-purple-600 w-8' : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>


            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        💼 Your Skills
                      </label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="e.g., Python, Communication, Problem Solving"
                        className="input-field"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      Next <ArrowRight size={20} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        🎓 Education Level
                      </label>
                      <select
                        name="education"
                        value={formData.education}
                        onChange={handleChange}
                        className="input-field"
                        required
                      >
                        <option value="">Select...</option>
                        <option value="high_school">High School</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">PhD</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 btn-secondary"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        Next <ArrowRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        ❤️ Your Interests
                      </label>
                      <textarea
                        name="interests"
                        value={formData.interests}
                        onChange={handleChange}
                        placeholder="What are you passionate about?"
                        rows="4"
                        className="input-field resize-none"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 btn-secondary"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        Next <ArrowRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        ⏱️ Years of Experience
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 btn-secondary"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            Get Recommendations <Sparkles size={20} />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Recommendations Display */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card p-6 md:p-8"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
              <TrendingUp className="text-purple-600" />
              Your Recommendations
            </h2>

            {!recommendations && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Briefcase size={64} className="mx-auto mb-4 text-purple-400 opacity-50" />
                </motion.div>
                <p className="text-gray-500 dark:text-gray-400 px-4">
                  Fill out the form to get personalized career recommendations
                </p>
              </motion.div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="animate-spin h-16 w-16 text-purple-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Analyzing your profile...</p>
              </div>
            )}

            {recommendations && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 max-h-[600px] overflow-y-auto pr-2"
              >
                {/* Top Career Paths */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    <Briefcase size={20} className="text-purple-600" />
                    Top Career Paths
                  </h3>
                  <div className="space-y-3">
                    {recommendations.careers?.map((career, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-purple-600 transition-colors">
                              {career.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {career.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="relative w-14 h-14">
                              <svg className="transform -rotate-90 w-14 h-14">
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="24"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  className="text-gray-200 dark:text-gray-700"
                                />
                                <circle
                                  cx="28"
                                  cy="28"
                                  r="24"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 24}`}
                                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - career.matchScore / 100)}`}
                                  className="text-purple-600 transition-all duration-1000"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-purple-600">
                                  {career.matchScore}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Trending Industries */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    <TrendingUp size={20} className="text-green-600" />
                    Trending Industries
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.trendingIndustries?.map((industry, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold shadow-lg hover:scale-110 transition-transform cursor-pointer"
                      >
                        {industry}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    <CheckCircle size={20} className="text-blue-600" />
                    Next Steps
                  </h3>
                  <ul className="space-y-3">
                    {recommendations.nextSteps?.map((step, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3 text-gray-700 dark:text-gray-300 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <CheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{step}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CareerPathRecommender;
