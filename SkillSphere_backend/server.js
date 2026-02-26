import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";
import rateLimit from "express-rate-limit";
import multer from "multer";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Polyfill DOMMatrix for pdf-parse if not available in Node.js
if (!global.DOMMatrix) {
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
  };
}

// Helper to load pdf-parse robustly
let pdfParseLib = null;
const loadPdfParse = () => {
  if (pdfParseLib) return pdfParseLib;
  try {
    let imported = require("pdf-parse");
    // Check for various export styles
    if (typeof imported === 'function') {
      pdfParseLib = imported;
    } else if (imported.default && typeof imported.default === 'function') {
      pdfParseLib = imported.default;
    } else if (imported.PDFParse && typeof imported.PDFParse === 'function') {
      pdfParseLib = imported.PDFParse;
    } else {
      // Fallback: try requiring the CJS file directly
      try {
        const cjs = require("pdf-parse/dist/pdf-parse/cjs/index.cjs");
        if (typeof cjs === 'function') {
          pdfParseLib = cjs;
        } else if (cjs.default && typeof cjs.default === 'function') {
          pdfParseLib = cjs.default;
        }
      } catch (e2) {
        console.warn("Failed to require CJS fallback:", e2);
      }

      if (!pdfParseLib) {
        console.warn("Warning: pdf-parse main export is not a function. Keys:", Object.keys(imported));
        // Final desperate attempt: assign anyway, but it will likely fail if called
        pdfParseLib = imported;
      }
    }
  } catch (e) {
    console.error("Failed to require pdf-parse:", e);
  }
  return pdfParseLib;
};

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Unified PDF Parsing Helper
async function parsePdf(buffer) {
  const Library = loadPdfParse();
  if (!Library) throw new Error("PDF Parser library not available");

  // Check if it's the Class-based v2+ version
  if (Library.prototype && Library.prototype.load && Library.prototype.getText) {
    try {
      console.log("Using Class-based PDF Parser");
      const parser = new Library();
      await parser.load(buffer);
      const text = await parser.getText();
      return { text: text };
    } catch (err) {
      console.error("Class-based PDF parse failed:", err);
      throw err;
    }
  }

  // Fallback to standard v1.x function call
  return Library(buffer);
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT, 10) || 50,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());
app.use(limiter);

// In-memory storage (replace with database in production)
const storage = {
  learningProgress: {},
  portfolios: {},
  portfolioData: {},
  peerCircles: [],
  careerPersonas: {},
};

// Helper function to call Groq API
async function callGroqAPI(messages, temperature = 0.7) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages,
        temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const content = response.data.choices[0].message.content;
    console.log("Groq API Response (First 100 chars):", content.substring(0, 100));
    return content;
  } catch (error) {
    console.error("Groq API error:", error.response?.data || error.message);
    throw error;
  }
}

// Test route
app.get("/", (req, res) => {
  res.send("🟢 SkillSphere Backend is Running!");
});

// Groq proxy endpoint (existing)
app.post("/groq", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      req.body,
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Groq API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Groq request failed" });
  }
});

// Career Path Recommender
app.post("/career-recommend", async (req, res) => {
  try {
    const { skills, education, interests, experience } = req.body;

    const prompt = `As a career counselor, analyze this profile and provide career recommendations:
    Skills: ${skills}
    Education: ${education}
    Interests: ${interests}
    Experience: ${experience} years
    
    Provide a JSON response with:
    1. careers: Array of 3-5 career paths with title, description, and matchScore (0-100)
    2. trendingIndustries: Array of 3-5 fast-growing industries
    3. nextSteps: Array of 3-5 actionable next steps
    
    Format as valid JSON only.`;

    const aiResponse = await callGroqAPI([
      { role: "system", content: "You are a creative career counselor. Respond only with valid JSON." },
      { role: "user", content: prompt }
    ], 0.9); // Higher temperature for variety

    const parsed = JSON.parse(aiResponse);
    res.json(parsed);
  } catch (error) {
    console.error("Career recommend error:", error);
    res.json({
      careers: [
        { title: "Software Engineer", description: "Build applications and systems", matchScore: 85 },
        { title: "Data Analyst", description: "Analyze data for insights", matchScore: 75 },
        { title: "Product Manager", description: "Lead product development", matchScore: 70 }
      ],
      trendingIndustries: ["AI/ML", "Cloud Computing", "Cybersecurity", "Green Tech"],
      nextSteps: [
        "Build a portfolio of projects",
        "Network with professionals in your field",
        "Take online courses to fill skill gaps"
      ]
    });
  }
});

