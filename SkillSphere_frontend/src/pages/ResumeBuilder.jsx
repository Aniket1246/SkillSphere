import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import jsPDF from 'jspdf';
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  FolderGit2,
  Target,
  Sparkles,
  Download,
  FileText,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Search,
  Lightbulb,
  X,
  Plus,
  Loader2,
} from 'lucide-react';

// ============ SKILL TAG INPUT COMPONENT ============
function SkillTagInput({ skills, setSkills, placeholder = "Add a skill..." }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const newSkill = inputValue.trim();
      if (!skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const suggestedSkills = [
    'React', 'Python', 'JavaScript', 'Node.js', 'SQL', 'AWS',
    'Machine Learning', 'Data Analysis', 'Communication', 'Leadership'
  ];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 min-h-[48px] focus-within:ring-2 focus-within:ring-purple-500 transition-all">
        {skills.map((skill, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
        />
      </div>
      {skills.length === 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Quick add:</span>
          {suggestedSkills.slice(0, 5).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => setSkills([...skills, skill])}
              className="text-xs px-2 py-1 rounded-full border border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
            >
              + {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ SCORE RING COMPONENT ============
function ScoreRing({ score, label, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (s) => {
    if (s >= 80) return { stroke: '#22c55e', bg: 'from-green-500/20 to-emerald-500/20', text: 'text-green-500' };
    if (s >= 60) return { stroke: '#eab308', bg: 'from-yellow-500/20 to-orange-500/20', text: 'text-yellow-500' };
    return { stroke: '#ef4444', bg: 'from-red-500/20 to-orange-500/20', text: 'text-red-500' };
  };

  const colors = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            className="text-gray-200 dark:text-gray-700"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <motion.circle
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-2xl font-bold ${colors.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
    </div>
  );
}

// ============ MAIN RESUME BUILDER COMPONENT ============
export default function ResumeBuilder() {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    skills: [],
    experience: '',
    projects: '',
    targetRole: '',
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeSection, setActiveSection] = useState('form');

  const resumeRef = useRef(null);
  const analysisRef = useRef(null);

  // Target Role Suggestions
  const rolesSuggestions = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'DevOps Engineer',
    'Machine Learning Engineer',
    'Full Stack Developer',
    'Business Analyst',
  ];

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate Form
  const validateForm = () => {
    const required = ['fullName', 'education', 'targetRole'];
    for (const field of required) {
      if (!formData[field].trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (formData.skills.length === 0) {
      toast.error('Please add at least one skill');
      return false;
    }
    return true;
  };

  // Generate Resume with AI
  const generateResume = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setGeneratedResume(null);
    setAnalysis(null);

    const systemPrompt = `You are an expert resume writer and ATS optimization specialist. 
Your task is to generate a professional, ATS-friendly resume AND provide detailed analysis.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "resume": {
    "header": {
      "name": "Full Name",
      "role": "Target Role Title",
      "contact": "email@email.com | +1234567890"
    },
    "summary": "2-3 sentence professional summary highlighting key strengths for the target role...",
    "skills": ["Skill 1", "Skill 2", "..."],
    "experience": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "duration": "Date Range",
        "achievements": ["Achievement 1 with quantifiable impact", "Achievement 2..."]
      }
    ],
    "projects": [
      {
        "name": "Project Name",
        "description": "Brief description with technologies used and impact",
        "technologies": ["Tech1", "Tech2"]
      }
    ],
    "education": {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Year or Date Range"
    }
  },
  "analysis": {
    "overallScore": 75,
    "atsScore": 80,
    "missingKeywords": [
      {"keyword": "Keyword", "importance": "High/Medium/Low", "reason": "Why this keyword matters for the role"}
    ],
    "skillGaps": [
      {"skill": "Missing Skill", "priority": "High/Medium/Low", "reason": "Why this skill is important"}
    ],
    "suggestions": [
      {"category": "Content/Format/Keywords", "suggestion": "Specific improvement suggestion", "impact": "How this will improve the resume"}
    ],
    "strengths": ["Strength 1", "Strength 2"]
  }
}`;

    const userPrompt = `Create an ATS-optimized resume and analysis for:

Full Name: ${formData.fullName}
Email: ${formData.email || 'Not provided'}
Phone: ${formData.phone || 'Not provided'}
Target Role: ${formData.targetRole}

Education:
${formData.education}

Skills:
${formData.skills.join(', ')}

Experience:
${formData.experience || 'No experience provided - create entry-level focused resume'}

Projects:
${formData.projects || 'No projects provided'}

Requirements:
1. Make the resume ATS-friendly with relevant keywords for ${formData.targetRole}
2. Use action verbs and quantifiable achievements
3. Score should reflect: keyword optimization, format cleanliness, content relevance
4. Identify 3-5 missing keywords critical for this role
5. Identify 2-4 skill gaps
6. Provide 3-5 actionable improvement suggestions`;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'}/groq`,
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }
      );

      const content = response.data.choices[0].message.content;

      // Parse the JSON response
      let parsed;
      try {
        // Extract JSON from potential markdown code blocks
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
          content.match(/```\s*([\s\S]*?)\s*```/) ||
          [null, content];
        parsed = JSON.parse(jsonMatch[1] || content);
      } catch (parseErr) {
        console.error('Failed to parse AI response:', parseErr);
        // Fallback mock data
        parsed = generateMockData();
      }

      setGeneratedResume(parsed.resume);
      setAnalysis(parsed.analysis);
      setActiveSection('resume');

      toast.success('Resume generated successfully! ✨');

      setTimeout(() => {
        resumeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      console.error('AI generation error:', err);
      toast.error('Failed to generate resume. Using demo data.');

      // Use mock data as fallback
      const mock = generateMockData();
      setGeneratedResume(mock.resume);
      setAnalysis(mock.analysis);
      setActiveSection('resume');
    } finally {
      setLoading(false);
    }
  };

  // Generate Mock Data (fallback)
  const generateMockData = () => ({
    resume: {
      header: {
        name: formData.fullName,
        role: formData.targetRole,
        contact: `${formData.email || 'email@example.com'} | ${formData.phone || '+1 (555) 000-0000'}`
      },
      summary: `Results-driven ${formData.targetRole} with expertise in ${formData.skills.slice(0, 3).join(', ')}. Passionate about delivering innovative solutions and driving business impact through technology.`,
      skills: formData.skills,
      experience: formData.experience ? [
        {
          title: formData.targetRole,
          company: 'Previous Company',
          duration: '2022 - Present',
          achievements: [
            'Led development of key features resulting in 30% improvement in user engagement',
            'Collaborated with cross-functional teams to deliver projects on time',
            'Implemented best practices reducing bug reports by 25%'
          ]
        }
      ] : [],
      projects: formData.projects ? [
        {
          name: 'Portfolio Project',
          description: 'Built a full-stack application demonstrating expertise in modern technologies',
          technologies: formData.skills.slice(0, 3)
        }
      ] : [],
      education: {
        degree: formData.education.split('\n')[0] || 'Bachelor\'s Degree',
        institution: 'University',
        year: '2023'
      }
    },
    analysis: {
      overallScore: 72,
      atsScore: 68,
      missingKeywords: [
        { keyword: 'Agile', importance: 'High', reason: 'Most companies use Agile methodologies' },
        { keyword: 'CI/CD', importance: 'Medium', reason: 'Shows understanding of modern development practices' },
        { keyword: 'REST API', importance: 'High', reason: 'Essential for backend development roles' }
      ],
      skillGaps: [
        { skill: 'Cloud Platforms (AWS/GCP)', priority: 'High', reason: 'Cloud skills are in high demand' },
        { skill: 'Testing/TDD', priority: 'Medium', reason: 'Shows code quality awareness' }
      ],
      suggestions: [
        { category: 'Content', suggestion: 'Add quantifiable metrics to achievements', impact: 'Increases credibility and ATS score by 15%' },
        { category: 'Keywords', suggestion: 'Include more industry-specific terminology', impact: 'Improves ATS matching by 20%' },
        { category: 'Format', suggestion: 'Use consistent bullet point formatting', impact: 'Better ATS parsing and readability' }
      ],
      strengths: [
        'Strong technical skill set',
        'Clear education background',
        'Relevant project experience'
      ]
    }
  });

  // Download Resume as PDF
  const downloadPDF = () => {
    if (!generatedResume) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 50;
    let y = 50;

    // Header - Name
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(88, 28, 135); // Purple
    doc.text(generatedResume.header.name, margin, y);
    y += 25;

    // Header - Role
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(generatedResume.header.role, margin, y);
    y += 18;

    // Header - Contact
    doc.setFontSize(10);
    doc.text(generatedResume.header.contact, margin, y);
    y += 30;

    // Divider
    doc.setDrawColor(167, 139, 250);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 25;

    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(88, 28, 135);
    doc.text('PROFESSIONAL SUMMARY', margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(generatedResume.summary, pageWidth - margin * 2);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 14 + 20;

    // Skills
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(88, 28, 135);
    doc.text('SKILLS', margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(10);
    const skillsText = generatedResume.skills.join(' • ');
    const skillsLines = doc.splitTextToSize(skillsText, pageWidth - margin * 2);
    doc.text(skillsLines, margin, y);
    y += skillsLines.length * 14 + 20;

    // Experience
    if (generatedResume.experience && generatedResume.experience.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(88, 28, 135);
      doc.text('EXPERIENCE', margin, y);
      y += 18;

      generatedResume.experience.forEach(exp => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 65, 81);
        doc.setFontSize(11);
        doc.text(`${exp.title} | ${exp.company}`, margin, y);
        y += 14;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(exp.duration, margin, y);
        y += 14;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        exp.achievements.forEach(achievement => {
          const lines = doc.splitTextToSize(`• ${achievement}`, pageWidth - margin * 2 - 10);
          doc.text(lines, margin + 10, y);
          y += lines.length * 12;
        });
        y += 10;
      });
      y += 10;
    }

    // Projects
    if (generatedResume.projects && generatedResume.projects.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(88, 28, 135);
      doc.text('PROJECTS', margin, y);
      y += 18;

      generatedResume.projects.forEach(project => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 65, 81);
        doc.setFontSize(11);
        doc.text(project.name, margin, y);
        y += 14;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const descLines = doc.splitTextToSize(project.description, pageWidth - margin * 2);
        doc.text(descLines, margin, y);
        y += descLines.length * 12;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(`Technologies: ${project.technologies.join(', ')}`, margin, y);
        y += 18;
      });
      y += 10;
    }

    // Education
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(88, 28, 135);
    doc.text('EDUCATION', margin, y);
    y += 18;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(11);
    doc.text(generatedResume.education.degree, margin, y);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${generatedResume.education.institution} | ${generatedResume.education.year}`, margin, y);

    // Save
    doc.save(`${formData.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
    toast.success('Resume downloaded! 📄');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a14] text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-violet-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-fuchsia-500/10 rounded-full blur-[80px]" />
      </div>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent mb-4">
            ✨ AI Resume Builder
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create an ATS-optimized resume tailored to your dream role. Get instant feedback and improvement suggestions.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mt-8 gap-4">
          {[
            { id: 'form', icon: FileText, label: 'Your Info' },
            { id: 'resume', icon: Sparkles, label: 'AI Resume' },
            { id: 'analysis', icon: TrendingUp, label: 'Analysis' }
          ].map((step, i) => (
            <button
              key={step.id}
              onClick={() => (step.id === 'form' || generatedResume) && setActiveSection(step.id)}
              disabled={step.id !== 'form' && !generatedResume}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${activeSection === step.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg scale-105'
                : step.id !== 'form' && !generatedResume
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md hover:scale-102 border border-gray-200 dark:border-gray-700'
                }`}
            >
              <step.icon size={18} />
              <span className="hidden sm:inline font-medium">{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* ============ SECTION 1: INPUT FORM ============ */}
          {activeSection === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card rounded-3xl p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50">
                    <User className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                  Tell Us About Yourself
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <User size={16} className="inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="input-field"
                    />
                  </div>

                  {/* Target Role */}
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <Target size={16} className="inline mr-2" />
                      Target Job Role *
                    </label>
                    <input
                      type="text"
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleChange}
                      list="roles"
                      placeholder="e.g., Software Engineer"
                      className="input-field"
                    />
                    <datalist id="roles">
                      {rolesSuggestions.map(role => (
                        <option key={role} value={role} />
                      ))}
                    </datalist>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="input-field"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="input-field"
                    />
                  </div>

                  {/* Education */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <GraduationCap size={16} className="inline mr-2" />
                      Education *
                    </label>
                    <textarea
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="B.Tech in Computer Science, XYZ University (2020-2024)&#10;CGPA: 8.5/10"
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>

                  {/* Skills */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <Code size={16} className="inline mr-2" />
                      Skills * (Press Enter or comma to add)
                    </label>
                    <SkillTagInput
                      skills={formData.skills}
                      setSkills={(skills) => setFormData(prev => ({ ...prev, skills }))}
                      placeholder="Type a skill and press Enter..."
                    />
                  </div>

                  {/* Experience */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <Briefcase size={16} className="inline mr-2" />
                      Experience (optional)
                    </label>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      placeholder="Software Developer Intern at ABC Corp (Jun 2023 - Aug 2023)&#10;• Built REST APIs using Node.js&#10;• Improved database query performance by 40%"
                      rows={4}
                      className="input-field resize-none"
                    />
                  </div>

                  {/* Projects */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <FolderGit2 size={16} className="inline mr-2" />
                      Projects (optional)
                    </label>
                    <textarea
                      name="projects"
                      value={formData.projects}
                      onChange={handleChange}
                      placeholder="E-commerce Platform - Built with React, Node.js, MongoDB&#10;• Implemented payment gateway integration&#10;• 1000+ active users"
                      rows={4}
                      className="input-field resize-none"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={generateResume}
                    disabled={loading}
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-fuchsia-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <Loader2 className="animate-spin" size={24} />
                        Generating Magic...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <Sparkles size={24} />
                        Generate AI Resume
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============ SECTION 2: AI RESUME OUTPUT ============ */}
          {activeSection === 'resume' && generatedResume && (
            <motion.div
              key="resume"
              ref={resumeRef}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="glass-card rounded-3xl overflow-hidden">
                {/* Resume Header Bar */}
                <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText size={24} />
                    Your AI-Generated Resume
                  </h2>
                  <div className="flex gap-3">
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all backdrop-blur-sm"
                    >
                      <Download size={18} />
                      Download PDF
                    </button>
                    <button
                      onClick={() => setActiveSection('analysis')}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      View Analysis
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Resume Content */}
                <div className="p-8 md:p-12 max-w-4xl mx-auto">
                  {/* Header */}
                  <div className="border-b-2 border-purple-200 dark:border-purple-800 pb-6 mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                      {generatedResume.header.name}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                      {generatedResume.header.role}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {generatedResume.header.contact}
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-3">
                      Professional Summary
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {generatedResume.summary}
                    </p>
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-3">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedResume.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  {generatedResume.experience && generatedResume.experience.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-3">
                        Experience
                      </h3>
                      {generatedResume.experience.map((exp, i) => (
                        <div key={i} className="mb-4">
                          <div className="flex flex-wrap justify-between items-baseline gap-2">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">
                              {exp.title} | {exp.company}
                            </h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                              {exp.duration}
                            </span>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {exp.achievements.map((achievement, j) => (
                              <li key={j} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                <span className="text-purple-500 mt-1">•</span>
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Projects */}
                  {generatedResume.projects && generatedResume.projects.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-3">
                        Projects
                      </h3>
                      {generatedResume.projects.map((project, i) => (
                        <div key={i} className="mb-4">
                          <h4 className="font-bold text-gray-800 dark:text-gray-200">
                            {project.name}
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">
                            {project.description}
                          </p>
                          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1 italic">
                            Technologies: {project.technologies.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  <div>
                    <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-3">
                      Education
                    </h3>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200">
                        {generatedResume.education.degree}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {generatedResume.education.institution} | {generatedResume.education.year}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============ SECTION 3: AI FEEDBACK & ANALYSIS ============ */}
          {activeSection === 'analysis' && analysis && (
            <motion.div
              key="analysis"
              ref={analysisRef}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6">
                {/* Score Cards */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50">
                      <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
                    </div>
                    Resume Analysis Dashboard
                  </h2>

                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Overall Score */}
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl">
                      <ScoreRing score={analysis.overallScore} label="Overall Score" size={140} />
                    </div>

                    {/* ATS Score */}
                    <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-2xl">
                      <ScoreRing score={analysis.atsScore} label="ATS Compatibility" size={140} />
                    </div>

                    {/* Strengths */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl">
                      <h3 className="font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                        <CheckCircle2 size={20} />
                        Strengths
                      </h3>
                      <ul className="space-y-2">
                        {analysis.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                            <span className="text-green-500 mt-0.5">✓</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 md:p-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/50">
                      <Search className="text-orange-600 dark:text-orange-400" size={20} />
                    </div>
                    Missing Keywords
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis.missingKeywords.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-orange-700 dark:text-orange-400">
                            {item.keyword}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.importance === 'High'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                            : item.importance === 'Medium'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                            {item.importance}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <Lightbulb size={14} className="inline mr-1 text-orange-500" />
                          {item.reason}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Skill Gaps */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 md:p-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50">
                      <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                    </div>
                    Skill Gaps for {formData.targetRole}
                  </h3>
                  <div className="space-y-4">
                    {analysis.skillGaps.map((gap, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
                      >
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${gap.priority === 'High'
                          ? 'bg-red-500 text-white'
                          : 'bg-orange-500 text-white'
                          }`}>
                          {gap.priority === 'High' ? '!' : '?'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 dark:text-gray-200">{gap.skill}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {gap.reason}
                          </p>
                        </div>
                        <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${gap.priority === 'High'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'
                          }`}>
                          {gap.priority} Priority
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Improvement Suggestions */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 md:p-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/50">
                      <Lightbulb className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                    Actionable Improvements
                  </h3>
                  <div className="space-y-4">
                    {analysis.suggestions.map((suggestion, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-bold rounded-full uppercase">
                            {suggestion.category}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                          {suggestion.suggestion}
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                          <TrendingUp size={14} />
                          <span className="font-medium">Impact:</span> {suggestion.impact}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button
                    onClick={() => setActiveSection('resume')}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <FileText size={18} />
                    View Resume
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-500 hover:from-pink-600 hover:to-fuchsia-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Download size={18} />
                    Download Resume
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('form');
                      setGeneratedResume(null);
                      setAnalysis(null);
                    }}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <Plus size={18} />
                    Create New Resume
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
