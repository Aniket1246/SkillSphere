import React, { useState } from 'react';
import { toast } from 'react-toastify';

function ResumeAnalyzer() {
  const [text, setText] = useState('');
  const [score, setScore] = useState(null);
  const [tips, setTips] = useState([]);

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

  const handleFile = async (file) => {
    if (!file) return;
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = e => setText(String(e.target?.result || ''));
      reader.readAsText(file);
    } else if (ext === 'pdf') {
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const buf = e.target?.result;
          const parsed = await extractPdfText(buf);
          setText(parsed);
        } catch (err) {
          console.error(err);
          toast.error('Could not read PDF text. Please try a .txt export of your resume.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Supported files: .pdf, .txt');
    }
  };

  const analyze = () => {
    const t = text || '';
    const tipsOut = [];
    let s = 50;

    if (!/\b(email|@)\b/i.test(t)) { tipsOut.push('Add a professional email.'); s -= 5; }
    if (!/\b(phone|\+?\d{7,})\b/i.test(t)) { tipsOut.push('Include a reachable phone number.'); s -= 5; }
    if (!/\b(education|b\.tech|btech|m\.tech|degree)\b/i.test(t)) { tipsOut.push('Add an Education section.'); s -= 10; }
    if (!/\b(experience|internship|project)\b/i.test(t)) { tipsOut.push('Highlight experience, internships, or projects.'); s -= 10; }
    if (!/\b(skills|technologies|tools)\b/i.test(t)) { tipsOut.push('List key skills and tools.'); s -= 10; }
    if (!/\b(achievements|awards|certifications)\b/i.test(t)) { tipsOut.push('Add achievements or certifications.'); s -= 5; }
    if ((t.match(/\b(responsible for|worked on)\b/gi) || []).length > 3) { tipsOut.push('Use action verbs (built, led, delivered) over passive phrasing.'); }
    if (t.length > 8000) { tipsOut.push('Try to keep the resume concise (1–2 pages).'); s -= 5; }

    s = Math.max(0, Math.min(100, s + Math.min(20, Math.floor((t.match(/\b(project|react|node|ml|api|sql|aws)\b/gi) || []).length * 2))))
    setScore(s);
    setTips(tipsOut.length ? tipsOut : ['Looks good! Consider tailoring to each job’s keywords.']);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a14] text-gray-900 dark:text-gray-100 py-12 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-violet-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-fuchsia-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
            Resume Analyzer (ATS)
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Upload your resume or paste text to get an instant ATS compatibility score and actionable improvement tips.
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Upload Resume (PDF/TXT)
            </label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 
                file:mr-4 file:py-3 file:px-6 
                file:rounded-xl file:border-0 
                file:text-sm file:font-semibold 
                file:bg-violet-50 file:text-violet-700 
                hover:file:bg-violet-100
                dark:file:bg-violet-900/30 dark:file:text-violet-300
                dark:hover:file:bg-violet-900/50
                cursor-pointer transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Or Paste Text Directly
            </label>
            <textarea
              className="input-field h-56 resize-none"
              placeholder="Paste your resume text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={analyze}
              className="w-full sm:w-auto btn-primary px-8 py-3 flex items-center justify-center gap-2"
            >
              Analyze Resume
            </button>

            {score !== null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                <span className="text-sm text-gray-600 dark:text-gray-300">ATS Score:</span>
                <span className={`text-xl font-bold ${score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                  {score}/100
                </span>
              </div>
            )}
          </div>
        </div>

        {tips.length > 0 && (
          <div className="glass-card p-6 md:p-8 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-violet-500">✨</span> Suggestions for Improvement
            </h2>
            <ul className="space-y-3">
              {tips.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeAnalyzer;