// Learning Guide
app.post("/learning-guide", async (req, res) => {
  try {
    const { currentSkills, targetRole, userId } = req.body;

    const prompt = `Analyze skill gaps for someone wanting to become a ${targetRole}.
    Current skills: ${currentSkills}
    
    Provide JSON with:
    1. skillGaps: Array of missing skills
    2. courses: Array of 4-6 courses with id, title, platform, duration, level
    3. certifications: Array of recommended certifications
    
    Format as valid JSON only.`;

    const aiResponse = await callGroqAPI([
      { role: "system", content: "You are a learning advisor. Respond only with valid JSON." },
      { role: "user", content: prompt }
    ]);

    const parsed = JSON.parse(aiResponse);
    res.json(parsed);
  } catch (error) {
    console.error("Learning guide error:", error);
    res.json({
      skillGaps: ["React", "Node.js", "System Design"],
      courses: [
        { id: "1", title: "React Complete Guide", platform: "Udemy", duration: "40 hours", level: "Intermediate" },
        { id: "2", title: "Node.js Masterclass", platform: "Coursera", duration: "30 hours", level: "Intermediate" },
        { id: "3", title: "System Design Fundamentals", platform: "educative.io", duration: "20 hours", level: "Advanced" }
      ],
      certifications: ["AWS Certified Developer", "Meta React Certification"]
    });
  }
});

// Learning Progress
app.get("/learning-progress/:userId", (req, res) => {
  const { userId } = req.params;
  res.json({ completed: storage.learningProgress[userId] || [] });
});

app.post("/mark-complete", (req, res) => {
  const { userId, courseId } = req.body;
  if (!storage.learningProgress[userId]) {
    storage.learningProgress[userId] = [];
  }
  if (!storage.learningProgress[userId].includes(courseId)) {
    storage.learningProgress[userId].push(courseId);
  }
  res.json({ success: true });
});

// Interview Preparation
app.post("/interview-question", async (req, res) => {
  try {
    const { type } = req.body;

    const questions = {
      behavioral: [
        "Tell me about a time when you faced a challenging situation at work.",
        "Describe a project where you had to work with a difficult team member.",
        "How do you handle tight deadlines and pressure?"
      ],
      technical: [
        "Explain the difference between REST and GraphQL.",
        "What is the time complexity of common sorting algorithms?",
        "How would you optimize a slow database query?"
      ],
      coding: [
        "Write a function to reverse a linked list.",
        "Implement a function to find the longest palindrome in a string.",
        "Design a rate limiter for an API."
      ]
    };

    const questionList = questions[type] || questions.behavioral;
    const question = questionList[Math.floor(Math.random() * questionList.length)];

    res.json({ question });
  } catch (error) {
    console.error("Interview question error:", error);
    res.status(500).json({ error: "Failed to get question" });
  }
});

app.post("/interview-feedback", async (req, res) => {
  try {
    const { question, transcript, type } = req.body;

    const prompt = `Evaluate this interview response:
    Question: ${question}
    Answer: ${transcript || "No transcript available"}
    Type: ${type}
    
    Provide JSON with:
    1. score: Number 1-10
    2. strengths: Array of 2-3 positive points
    3. improvements: Array of 2-3 areas to improve
    4. suggestedAnswer: A better way to answer
    
    Format as valid JSON only.`;

    const aiResponse = await callGroqAPI([
      { role: "system", content: "You are an interview coach. Respond only with valid JSON." },
      { role: "user", content: prompt }
    ]);

    const parsed = JSON.parse(aiResponse);
    res.json(parsed);
  } catch (error) {
    console.error("Interview feedback error:", error);
    res.json({
      score: 7,
      strengths: ["Clear communication", "Good structure"],
      improvements: ["Add more specific examples", "Quantify your impact"],
      suggestedAnswer: "Consider using the STAR method: Situation, Task, Action, Result."
    });
  }
});

