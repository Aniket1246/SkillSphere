import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, TrendingUp, Target, Sparkles, ArrowRight, Loader2, CheckCircle, Upload, FileText, DollarSign, Building2, Star } from "lucide-react";
import axios from "axios";
import LoginModal from "../components/LoginModal";

function CareerPathRecommender({ user }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mode, setMode] = useState("form");
  const [formData, setFormData] = useState({
    skills: "",
    education: "",
    interests: "",
    experience: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

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

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!resumeFile) {
      alert("Please select a resume file");
      return;
    }

    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('resume', resumeFile);

      const response = await axios.post("http://127.0.0.1:5000/career-recommend-resume", formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Error analyzing resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
    } else {
      alert("Please select a PDF file");
      e.target.value = null;
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-12 px-4 overflow-hidden">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl"
        />
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
            Get personalized career recommendations and job suggestions
          </p>

          {/* Mode Toggle */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setMode("form")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${mode === "form"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
            >
              📝 Fill Form
            </button>
            <button
              onClick={() => setMode("resume")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${mode === "resume"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
            >
              📄 Upload Resume
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20"
          >
            {mode === "form" ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-gray-800 dark:text-white">
                    <Sparkles className="text-purple-600" />
                    Your Profile
                  </h2>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${s <= step ? 'bg-purple-600 w-8' : 'bg-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">💼 Your Skills</label>
                          <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g., Python, Communication, Problem Solving" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all" required />
                        </div>
                        <button type="button" onClick={nextStep} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
                          Next <ArrowRight size={20} />
                        </button>
                      </motion.div>
                    )}
                    {step === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">🎓 Education Level</label>
                          <select name="education" value={formData.education} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all" required>
                            <option value="">Select...</option>
                            <option value="high_school">High School</option>
                            <option value="bachelors">Bachelor's Degree</option>
                            <option value="masters">Master's Degree</option>
                            <option value="phd">PhD</option>
                          </select>
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={prevStep} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">Back</button>
                          <button type="button" onClick={nextStep} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">Next <ArrowRight size={20} /></button>
                        </div>
                      </motion.div>
                    )}
                    {step === 3 && (
                      <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">❤️ Your Interests</label>
                          <textarea name="interests" value={formData.interests} onChange={handleChange} placeholder="What are you passionate about?" rows="4" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all resize-none" required />
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={prevStep} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">Back</button>
                          <button type="button" onClick={nextStep} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">Next <ArrowRight size={20} /></button>
                        </div>
                      </motion.div>
                    )}
                    {step === 4 && (
                      <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">⏱️ Years of Experience</label>
                          <input type="number" name="experience" value={formData.experience} onChange={handleChange} placeholder="0" min="0" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all" required />
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={prevStep} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">Back</button>
                          <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {loading ? <><Loader2 className="animate-spin" size={20} />Analyzing...</> : <>Get Recommendations <Sparkles size={20} /></>}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
                  <Upload className="text-purple-600" />
                  Upload Resume
                </h2>
                <form onSubmit={handleResumeUpload} className="space-y-6">
                  <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-2xl p-8 text-center hover:border-purple-500 transition-all">
                    <input type="file" id="resume" accept=".pdf" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="resume" className="cursor-pointer block">
                      <FileText size={64} className="mx-auto mb-4 text-purple-400" />
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {resumeFile ? resumeFile.name : "Click to upload your resume (PDF)"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Maximum file size: 10MB
                      </p>
                    </label>
                  </div>
                  <button type="submit" disabled={loading || !resumeFile} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> Analyzing Resume...
                      </>
                    ) : (
                      <>
                        Analyze Resume <Sparkles size={20} />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
              <TrendingUp className="text-purple-600" />
              Your Recommendations
            </h2>

            {!recommendations && !loading && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Briefcase size={64} className="mx-auto mb-4 text-purple-400 opacity-50" />
                </motion.div>
                <p className="text-gray-500 dark:text-gray-400 px-4">
                  {mode === "form" ? "Fill out the form to get recommendations" : "Upload your resume to get personalized recommendations"}
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
                {/* Extracted Info (Resume mode only) */}
                {recommendations.extractedInfo && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">📋 Extracted Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><strong>Name:</strong> {recommendations.extractedInfo.name}</p>
                      <p><strong>Experience:</strong> {recommendations.extractedInfo.experience} years</p>
                      <p><strong>Education:</strong> {recommendations.extractedInfo.education}</p>
                      <p><strong>Role:</strong> {recommendations.extractedInfo.currentRole}</p>
                    </div>
                  </div>
                )}

                {/* Career Paths */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    <Briefcase size={20} className="text-purple-600" />
                    Top Career Paths
                  </h3>
                  <div className="space-y-3">
                    {recommendations.careers?.map((career, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl hover:shadow-lg transition-all group cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-purple-600 transition-colors">{career.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{career.description}</p>
                            {career.fit && <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">✓ {career.fit}</p>}
                          </div>
                          <div className="flex-shrink-0">
                            <div className="relative w-14 h-14">
                              <svg className="transform -rotate-90 w-14 h-14">
                                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200 dark:text-gray-700" />
                                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${2 * Math.PI * 24}`} strokeDashoffset={`${2 * Math.PI * 24 * (1 - career.matchScore / 100)}`} className="text-purple-600 transition-all duration-1000" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-purple-600">{career.matchScore}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Recommended Jobs */}
                {recommendations.recommendedJobs && (
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                      <Building2 size={20} className="text-blue-600" />
                      Recommended Jobs
                    </h3>
                    <div className="space-y-3">
                      {recommendations.recommendedJobs?.map((job, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 dark:text-white">{job.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
                                <Building2 size={14} /> {job.company}
                              </p>
                              <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-2">
                                <DollarSign size={14} /> {job.salary}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{job.requirements}</p>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star size={16} fill="currentColor" />
                              <span className="text-sm font-bold">{job.matchScore}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Industries */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    <TrendingUp size={20} className="text-green-600" />
                    Trending Industries
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.trendingIndustries?.map((industry, idx) => (
                      <motion.span key={idx} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-semibold shadow-lg hover:scale-110 transition-transform cursor-pointer">
                        {industry}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Strengths & Improvements */}
                {recommendations.strengths && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-green-600">✓ Strengths</h3>
                      <ul className="space-y-2">
                        {recommendations.strengths?.map((strength, idx) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-orange-600">⚠ Areas to Improve</h3>
                      <ul className="space-y-2">
                        {recommendations.improvementAreas?.map((area, idx) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-orange-600 flex-shrink-0">•</span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    <CheckCircle size={20} className="text-blue-600" />
                    Next Steps
                  </h3>
                  <ul className="space-y-3">
                    {recommendations.nextSteps?.map((step, idx) => (
                      <motion.li key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
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
