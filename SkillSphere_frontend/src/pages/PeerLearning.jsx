import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Video, Calendar, MessageCircle, Plus, Clock } from "lucide-react";
import axios from "axios";
import LoginModal from "../components/LoginModal";

function PeerLearning({ user }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [circles, setCircles] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "mock_interview",
    maxParticipants: 4,
    scheduledTime: "",
  });

  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
      loadCircles();
    }
  }, [user]);

  const loadCircles = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/peer-circles");
      setCircles(response.data.circles || []);
    } catch (error) {
      console.error("Error loading circles:", error);
    }
  };

  const createCircle = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      await axios.post("http://127.0.0.1:5000/peer-circles", {
        ...formData,
        creatorId: user.uid,
        creatorName: user.displayName || user.email,
      });
      
      loadCircles();
      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        type: "mock_interview",
        maxParticipants: 4,
        scheduledTime: "",
      });
    } catch (error) {
      console.error("Error creating circle:", error);
    }
  };

  const joinCircle = async (circleId) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      await axios.post(`http://127.0.0.1:5000/peer-circles/${circleId}/join`, {
        userId: user.uid,
        userName: user.displayName || user.email,
      });
      loadCircles();
    } catch (error) {
      console.error("Error joining circle:", error);
      alert(error.response?.data?.error || "Could not join circle");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const circleTypes = [
    { value: "mock_interview", label: "Mock Interview", icon: <Video /> },
    { value: "study_group", label: "Study Group", icon: <Users /> },
    { value: "code_review", label: "Code Review", icon: <MessageCircle /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-teal-900 py-12 px-4">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Peer Learning Circles
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
            Collaborate with peers through mock interviews and study groups
          </p>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Create Learning Circle
          </button>
        </motion.div>

        {/* Create Circle Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Create New Learning Circle
            </h2>
            
            <form onSubmit={createCircle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Circle Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Frontend Interview Practice"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What will you work on together?"
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  >
                    {circleTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    min="2"
                    max="10"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Scheduled Time
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Create Circle
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Circles Grid */}
        {circles.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
            <Users size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              No learning circles yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {circles.map((circle, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      {circleTypes.find(t => t.value === circle.type)?.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {circle.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {circle.creatorName}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    circle.participants?.length >= circle.maxParticipants
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}>
                    {circle.participants?.length || 0}/{circle.maxParticipants}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {circle.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{new Date(circle.scheduledTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{new Date(circle.scheduledTime).toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => joinCircle(circle.id)}
                  disabled={circle.participants?.length >= circle.maxParticipants}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {circle.participants?.includes(user?.uid) ? "Joined" : "Join Circle"}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PeerLearning;