// Career Persona
app.get("/career-persona/:userId", (req, res) => {
  const { userId } = req.params;
  res.json({ persona: storage.careerPersonas[userId] || null });
});

app.post("/generate-persona", async (req, res) => {
  try {
    const { userId, name, currentRole, experience, skills, achievements, goals } = req.body;

    const prompt = `Create a professional career persona for:
    Name: ${name}
    Role: ${currentRole}
    Experience: ${experience} years
    Skills: ${skills}
    Achievements: ${achievements}
    Goals: ${goals}
    
    Provide JSON with:
    1. name: Full name
    2. title: Professional title
    3. summary: 2-3 sentence professional summary
    4. competencies: Array of 5-7 core skills
    5. highlights: Array of 3-5 career highlights
    6. trajectory: One sentence about career direction
    
    Format as valid JSON only.`;

    const aiResponse = await callGroqAPI([
      { role: "system", content: "You are a career branding expert. Respond only with valid JSON." },
      { role: "user", content: prompt }
    ]);

    const persona = JSON.parse(aiResponse);
    storage.careerPersonas[userId] = persona;

    res.json({ persona });
  } catch (error) {
    console.error("Generate persona error:", error);
    const fallbackPersona = {
      name: req.body.name,
      title: req.body.currentRole,
      summary: `Experienced ${req.body.currentRole} with ${req.body.experience} years of expertise.`,
      competencies: req.body.skills.split(",").map(s => s.trim()).slice(0, 7),
      highlights: req.body.achievements.split(".").filter(a => a.trim()).slice(0, 5),
      trajectory: req.body.goals
    };
    storage.careerPersonas[req.body.userId] = fallbackPersona;
    res.json({ persona: fallbackPersona });
  }
});

// Portfolio Builder
app.get("/portfolio/:userId", (req, res) => {
  const { userId } = req.params;
  res.json({ projects: storage.portfolios[userId] || [] });
});

app.post("/portfolio/:userId", (req, res) => {
  const { userId } = req.params;
  const project = {
    ...req.body,
    id: Date.now().toString(),
    technologies: req.body.technologies.split(",").map(t => t.trim()),
    createdAt: new Date().toISOString()
  };

  if (!storage.portfolios[userId]) {
    storage.portfolios[userId] = [];
  }
  storage.portfolios[userId].push(project);

  res.json({ success: true, project });
});

app.put("/portfolio/:userId/:projectId", (req, res) => {
  const { userId, projectId } = req.params;
  const projects = storage.portfolios[userId] || [];
  const index = projects.findIndex(p => p.id === projectId);

  if (index !== -1) {
    projects[index] = {
      ...projects[index],
      ...req.body,
      technologies: req.body.technologies.split(",").map(t => t.trim()),
    };
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Project not found" });
  }
});

app.delete("/portfolio/:userId/:projectId", (req, res) => {
  const { userId, projectId } = req.params;
  if (storage.portfolios[userId]) {
    storage.portfolios[userId] = storage.portfolios[userId].filter(p => p.id !== projectId);
  }
  res.json({ success: true });
});

// Portfolio Data (for HTML generation)
app.get("/portfolio-data/:userId", (req, res) => {
  const { userId } = req.params;
  res.json({ data: storage.portfolioData[userId] || null });
});

app.post("/portfolio-data/:userId", (req, res) => {
  const { userId } = req.params;
  storage.portfolioData[userId] = req.body;
  res.json({ success: true });
});

// Peer Learning Circles
app.get("/peer-circles", (req, res) => {
  res.json({ circles: storage.peerCircles });
});

app.post("/peer-circles", (req, res) => {
  const circle = {
    ...req.body,
    id: Date.now().toString(),
    participants: [req.body.creatorId],
    createdAt: new Date().toISOString()
  };

  storage.peerCircles.push(circle);
  res.json({ success: true, circle });
});

app.post("/peer-circles/:circleId/join", (req, res) => {
  const { circleId } = req.params;
  const { userId } = req.body;

  const circle = storage.peerCircles.find(c => c.id === circleId);
  if (!circle) {
    return res.status(404).json({ error: "Circle not found" });
  }

  if (circle.participants.length >= circle.maxParticipants) {
    return res.status(400).json({ error: "Circle is full" });
  }

  if (!circle.participants.includes(userId)) {
    circle.participants.push(userId);
  }

  res.json({ success: true });
});

