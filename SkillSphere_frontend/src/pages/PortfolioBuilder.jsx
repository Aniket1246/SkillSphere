import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, Plus, Edit, Trash2, ExternalLink, Github, Globe, Code, Download, Eye, Sparkles, FileText, X } from "lucide-react";
import axios from "axios";
import LoginModal from "../components/LoginModal";
import { toast } from "react-toastify";

function PortfolioBuilder({ user }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  const [portfolioData, setPortfolioData] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    bio: "",
    skills: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    githubUrl: "",
    liveUrl: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
      loadProjects();
      loadPortfolioData();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://127.0.0.1:5000/portfolio/${user.uid}`);
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const loadPortfolioData = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://127.0.0.1:5000/portfolio-data/${user.uid}`);
      if (response.data.data) {
        setPortfolioData(response.data.data);
      }
    } catch (error) {
      console.error("Error loading portfolio data:", error);
    }
  };

  const loadPdfJs = () => new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.min.js';
    s.onload = () => resolve(window.pdfjsLib);
    s.onerror = reject;
    document.body.appendChild(s);
  });

  const extractPdfText = async (arrayBuffer) => {
    const pdfjsLib = await loadPdfJs();
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js';
    const typedArray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(it => it.str).join(' ') + '\n';
    }
    return fullText;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    setResumeText(""); // clear text if file is uploaded
    toast.success(`File ready: ${file.name}`);
  };

  const handleImportFromResume = async () => {
    if (!resumeFile && !resumeText.trim()) {
      toast.error("Please upload a file or paste text.");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        response = await axios.post("http://127.0.0.1:5000/parse-resume-from-file", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post("http://127.0.0.1:5000/parse-resume-data", {
          resumeText
        });
      }

      const { data } = response.data;

      setPortfolioData({
        name: data.name || "",
        title: data.title || "",
        email: data.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        skills: data.skills || "",
      });

      // Optionally add parsed projects if any
      if (data.projects && data.projects.length > 0) {
        // This would overwrite or append. Let's alert the user.
        toast.success(`Extracted ${data.projects.length} projects!`);
        // We won't auto-save projects to backend yet, but we could.
        // For now, let's just use them if the user generates the site? 
        // Or maybe we should add them to the state directly.
      }

      setShowImportModal(false);
      toast.success("Portfolio data populated from resume!");
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to parse resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (editingProject) {
        await axios.put(`http://127.0.0.1:5000/portfolio/${user.uid}/${editingProject.id}`, formData);
      } else {
        await axios.post(`http://127.0.0.1:5000/portfolio/${user.uid}`, formData);
      }

      loadProjects();
      setShowForm(false);
      setEditingProject(null);
      setFormData({
        title: "",
        description: "",
        technologies: "",
        githubUrl: "",
        liveUrl: "",
        imageUrl: "",
      });
      toast.success("Project saved successfully!");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project.");
    }
  };

  const deleteProject = async (projectId) => {
    if (!confirm("Delete this project?")) return;

    try {
      await axios.delete(`http://127.0.0.1:5000/portfolio/${user.uid}/${projectId}`);
      loadProjects();
      toast.info("Project deleted.");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const editProject = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(", "),
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      imageUrl: project.imageUrl || "",
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePortfolioDataChange = (e) => {
    setPortfolioData({ ...portfolioData, [e.target.name]: e.target.value });
  };

  const savePortfolioData = async () => {
    if (!user) return;
    try {
      await axios.post(`http://127.0.0.1:5000/portfolio-data/${user.uid}`, portfolioData);
      toast.success("Portfolio data saved!");
    } catch (error) {
      console.error("Error saving portfolio data:", error);
      toast.error("Failed to save data.");
    }
  };

  const generateHTMLCode = async () => {
    // We already have the logic in backend to generate the HTML string
    setLoading(true);
    try {
      const userData = {
        ...portfolioData,
        projects: projects // user projects from state
      };

      const response = await axios.post("http://127.0.0.1:5000/generate-portfolio-site", {
        userData,
        templateStyle: "modern"
      });

      setGeneratedCode(response.data.html);
      setShowCodePreview(true);
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate portfolio site.");
    } finally {
      setLoading(false);
    }
  };

  const downloadHTML = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded portfolio.html!");
  };

  const previewInNewTab = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50 dark:bg-[#0a0a14] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 rounded-full blur-[100px]" />
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 text-sm font-semibold mb-4 inline-block">
            AI-Powered Builder
          </span>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 font-outfit">
            Portfolio <span className="text-gradient">Architect</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Design a stunning developer portfolio in seconds. Import from your resume or build from scratch.
          </p>

          <div className="flex justify-center gap-4 flex-wrap mt-8">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <FileText size={20} className="text-violet-500" />
              Import from Resume
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add Project
            </button>
            <button
              onClick={generateHTMLCode}
              disabled={loading}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" /> : <Sparkles size={20} />}
              Generate Site
            </button>
          </div>
        </motion.div>

        {/* Import Modal */}
        <AnimatePresence>
          {showImportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/10"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold dark:text-white">Import from Resume</h3>
                  <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <X size={24} className="text-gray-500" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload your resume (.txt) or paste the text below. Our AI will extract your bio, skills, and contact info.
                </p>

                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition text-sm font-medium">
                    <FileText size={16} />
                    Upload Resume File
                    <input type="file" accept=".txt,.md,.pdf" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste resume content here..."
                  className="w-full h-64 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-violet-500 outline-none mb-6 resize-none dark:text-white"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-6 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportFromResume}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? "Analysing..." : "Auto-Fill Data"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portfolio Data Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
            <Folder className="text-violet-500" />
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" name="name" value={portfolioData.name} onChange={handlePortfolioDataChange} placeholder="John Doe" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Professional Title</label>
              <input type="text" name="title" value={portfolioData.title} onChange={handlePortfolioDataChange} placeholder="Full Stack Developer" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" name="email" value={portfolioData.email} onChange={handlePortfolioDataChange} placeholder="john@example.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Phone</label>
              <input type="tel" name="phone" value={portfolioData.phone} onChange={handlePortfolioDataChange} placeholder="+1 234 567 8900" className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Bio / About Me</label>
              <textarea name="bio" value={portfolioData.bio} onChange={handlePortfolioDataChange} placeholder="Tell us about yourself..." rows="4" className="input-field resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Skills (comma-separated)</label>
              <input type="text" name="skills" value={portfolioData.skills} onChange={handlePortfolioDataChange} placeholder="React, Node.js, Python, AWS" className="input-field" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={savePortfolioData} className="btn-secondary">Save Changes</button>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-3xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
            <Code className="text-fuchsia-500" />
            Projects
          </h2>

          {projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No projects added yet. Click "Add Project" to get started.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  layoutId={project.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 group hover:border-violet-500 transition-all"
                >
                  <div className="h-48 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                    {project.imageUrl ? (
                      <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20">
                        <Code size={48} className="text-violet-500/50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => editProject(project)} className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:text-violet-500"><Edit size={16} /></button>
                      <button onClick={() => deleteProject(project.id)} className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 font-medium">{tech}</span>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-auto">
                      {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><Github size={18} /></a>}
                      {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><ExternalLink size={18} /></a>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Code Preview Modal */}
        {showCodePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCodePreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-[#0f0f1b] rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#131320]">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-outfit">
                  Generated Code
                </h3>
                <div className="flex gap-3">
                  <button onClick={previewInNewTab} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2">
                    <Eye size={18} /> Preview
                  </button>
                  <button onClick={downloadHTML} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2">
                    <Download size={18} /> Download
                  </button>
                  <button onClick={() => setShowCodePreview(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-semibold transition">
                    Close
                  </button>
                </div>
              </div>
              <div className="p-0 overflow-hidden h-[calc(90vh-80px)] relative">
                <textarea
                  readOnly
                  value={generatedCode}
                  className="w-full h-full p-6 bg-[#0a0a14] text-green-400 font-mono text-sm resize-none focus:outline-none"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Add/Edit Project Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-2xl w-full"
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                  {editingProject ? "Edit Project" : "Add New Project"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Project Title" className="input-field" required />
                  <input type="text" name="technologies" value={formData.technologies} onChange={handleChange} placeholder="Technologies (e.g. React, Node)" className="input-field" required />
                  <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Project Description" rows="3" className="input-field resize-none" required />
                  <div className="grid grid-cols-3 gap-4">
                    <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange} placeholder="GitHub URL" className="input-field" />
                    <input type="url" name="liveUrl" value={formData.liveUrl} onChange={handleChange} placeholder="Live URL" className="input-field" />
                    <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="Image URL" className="input-field" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</button>
                    <button type="submit" className="flex-1 btn-primary">{editingProject ? "Save Changes" : "Add Project"}</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PortfolioBuilder;
