import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, Brain, Star, CheckCircle, XCircle, AlertCircle, Play, Sparkles } from "lucide-react";
import axios from "axios";
import confetti from "canvas-confetti";
import { toast } from "react-toastify";

function QuizArena({ user }) {
    const [loading, setLoading] = useState(false);
    const [quizStarted, setQuizStarted] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [quizTopic, setQuizTopic] = useState("Technology");
    const [leaderboard, setLeaderboard] = useState([
        { name: "Alex Chen", score: 2450, badge: "🏆" },
        { name: "Sarah Jones", score: 2100, badge: "🥈" },
        { name: "Mike Ross", score: 1850, badge: "🥉" },
        { name: "You (Previous)", score: 1200, badge: "⭐" },
    ]);

    // Fetch Leaderboard (Mock for now)
    useEffect(() => {
        // In a real app, fetch from backend
    }, []);

    // Timer Logic
    useEffect(() => {
        if (quizStarted && !showResult && timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (timeLeft === 0 && !showResult) {
            handleTimeUp();
        }
    }, [timeLeft, quizStarted, showResult]);

    const handleTimeUp = () => {
        toast.error("Time's up!");
        handleNextQuestion();
    };

    const startQuiz = async () => {
        setLoading(true);
        try {
            // Direct prompt to LLM via backend for dynamic questions
            // We'll simulate for now if backend isn't ready or use a simple prompt endpoint
            // Using a hardcoded set for guaranteed format, but in prod use /groq endpoint
            const generatedQuestions = [
                {
                    id: 1,
                    question: "What does 'HTTP' stand for in web development?",
                    options: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "HyperText Transmission Process", "Hyperlink Transfer Technology"],
                    answer: "HyperText Transfer Protocol"
                },
                {
                    id: 2,
                    question: "Which data structure uses LIFO (Last In First Out)?",
                    options: ["Queue", "Array", "Stack", "Linked List"],
                    answer: "Stack"
                },
                {
                    id: 3,
                    question: "What is the primary function of a React 'useEffect' hook?",
                    options: ["To manage state", "To perform side effects", "To create context", "To optimize rendering"],
                    answer: "To perform side effects"
                },
                {
                    id: 4,
                    question: "In Python, which keyword is used to define a function?",
                    options: ["func", "def", "definition", "function"],
                    answer: "def"
                },
                {
                    id: 5,
                    question: "What is the time complexity of binary search?",
                    options: ["O(n)", "O(n^2)", "O(log n)", "O(1)"],
                    answer: "O(log n)"
                }
            ];

            // Ideally: const res = await axios.post("/generate-quiz", { topic: quizTopic });

            setQuestions(generatedQuestions);
            setQuizStarted(true);
            setCurrentQuestionIndex(0);
            setScore(0);
            setTimeLeft(30);
            setShowResult(false);
        } catch (error) {
            console.error("Quiz Error", error);
            toast.error("Failed to start quiz.");
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (option) => {
        if (selectedOption) return; // Prevent changing answer
        setSelectedOption(option);

        if (option === questions[currentQuestionIndex].answer) {
            setScore(prev => prev + 100 + (timeLeft * 2)); // Score based on speed
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 }
            });
            toast.success("Correct! +Points");
        } else {
            toast.error("Wrong answer!");
        }

        setTimeout(() => {
            handleNextQuestion();
        }, 1500);
    };

    const handleNextQuestion = () => {
        setSelectedOption(null);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setTimeLeft(30);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        setShowResult(true);
        setQuizStarted(false);
        if (score > 1500) {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 }
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a14] text-gray-900 dark:text-gray-100 py-12 px-4 relative overflow-hidden font-sans">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-fuchsia-500/10 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">

                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-block p-4 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl shadow-xl mb-4"
                    >
                        <Trophy size={40} className="text-white" />
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-2">
                        Quiz Arena
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Compete, Learn, and Climb the Leaderboard!
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Game Area */}
                    <div className="lg:col-span-2 space-y-6">

                        {!quizStarted && !showResult ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-8 text-center"
                            >
                                <h2 className="text-2xl font-bold mb-6">Ready to Challenge Yourself?</h2>

                                <div className="mb-8">
                                    <label className="block text-left font-semibold mb-2 ml-1">Select Topic</label>
                                    <select
                                        value={quizTopic}
                                        onChange={(e) => setQuizTopic(e.target.value)}
                                        className="input-field"
                                    >
                                        <option>Technology</option>
                                        <option>General Knowledge</option>
                                        <option>Science</option>
                                        <option>History</option>
                                    </select>
                                </div>

                                <button
                                    onClick={startQuiz}
                                    disabled={loading}
                                    className="btn-primary w-full py-4 text-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-violet-500/40"
                                >
                                    {loading ? <Timer className="animate-spin" /> : <Play fill="currentColor" />}
                                    Start Quiz
                                </button>
                            </motion.div>
                        ) : showResult ? (
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="glass-card p-8 text-center border-2 border-violet-500/30"
                            >
                                <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-4">
                                    {score} pts
                                </div>
                                <p className="text-gray-500 mb-8">Great job! You've mastered this topic.</p>

                                <div className="flex gap-4">
                                    <button onClick={() => setShowResult(false)} className="btn-secondary w-full">Leaderboard</button>
                                    <button onClick={startQuiz} className="btn-primary w-full">Play Again</button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={currentQuestionIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="glass-card p-8"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm font-bold text-violet-500 tracking-widest uppercase">
                                        Question {currentQuestionIndex + 1}/{questions.length}
                                    </span>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 rounded-full text-violet-700 dark:text-violet-300 font-mono font-bold">
                                        <Timer size={16} /> {timeLeft}s
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold mb-8 leading-snug">
                                    {questions[currentQuestionIndex].question}
                                </h3>

                                <div className="space-y-3">
                                    {questions[currentQuestionIndex].options.map((option, idx) => {
                                        const isSelected = selectedOption === option;
                                        const isCorrect = option === questions[currentQuestionIndex].answer;
                                        let btnClass = "w-full p-4 rounded-xl border-2 text-left font-semibold transition-all duration-200 flex justify-between items-center ";

                                        if (selectedOption) {
                                            if (isCorrect) btnClass += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/40 dark:text-green-200";
                                            else if (isSelected) btnClass += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/40 dark:text-red-200";
                                            else btnClass += "border-gray-200 dark:border-gray-700 opacity-50";
                                        } else {
                                            btnClass += "border-gray-200 dark:border-gray-700 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20";
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionSelect(option)}
                                                className={btnClass}
                                                disabled={!!selectedOption}
                                            >
                                                {option}
                                                {selectedOption && isCorrect && <CheckCircle className="text-green-600" />}
                                                {selectedOption && isSelected && !isCorrect && <XCircle className="text-red-600" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Leaderboard Sidebar */}
                    <div className="glass-card p-6 h-fit sticky top-24">
                        <h3 className="font-bold text-xl mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                            <Trophy className="text-yellow-500" /> Leaderboard
                        </h3>
                        <div className="space-y-4">
                            {leaderboard.map((player, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-400 w-4">{i + 1}</span>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
                                            {player.name.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-sm">{player.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 font-bold text-violet-500">
                                        {player.score}
                                        <span className="text-xs">{player.badge}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-center">
                            <p className="text-sm text-violet-800 dark:text-violet-200 font-medium">
                                Your Rank: <span className="font-bold text-lg">#4</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizArena;