// Helper to safely parse JSON
const safeJSONParse = (text, fallback) => {
  try {
    // Remove any markdown formatting like ```json ... ```
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return fallback;
  }
};

// Portfolio Generator (HTML/CSS)
app.post("/generate-portfolio-site", async (req, res) => {
  try {
    const { userData, templateStyle = "modern" } = req.body;

    // userData comes from Resume or Manual Input
    const prompt = `Generate a single-file HTML5 portfolio website (including embedded CSS in <style>) for this user.
    User Data: ${JSON.stringify(userData)}
    Style: ${templateStyle} (Use modern, responsive design, gradients, animation)
    
    Requirements:
    - Sections: Hero, About, Skills, Experience, Projects, Contact.
    - Use dummy images from unsplash or placeholders if needed.
    - Make it look premium and professional.
    - Return ONLY the HTML code. Do not wrap in markdown blocks.`;

    const aiResponse = await callGroqAPI([
      { role: "system", content: "You are a professional frontend developer. Output only raw HTML code." },
      { role: "user", content: prompt }
    ], 0.7);

    // Clean up potential markdown wrappers
    const html = aiResponse.replace(/```html/g, "").replace(/```/g, "").trim();

    res.json({ html });
  } catch (error) {
    console.error("Portfolio gen error:", error);
    res.status(500).json({ error: "Failed to generate portfolio" });
  }
});

