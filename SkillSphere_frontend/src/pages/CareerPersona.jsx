import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Briefcase, Award, Target, Download, Share2 } from "lucide-react";
import axios from "axios";
import LoginModal from "../components/LoginModal";

function CareerPersona({ user }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    currentRole: "",
    experience: "",
    skills: "",
    achievements: "",
    goals: "",
  });

  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
      loadPersona();
    }
  }, [user]);

  const loadPersona = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://127.0.0.1:5000/career-persona/${user.uid}`);
      if (response.data.persona) {
        setPersona(response.data.persona);
      }
    } catch (error) {
      console.error("Error loading persona:", error);
    }
  };

  const generatePersona = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/generate-persona", {
        userId: user.uid,
        ...formData,
      });
      setPersona(response.data.persona);
    } catch (error) {
      console.error("Error generating persona:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sharePersona = () => {
    const url = `${window.location.origin}/persona/${user.uid}`;
    navigator.clipboard.writeText(url);
    alert("Persona link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-teal-900 dark:to-cyan-900 py-12 px-4">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Career Persona Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Create a professional summary of your career profile
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          {!persona && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
                <User className="text-teal-600" />
                Your Information
              </h2>
              
              <form onSubmit={generatePersona} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Current Role
                  </label>
                  <input
                    type="text"
                    name="currentRole"
                    value={formData.currentRole}
                    onChange={handleChange}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Key Skills
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="List your top skills"
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Key Achievements
                  </label>
                  <textarea
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleChange}
                    placeholder="Your proudest accomplishments"
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Career Goals
                  </label>
                  <textarea
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    placeholder="Where do you want to be?"
                    rows="2"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Persona"}
                </button>
              </form>
            </motion.div>
          )}

          {/* Persona Display */}
          {persona && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Your Career Persona
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={sharePersona}
                    className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                  >
                    <Share2 size={20} />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Header */}
                <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {persona.name}
                  </h3>
                  <p className="text-xl text-teal-600 dark:text-teal-400">
                    {persona.title}
                  </p>
                </div>

                {/* Professional Summary */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                    <Briefcase className="text-teal-600" size={20} />
                    Professional Summary
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {persona.summary}
                  </p>
                </div>

                {/* Core Competencies */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                    <Award className="text-teal-600" size={20} />
                    Core Competencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.competencies?.map((comp, idx) => (
                      <span key={idx} className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded-full text-sm">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Career Highlights */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800 dark:text-white">
                    <Target className="text-teal-600" size={20} />
                    Career Highlights
                  </h4>
                  <ul className="space-y-2">
                    {persona.highlights?.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-teal-600 mt-1">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Career Trajectory */}
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                    Career Trajectory
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {persona.trajectory}
                  </p>
                </div>

                <button
                  onClick={() => setPersona(null)}
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Create New Persona
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CareerPersona;
