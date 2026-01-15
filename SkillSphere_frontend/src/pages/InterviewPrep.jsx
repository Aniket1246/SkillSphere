import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Video, Mic, Monitor, Code, MessageSquare, Play, StopCircle } from "lucide-react";
import axios from "axios";
import LoginModal from "../components/LoginModal";

function InterviewPrep({ user }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [interviewType, setInterviewType] = useState("behavioral");
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [transcript, setTranscript] = useState("");
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [user]);

  const startInterview = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      // Get next question
      const response = await axios.post("http://127.0.0.1:5000/interview-question", {
        type: interviewType,
        userId: user.uid,
      });
      setCurrentQuestion(response.data.question);
      
      // Start video/audio
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Could not access camera/microphone");
    }
  };

  const stopInterview = async () => {
    setIsRecording(false);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    // Get AI feedback
    try {
      const response = await axios.post("http://127.0.0.1:5000/interview-feedback", {
        userId: user.uid,
        question: currentQuestion,
        transcript: transcript,
        type: interviewType,
      });
      setFeedback(response.data);
    } catch (error) {
      console.error("Error getting feedback:", error);
    }
  };

  const interviewTypes = [
    { id: "behavioral", name: "Behavioral", icon: <MessageSquare /> },
    { id: "technical", name: "Technical", icon: <Code /> },
    { id: "coding", name: "Coding", icon: <Monitor /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 py-12 px-4">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Interactive Interview Preparation
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Practice with AI-powered mock interviews and get real-time feedback
          </p>
        </motion.div>

        {/* Interview Type Selection */}
        {!isRecording && !feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              Choose Interview Type
            </h2>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {interviewTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setInterviewType(type.id)}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    interviewType === type.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-purple-600 dark:text-purple-400">
                      {React.cloneElement(type.icon, { size: 32 })}
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {type.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={startInterview}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Start Interview
            </button>
          </motion.div>
        )}

        {/* Interview Session */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Video Feed */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                  <Video className="text-purple-600" />
                  Your Video
                </h3>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full rounded-lg bg-gray-900"
                />
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Recording...</span>
                </div>
              </div>

              {/* Question & Controls */}
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                  Interview Question
                </h3>
                <div className="p-6 bg-indigo-50 dark:bg-gray-700 rounded-lg mb-6">
                  <p className="text-gray-800 dark:text-white text-lg">
                    {currentQuestion}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Tips:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• Speak clearly and maintain eye contact</li>
                      <li>• Use the STAR method for behavioral questions</li>
                      <li>• Think out loud for technical problems</li>
                    </ul>
                  </div>

                  <button
                    onClick={stopInterview}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <StopCircle size={20} />
                    End Interview & Get Feedback
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feedback Display */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              AI Feedback
            </h2>

            <div className="space-y-6">
              {/* Overall Score */}
              <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">
                    Overall Score
                  </span>
                  <span className="text-3xl font-bold text-green-600">
                    {feedback.score}/10
                  </span>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-600">
                  ✓ Strengths
                </h3>
                <ul className="space-y-2">
                  {feedback.strengths?.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-orange-600">
                  ⚠ Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {feedback.improvements?.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Answer */}
              {feedback.suggestedAnswer && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
                    Suggested Answer
                  </h3>
                  <div className="p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300">
                      {feedback.suggestedAnswer}
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setFeedback(null);
                  setCurrentQuestion(null);
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Start New Interview
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default InterviewPrep;