// Resume Analysis
app.post("/analyze-resume", async (req, res) => {
  try {
    const { resumeText, targetJob } = req.body;

    const prompt = `Analyze this resume for the role of "${targetJob}".
    Resume Text: ${resumeText.substring(0, 3000)}...
    
    Provide JSON with:
    1. atsScore: Number 0-100
    2. summary: Brief critique
    3. missingKeywords: Array of strings
    4. formattingIssues: Array of strings
    5. improvements: Array of actionable specific tips
    
    Format as valid JSON only.`;

    const aiResponse = await callGroqAPI([
      { role: "system", content: "You are an expert ATS resume scanner. Respond only with valid JSON." },
      { role: "user", content: prompt }
    ]);

    const parsed = safeJSONParse(aiResponse, {
      atsScore: 50,
      summary: "Could not analyze deeply.",
      missingKeywords: ["Leadership", "Project Management"],
      formattingIssues: [],
      improvements: ["Check for typos"]
    });

    res.json(parsed);
  } catch (error) {
    console.error("Resume analysis error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// Job Trend Tracker
app.get("/job-trends/popular", (req, res) => {
  res.json({
    roles: [
      "Software Engineer",
      "Data Scientist",
      "Product Manager",
      "UX Designer",
      "DevOps Engineer",
      "AI/ML Engineer"
    ]
  });
});

// Parse Resume to Portfolio Data
app.post("/parse-resume-data", async (req, res) => {
  try {
    const { resumeText } = req.body;

    const prompt = `Extract portfolio data from this resume text:
    ${resumeText.substring(0, 3000)}...
    
    Provide JSON with:
    1. name: string
    2. title: string (professional title)
    3. bio: string (2-3 sentences)
    4. skills: string (comma separated)
    5. email: string
    6. phone: string
    7. projects: Array of { title, description, technologies: [] }
    
    Format as valid JSON only.`;

    const aiResponse = await callGroqAPI([
      { role: "system", content: "You are a data extraction expert. Respond only with valid JSON." },
      { role: "user", content: prompt }
    ]);

    const parsed = safeJSONParse(aiResponse, {
      name: "",
      title: "",
      bio: "",
      skills: "",
      projects: []
    });

    res.json({ data: parsed });
  } catch (error) {
    console.error("Resume parse error:", error);
    res.status(500).json({ error: "Failed to parse resume" });
  }
});

app.post("/job-trends/search", async (req, res) => {
  try {
    const { role, location } = req.body;

    const prompt = `Provide job market insights for ${role}${location ? ` in ${location}` : ""}:
    
    Provide JSON with:
    1. demandScore: Number 0-100
    2. demandTrend: "increasing" or "stable"
    3. avgSalary: String like "$120,000"
    4. salaryRange: String like "$90k - $150k"
    5. openPositions: Number
    6. topSkills: Array of 5 skills with name and percentage
    7. topCompanies: Array of 4 companies with name, openings, logo emoji
    8. shortTermOutlook: One sentence
    9. longTermOutlook: One sentence
    10. relatedRoles: Array of 4 related job titles
    
    Format as valid JSON only.`;

    const aiResponse = await callGroqAPI([
      { role: "system", content: "You are a job market analyst. Respond only with valid JSON." },
      { role: "user", content: prompt }
    ], 0.5);

    const parsed = safeJSONParse(aiResponse, {
      demandScore: 85,
      demandTrend: "increasing",
      avgSalary: "$120,000",
      salaryRange: "$90k - $150k",
      openPositions: 15420,
      topSkills: [
        { name: "JavaScript", percentage: 85 },
        { name: "React", percentage: 75 }
      ],
      topCompanies: [],
      shortTermOutlook: "Positive.",
      longTermOutlook: "Positive.",
      relatedRoles: []
    });
    res.json(parsed);
  } catch (error) {
    console.error("Job trends error:", error);
    res.json({
      demandScore: 85,
      demandTrend: "increasing",
      avgSalary: "$120,000",
      salaryRange: "$90k - $150k",
      openPositions: 15420,
      topSkills: [
        { name: "JavaScript", percentage: 85 },
        { name: "React", percentage: 75 },
        { name: "Node.js", percentage: 65 },
        { name: "TypeScript", percentage: 60 },
        { name: "AWS", percentage: 55 }
      ],
      topCompanies: [
        { name: "Google", openings: 234, logo: "🔍" },
        { name: "Amazon", openings: 189, logo: "📦" },
        { name: "Microsoft", openings: 156, logo: "💻" },
        { name: "Meta", openings: 98, logo: "👥" }
      ],
      shortTermOutlook: "Strong demand expected to continue.",
      longTermOutlook: "Excellent long-term prospects.",
      relatedRoles: ["Frontend Developer", "Full Stack Engineer"]
    });
  }
});

// Resume File Parser (PDF/TXT)
app.post("/parse-resume-from-file", upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let resumeText = "";
    console.log("Processing file:", req.file.path, req.file.mimetype);

    // Parse specific file types
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await parsePdf(dataBuffer);
      resumeText = data.text;
    } else {
      // Default to text read
      resumeText = fs.readFileSync(req.file.path, 'utf8');
    }

    // Cleanup: delete temp file
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) { console.error("Error deleting temp file:", e); }

    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ error: "Could not extract text from file." });
    }

    // Call LLM for extraction
    const prompt = `Extract portfolio data from this resume text:
    ${resumeText.substring(0, 15000)}... (truncated)
    
    Provide JSON with:
    1. name: string
    2. title: string (professional title)
    3. bio: string (professional summary, max 500 chars)
    4. skills: string (comma separated list)
    5. email: string
    6. phone: string
    7. projects: Array of { title, description, technologies: ["Tech1", "Tech2"], githubUrl: "", liveUrl: "" } (Extract at least 2 projects if available)
    
    Format as valid JSON only.`;

    const aiResponse = await callGroqAPI([
      { role: "system", content: "You are an expert resume parser. Extract data accurately and output ONLY valid JSON." },
      { role: "user", content: prompt }
    ]);

    // Parse the LLM response
    const parsed = JSON.parse(aiResponse);

    // Normalize response structure
    res.json({ data: parsed });

  } catch (error) {
    console.error("Resume file parse error:", error);
    res.status(500).json({ error: "Failed to process resume file" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ SkillSphere Backend running on port ${PORT}`);
});

// Resume-based Career Recommendations with Job Suggestions
app.post("/career-recommend-resume", upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    // Read and parse PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfData = await parsePdf(dataBuffer);
    const resumeText = pdfData.text;

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    const prompt = `Analyze this resume and provide comprehensive career recommendations:

Resume Content:
${resumeText}

Provide a detailed JSON response with:
1. extractedInfo: {
   name: string,
   email: string,
   phone: string,
   skills: array of skills found,
   experience: years of experience,
   education: highest education level,
   currentRole: current or most recent job title
}
2. careers: Array of 5 career paths with title, description, matchScore (0-100), and fit (why it's a good match)
3. trendingIndustries: Array of 5 fast-growing industries matching their profile
4. recommendedJobs: Array of 8-10 specific job titles they should apply for with:
   - title: job title
   - company: example companies hiring (comma-separated)
   - salary: estimated salary range
   - matchScore: 0-100
   - requirements: key requirements
5. skillGaps: Array of skills they should learn
6. nextSteps: Array of 5 actionable next steps
7. strengths: Array of 3-5 key strengths from resume
8. improvementAreas: Array of 3 areas to improve

Format as valid JSON only.`;

    const aiResponse = await callGroqAPI([
      { role: "system", content: "You are an expert career counselor and resume analyst. Respond only with valid JSON." },
      { role: "user", content: prompt }
    ], 0.7);

    const parsed = JSON.parse(aiResponse);
    res.json(parsed);
  } catch (error) {
    console.error("Resume analysis error:", error);

    // Fallback response
    res.json({
      extractedInfo: {
        name: "User",
        skills: ["Communication", "Problem Solving", "Leadership"],
        experience: "2",
        education: "Bachelor's",
        currentRole: "Professional"
      },
      careers: [
        { title: "Software Engineer", description: "Build applications and systems", matchScore: 85, fit: "Strong technical background and problem-solving skills" },
        { title: "Product Manager", description: "Lead product development", matchScore: 78, fit: "Good communication and leadership abilities" },
        { title: "Data Analyst", description: "Analyze data for insights", matchScore: 75, fit: "Analytical mindset and attention to detail" },
        { title: "UX Designer", description: "Design user experiences", matchScore: 72, fit: "Creative thinking and user empathy" },
        { title: "Business Analyst", description: "Bridge tech and business", matchScore: 70, fit: "Strong communication and analytical skills" }
      ],
      trendingIndustries: ["AI/ML", "Cloud Computing", "Cybersecurity", "FinTech", "HealthTech"],
      recommendedJobs: [
        { title: "Junior Software Engineer", company: "Google, Microsoft, Amazon", salary: "$80k - $120k", matchScore: 88, requirements: "2+ years experience, CS degree, JavaScript/Python" },
        { title: "Frontend Developer", company: "Meta, Netflix, Airbnb", salary: "$75k - $110k", matchScore: 85, requirements: "React, JavaScript, CSS, 1-3 years experience" },
        { title: "Full Stack Developer", company: "Stripe, Shopify, Square", salary: "$90k - $130k", matchScore: 82, requirements: "Node.js, React, Databases, 2-4 years experience" },
        { title: "Product Analyst", company: "Apple, Tesla, Uber", salary: "$70k - $100k", matchScore: 78, requirements: "SQL, Analytics, Communication, 1-2 years experience" },
        { title: "UX Engineer", company: "Adobe, Figma, Canva", salary: "$75k - $115k", matchScore: 76, requirements: "Design, Frontend, User Research, Portfolio" },
        { title: "Data Engineer", company: "Snowflake, Databricks, AWS", salary: "$95k - $140k", matchScore: 74, requirements: "Python, SQL, ETL, Cloud platforms" },
        { title: "DevOps Engineer", company: "HashiCorp, Docker, Red Hat", salary: "$90k - $135k", matchScore: 72, requirements: "CI/CD, Kubernetes, AWS/Azure, 2+ years" },
        { title: "Mobile Developer", company: "Spotify, Instagram, TikTok", salary: "$80k - $125k", matchScore: 70, requirements: "React Native or Swift/Kotlin, 2+ years" }
      ],
      skillGaps: ["Advanced JavaScript", "System Design", "Cloud Platforms (AWS/Azure)", "Docker/Kubernetes"],
      nextSteps: [
        "Update LinkedIn profile with recent achievements and skills",
        "Build 2-3 portfolio projects showcasing your abilities",
        "Apply to 10-15 jobs per week matching your profile",
        "Network with professionals in your target industry",
        "Take online courses to fill identified skill gaps"
      ],
      strengths: ["Strong technical foundation", "Good communication skills", "Problem-solving ability", "Quick learner"],
      improvementAreas: ["Leadership experience", "Public speaking", "Project management skills"]
    });
  }
});
