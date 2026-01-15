import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Mic, Monitor, Code, MessageSquare, Play, StopCircle, Volume2, AlertCircle, CheckCircle2, ArrowUpCircle, Sparkles, ChevronRight, Laptop, Timer } from "lucide-react";
import axios from "axios";
import LoginModal from "../components/LoginModal";
import { toast } from "react-toastify";

function InterviewPrep({ user }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [interviewType, setInterviewType] = useState("behavioral");
  const [sessionState, setSessionState] = useState("setup"); // setup, active, completed
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [code, setCode] = useState("// Write your code here...");
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (!user) setShowLoginModal(true);
    return () => stopMedia();
  }, [user]);

  useEffect(() => {
    // Re-attach stream if videoRef changes (e.g., toggling code editor)
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showCodeEditor, sessionState]);

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) recognitionRef.current.stop();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(e => console.error(e));
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      // Mocking multi-question generation for speed/reliability in this demo
      // In prod, this comes from: await axios.post("/interview-questions", ...)
      const mockQuestions = [
        "Tell me about a challenging project you worked on.",
        "How do you handle conflict in a team?",
        "Explain a complex technical concept to a non-technical person."
      ];
      if (interviewType === 'technical') {
        mockQuestions[1] = "What is the difference between TCP and UDP?";
        mockQuestions[2] = "Explain how a REST API works.";
      }
      if (interviewType === 'coding') {
        mockQuestions[0] = "Write a function to reverse a string.";
        mockQuestions[1] = "Explain the time complexity of your solution.";
      }

      setQuestions(mockQuestions);
      setSessionState("active");
      setQuestionIndex(0);
      setTranscript("");

      // Start Camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      // Init Audio Context (Visualizer)
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((src, a) => src + a, 0) / dataArray.length;
        setVolume(avg);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Init Speech Recognition
      if ('webkitSpeechRecognition' in window) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setTranscript(prev => prev + finalTranscript + interimTranscript);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
      } else {
        toast.warn("Speech recognition not supported in this browser.");
      }

      // Speak first question
      speakQuestion(mockQuestions[0]);

    } catch (err) {
      console.error("Error starting interview:", err);
      toast.error("Could not access camera/microphone");
      setSessionState("setup");
    } finally {
      setLoading(false);
    }
  };

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };



  const shareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
      setScreenStream(stream);
      if (screenRef.current) screenRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error sharing screen", err);
    }
  };

  const [timer, setTimer] = useState(120); // 2 minutes per question

  useEffect(() => {
    let interval;
    if (sessionState === 'active' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Optionally auto-advance or just warn
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState, timer]);

  useEffect(() => {
    // Auto-open code editor for coding interviews
    if (sessionState === 'active' && interviewType === 'coding') {
      setShowCodeEditor(true);
    }
  }, [sessionState, interviewType]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      setTimer(120); // Reset timer
      setTranscript("");
      speakQuestion(questions[nextIdx]);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setSessionState("completed");
    stopMedia();
    setLoading(true);
    // Generate Feedback
    try {
      // Simulated feedback call
      setTimeout(() => {
        setFeedback({
          score: 8.5,
          strengths: ["Clear communication", "Good eye contact", "Structured answers"],
          improvements: ["Reduce filler words", "Go deeper into technical details"],
          suggestedAnswer: "Your answer was good, but mentioning specific metrics would improve impact."
        });
        setLoading(false);
      }, 2000);
    } catch (e) {
      toast.error("Failed to generate feedback");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50 dark:bg-[#0a0a14] text-gray-900 dark:text-gray-100">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-outfit mb-2">
            Interactive <span className="text-violet-500">Interview Simulator</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Master your interview skills with real-time AI feedback.
          </p>
        </div>

        {/* Setup Screen */}
        {sessionState === 'setup' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto glass-card p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6">Configure Your Session</h2>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {['behavioral', 'technical', 'coding'].map(type => (
                <button
                  key={type}
                  onClick={() => setInterviewType(type)}
                  className={`p-4 rounded-xl border-2 transition-all font-semibold capitalize ${interviewType === type
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-violet-300'
                    }`}
                >
                  {type} Interview
                </button>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-8 flex items-start gap-3">
              <AlertCircle className="text-blue-500 shrink-0 mt-1" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Ensure you are in a quiet environment. We will request camera and microphone permissions to analyze your performance.
              </p>
            </div>

            <button
              onClick={startInterview}
              disabled={loading}
              className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3"
            >
              {loading ? "Initializing..." : <> <Play fill="currentColor" /> Start Interview </>}
            </button>
          </motion.div>
        )}

        {/* Active Session */}
        {sessionState === 'active' && (
          <div className="grid lg:grid-cols-3 gap-6 h-[80vh]">
            {/* Left Column: Video & Tools */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Timer & Status */}
              <div className="flex items-center justify-between">
                <div className={`px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${timer < 30 ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}>
                  <Timer size={16} />
                  {timer === 0 ? "Time's Up!" : formatTime(timer)}
                </div>
                {timer < 30 && timer > 0 && (
                  <span className="text-sm font-bold text-red-500 animate-bounce">
                    Hurry up!
                  </span>
                )}
              </div>

              {/* Video Feed */}
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl flex-1 min-h-[400px]">
                {screenStream ? (
                  <video ref={screenRef} autoPlay muted className="w-full h-full object-contain" />
                ) : (
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                )}

                {/* Overlays */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                    {isListening ? "REC" : "PAUSED"}
                  </div>
                  <div className="bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-mono">
                    Confidence: {Math.min(100, Math.round(50 + (volume * 1.5)))}%
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="flex gap-1 h-8 items-end">
                    {[1, 2, 3, 4, 5].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: Math.max(20, volume * Math.random() * 2) + '%' }}
                        className="w-1 bg-green-500 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                  className={`flex-1 py-3 rounded-xl font-semibold border transition ${showCodeEditor ? 'bg-violet-600 text-white' : 'glass-card hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <Code className="inline mr-2" /> Code Editor
                </button>
                <button
                  onClick={shareScreen}
                  className="flex-1 py-3 rounded-xl font-semibold glass-card hover:bg-gray-100 dark:hover:bg-gray-800 border transition"
                >
                  <Monitor className="inline mr-2" /> Share Screen
                </button>
                <button
                  onClick={nextQuestion}
                  className="flex-1 py-3 rounded-xl font-semibold bg-violet-600 text-white hover:bg-violet-700 transition shadow-lg shadow-violet-500/30"
                >
                  Next Question <ChevronRight className="inline ml-1" />
                </button>
              </div>
            </div>

            {/* Right Column: Question & Transcript/Code */}
            <div className="flex flex-col gap-4 h-full">
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-violet-500 uppercase tracking-wider mb-2">Question {questionIndex + 1}/{questions.length}</h3>
                <p className="text-xl font-bold text-gray-800 dark:text-white leading-relaxed">
                  {questions[questionIndex]}
                </p>
              </div>

              <div className="glass-card p-4 rounded-2xl flex-1 overflow-hidden flex flex-col">
                {showCodeEditor ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500">JAVASCRIPT</span>
                      <button className="text-xs text-violet-500 hover:underline">Run Code</button>
                    </div>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 w-full bg-[#1e1e2e] text-gray-200 p-4 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <h4 className="text-sm font-bold text-gray-500 mb-2">LIVE TRANSCRIPT</h4>
                    <div className="flex-1 bg-gray-50 dark:bg-black/20 rounded-xl p-4 overflow-y-auto">
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {transcript || <span className="text-gray-400 italic">Listening... Speak clearly...</span>}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {sessionState === 'completed' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <div className="glass-card p-8 rounded-3xl text-center mb-8">
              {loading ? (
                <div className="py-20">
                  <div className="animate-spin w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-6" />
                  <h2 className="text-2xl font-bold">Analyzing your performance...</h2>
                  <p className="text-gray-500">Generating comprehensive feedback report.</p>
                </div>
              ) : feedback && (
                <div className="text-left">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Session Report</h2>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Overall Score</div>
                      <div className="text-4xl font-black text-violet-600">{feedback.score}/10</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800">
                      <h3 className="font-bold text-green-700 dark:text-green-300 mb-4 flex items-center gap-2">
                        <CheckCircle2 /> Strengths
                      </h3>
                      <ul className="space-y-2">
                        {feedback.strengths.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-green-500">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-800">
                      <h3 className="font-bold text-orange-700 dark:text-orange-300 mb-4 flex items-center gap-2">
                        <ArrowUpCircle /> Improvements
                      </h3>
                      <ul className="space-y-2">
                        {feedback.improvements.map((s, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="text-orange-500">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-violet-50 dark:bg-gray-800 p-6 rounded-2xl mb-8">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="text-violet-500" /> AI Coach Feedback
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 italic">"{feedback.suggestedAnswer}"</p>
                  </div>

                  <button onClick={() => setSessionState('setup')} className="w-full btn-primary py-3">
                    Start New Session
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
export default InterviewPrep;
