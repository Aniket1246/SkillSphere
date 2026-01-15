import React, { useRef, useState, useEffect } from "react";
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  GraduationCap,
  Brain,
  Target,
  NotebookPen,
  Mic,
  FileText,
  BookOpen,
  Sparkles,
  TrendingUp,
} from "lucide-react";

function Home({ user }) {
  const [loading, setLoading] = useState(true);
  const countersRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      title: "🎯 AI Career Path Recommender",
      desc: "Get personalized career suggestions analyzing your skills, education & interests with trending industry insights.",
      icon: <GraduationCap className="w-8 h-8 text-purple-400" />,
      link: "/career-recommender",
      badge: "NEW",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "📝 AI Resume Builder",
      desc: "Generate ATS-optimized resumes with AI feedback, keyword optimization & professional formatting.",
      icon: <Sparkles className="w-8 h-8 text-blue-400" />,
      link: "/resume-builder",
      badge: "HOT",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "📊 Resume Analyzer",
      desc: "Upload your resume for instant ATS score, improvement tips & keyword analysis.",
      icon: <FileText className="w-8 h-8 text-green-400" />,
      link: "/resume-analyzer",
      badge: "POPULAR",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "📚 Personalized Learning Guide",
      desc: "Identify skill gaps & get tailored course recommendations with progress tracking.",
      icon: <BookOpen className="w-8 h-8 text-orange-400" />,
      link: "/learning-guide",
      badge: "NEW",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "🎤 Interactive Interview Prep",
      desc: "Practice with live video mock interviews, AI feedback & real-time scoring.",
      icon: <Target className="w-8 h-8 text-red-400" />,
      link: "/interview-prep",
      badge: "HOT",
      color: "from-red-500 to-pink-500"
    },
    {
      title: "👤 Career Persona Generator",
      desc: "Create a professional profile summary showcasing your competencies & achievements.",
      icon: <Brain className="w-8 h-8 text-teal-400" />,
      link: "/career-persona",
      badge: "NEW",
      color: "from-teal-500 to-cyan-500"
    },
    {
      title: "💼 Portfolio Builder",
      desc: "Auto-generate stunning HTML/CSS portfolios from your resume & projects.",
      icon: <Sparkles className="w-8 h-8 text-indigo-400" />,
      link: "/portfolio",
      badge: "AMAZING",
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "👥 Peer Learning Circles",
      desc: "Join mock interviews, study groups & code reviews with peers.",
      icon: <Target className="w-8 h-8 text-pink-400" />,
      link: "/peer-learning",
      badge: "NEW",
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "📈 Job Trend Tracker",
      desc: "Real-time job market insights, salary trends & demand scores for any role.",
      icon: <TrendingUp className="w-8 h-8 text-yellow-400" />,
      link: "/job-trends",
      badge: "TRENDING",
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "💬 Career Mentor",
      desc: "Chat with AI for personalized career guidance & advice.",
      icon: <GraduationCap className="w-8 h-8 text-purple-400" />,
      link: "/careercrack",
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "🧠 Mood Mirror",
      desc: "AI emotional support that understands you & tracks your mood.",
      icon: <Brain className="w-8 h-8 text-blue-400" />,
      link: "/moodmirror",
      color: "from-blue-500 to-purple-500"
    },
    {
      title: "🎓 Scholarship Scout",
      desc: "Find perfect scholarships matching your profile & interests.",
      icon: <Target className="w-8 h-8 text-green-400" />,
      link: "/scholarships",
      color: "from-green-500 to-teal-500"
    },
    {
      title: "📓 Smart Notes",
      desc: "AI-powered note organization with tagging & outlines.",
      icon: <NotebookPen className="w-8 h-8 text-orange-400" />,
      link: "/smartnotes",
      color: "from-orange-500 to-yellow-500"
    },
    {
      title: "🎙️ Voice to Text",
      desc: "Transcribe your ideas with AI-powered accuracy.",
      icon: <Mic className="w-8 h-8 text-red-400" />,
      link: "/voicefeedback",
      color: "from-red-500 to-orange-500"
    },
    {
      title: "📚 Resource Vault",
      desc: "Discover & share curated learning resources with the community.",
      icon: <BookOpen className="w-8 h-8 text-cyan-400" />,
      link: "/resourcevault",
      color: "from-cyan-500 to-blue-500"
    },
  ];

  const testimonials = [
    {
      name: "Ananya S.",
      quote:
        "EDGEx helped me discover a career path I never even considered. Life-changing!",
      role: "Class 12, Delhi",
    },
    {
      name: "Rohan M.",
      quote: "MoodMirror is like talking to a friend who truly understands you. So cool!",
      role: "Class 10, Mumbai",
    },
    {
      name: "Sneha T.",
      quote:
        "The scholarship tool got me 3 perfect matches. This is the future of guidance!",
      role: "Commerce Student, Kolkata",
    },
  ];

  const [[index, direction], setIndex] = useState([0, 0]);
  const paginate = (dir) => {
    setIndex(([prev]) => [(prev + dir + testimonials.length) % testimonials.length, dir]);
  };

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const counters = [
    { label: "Students Helped", value: 5700 },
    { label: "Scholarships Found", value: 1300 },
    { label: "Mood Sessions", value: 25000 },
  ];
  const [counts, setCounts] = useState(counters.map(() => 1));
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let lastScrollTop = 0;
    let scrollTimeout = null;
    let hasTriggered = false;

    const handleScroll = () => {
      if (!countersRef.current || isAnimating) return;

      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const rect = countersRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      if (rect.top <= windowHeight * 0.5 && rect.bottom >= windowHeight * 0.5) {
        const isScrolling = Math.abs(currentScrollTop - lastScrollTop) > 10;

        if (isScrolling && !hasTriggered) {
          hasTriggered = true;
          startCounterAnimation();

          setTimeout(() => {
            hasTriggered = false;
          }, 3000);
        }
      }

      lastScrollTop = currentScrollTop;

      scrollTimeout = setTimeout(() => { }, 150);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [isAnimating]);

  const startCounterAnimation = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCounts(counters.map(() => 1));

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const animate = setInterval(() => {
      currentStep++;

      setCounts((prev) => {
        const newCounts = prev.map((num, i) => {
          const target = counters[i].value;
          const progress = currentStep / steps;
          const currentValue = Math.floor(1 + (target - 1) * progress);
          return Math.min(currentValue, target);
        });

        if (currentStep >= steps) {
          clearInterval(animate);
          setTimeout(() => {
            setIsAnimating(false);
          }, 10000);
        }

        return newCounts;
      });
    }, stepDuration);
  };

  const handleStartExploring = () => {
    if (user) {
      navigate('/careercrack');
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-[#0a0a14]">
        <motion.div
          className="w-10 h-10 rounded-full bg-purple-500"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#0a0a14] dark:text-white font-sans overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-6 lg:px-20 flex flex-col items-center text-center">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500 opacity-30 blur-3xl rounded-full z-0"
        />
        <motion.svg
          className="absolute inset-0 w-full h-full z-0 opacity-5"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ y: y1 }}
        >
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </motion.svg>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="z-10 max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white mb-6">
            Think better with <span className="text-purple-400">SkillSphere</span>
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            Your all-in-one AI platform: career mentor, resume builder, interview coach & more.
          </p>
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={handleStartExploring}
              className="bg-purple-600 hover:bg-purple-700 transition px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2"
            >
              Start Exploring <ArrowRight size={18} />
            </button>
            <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white underline flex items-center h-full px-6 py-3 rounded-lg font-semibold">
              Learn More
            </a>
          </div>
        </motion.div>
      </section>

      <section id="features" className="py-20 px-6 lg:px-20 bg-gray-100 dark:bg-[#0e0e1a]">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          🚀 All-in-One Career Development Platform
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
          Everything you need to succeed in your career journey
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto text-gray-900 dark:text-white">
          {features.map((feat, i) => {
            const Card = (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                viewport={{ once: true }}
                className={`relative bg-white dark:bg-[#1a1a2e] backdrop-blur-md p-6 rounded-2xl border-2 border-transparent hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full shadow-lg hover:shadow-2xl overflow-hidden group`}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                {/* Badge */}
                {feat.badge && (
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${feat.color} text-white shadow-lg`}>
                      {feat.badge}
                    </span>
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feat.color} shadow-lg`}>
                      {feat.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                    {feat.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 flex-grow leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="relative z-10 mt-4 flex items-center text-purple-500 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="ml-2" size={18} />
                </div>
              </motion.div>
            );
            return feat.link ? (
              <Link to={feat.link} key={i}>
                {Card}
              </Link>
            ) : (
              <div key={i}>{Card}</div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900 py-16 mt-12 rounded-lg shadow-lg transition-all duration-500">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-12 px-6">
          {/*Video Tutorial for Beginners */}
          <div className="w-full md:w-1/2 flex justify-center md:justify-start">
            <video
              src="/tutorial.mp4"
              alt="MoodMirror Tutorial"
              className="w-full max-w-sm sm:max-w-md md:max-w-full lg:max-w-lg xl:max-w-xl rounded-xl shadow-2xl border-4 border-white/50 dark:border-gray-800 transition-all duration-500"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
          {/*Text Content */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-purple-700 dark:text-purple-300 mb-5 leading-tight">
              Get Your AI Mentor Today!
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-8 text-xl">
              Explore MoodMirror, CareerCrack, and Scholarship Scour - personalized guidance powered by AI, designed for Gen Z.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                to="/moodmirror"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition-all"
              >
                Try MoodMirror Now
              </Link>
              <Link
                to="/careercrack"
                className="px-6 py-3 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold rounded-lg shadow-md transition-all"
              >
                Explore CareerCrack
              </Link>
            </div>
          </div>
        </div>

      </section>
      <section ref={countersRef} className="py-20 bg-white text-center dark:bg-[#0a0a14]">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
          Our Impact So Far 🚀
        </h2>
        {!isAnimating && (
          <div className="mb-6">
            <button
              onClick={startCounterAnimation}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {/* 🎯 Click to Start Counter Animation */}
            </button>
            <div className="text-blue-400 text-sm mt-2">
              {/* 💡 Or scroll to this section to trigger automatically */}
            </div>
          </div>
        )}
        {isAnimating && (
          <div className="text-green-400 text-sm mb-6 animate-pulse">
            {/* 🎯 Animation triggered! Counters are counting up... */}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {counters.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-white dark:bg-gray-800 transition transform hover:scale-105 hover:shadow-lg cursor-pointer"
              title={item.label === "Students Helped"
                ? "Number of students who received guidance"
                : item.label === "Scholarships Found"
                  ? "Scholarships we helped students find"
                  : "Sessions that improved students"}
            >
              <p className="text-4xl font-bold text-purple-400">
                {counts[i].toLocaleString()}+
                {isAnimating && counts[i] === 1 && (
                  <span className="text-green-400 text-sm ml-2">→ Starting...</span>
                )}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 lg:px-20 bg-gray-100 dark:bg-[#0e0e1a]">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">🌟 What Students Say</h2>
        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={index}
              className="bg-white p-8 rounded-xl border border-gray-200 text-gray-900 dark:bg-[#1a1a2e] dark:border-white/10 dark:text-white"
              initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction < 0 ? 300 : -300, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-lg italic mb-4">“{testimonials[index].quote}”</p>
              <p className="font-semibold">{testimonials[index].name}</p>
              <p className="text-sm text-purple-300">{testimonials[index].role}</p>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-between mt-6">
            <button
              onClick={() => paginate(-1)}
              className="text-purple-400 hover:text-purple-600 transition"
            >
              ← Previous
            </button>
            <button
              onClick={() => paginate(1)}
              className="text-purple-400 hover:text-purple-600 transition"
            >
              Next →
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-gray-100 dark:bg-[#12121c] py-20 px-6 lg:px-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/30 blur-[150px] rounded-full z-0" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full z-0" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            Ready to <span className="text-purple-400">level up</span> your journey?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-700 dark:text-gray-400 text-lg mb-8"
          >
            Start exploring SkillSphere’s tools and get ahead in your academic & personal path.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <button
              onClick={handleStartExploring}
              className="inline-block bg-purple-600 hover:bg-purple-700 transition px-8 py-3 text-lg font-semibold rounded-lg text-white shadow-xl"
            >
              Start Now →
            </button>
          </motion.div>
        </div>
      </section>


    </div>
  );
}

export default Home;