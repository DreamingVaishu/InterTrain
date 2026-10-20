import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Camera,
  CheckCircle2,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Twitter,
  Sliders,
  Eye,
  Download,
  Trash2,
  Save,
  RotateCcw,
  Plus,
  X,
  FileText,
  GraduationCap,
  Briefcase,
  Code2,
  FolderGit2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  AlertCircle,
  Clock,
  Award,
} from 'lucide-react';
import { NavTab } from '../types';

export interface ProfileViewProps {
  userName?: string;
  userEmail?: string;
  onUpdateUser?: (updated: { name: string; email: string }) => void;
  onStartPractice?: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  onResetData?: () => void;
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  score: string;
  description: string;
}

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  skills: string[];
}

interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  tags: string[];
  githubUrl: string;
  demoUrl?: string;
}

export function ProfileView({
  userName = 'Developer',
  userEmail = 'developer@intertrain.io',
  onUpdateUser,
  onStartPractice,
  onNavigateTab,
  onResetData,
}: ProfileViewProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'personal' | 'education' | 'experience' | 'skills' | 'projects' | 'preferences'
  >('personal');

  // Form states with persisted localStorage values
  const [name, setName] = useState(() => {
    const saved = localStorage.getItem('intertrain_profile_name');
    if (saved && !saved.includes('(')) return saved;
    return userName || 'Developer';
  });
  const [email, setEmail] = useState(() => {
    const saved = localStorage.getItem('intertrain_profile_email');
    if (saved && !saved.includes('divya')) return saved;
    return userEmail || 'developer@intertrain.io';
  });
  const [phone, setPhone] = useState(() => {
    return localStorage.getItem('intertrain_profile_phone') || '+91 98765 43210';
  });
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('intertrain_profile_location') || 'Mumbai, Maharashtra';
  });
  const [headline, setHeadline] = useState(() => {
    return (
      localStorage.getItem('intertrain_profile_headline') ||
      (userName === 'Developer' ? 'Developer' : 'Student · BCA (2024 – 2027)')
    );
  });
  const [bio, setBio] = useState(() => {
    return (
      localStorage.getItem('intertrain_profile_bio') ||
      'Enthusiastic computer applications undergraduate focused on full-stack development, distributed backend architecture, and generative AI integrations. Always eager to take on challenging technical mock rounds.'
    );
  });

  // Preferences
  const [targetRole, setTargetRole] = useState(() => {
    return localStorage.getItem('intertrain_profile_role') || 'Full-Stack Developer';
  });
  const [experienceLevel, setExperienceLevel] = useState(() => {
    return localStorage.getItem('intertrain_profile_exp') || 'Fresher';
  });
  const [interviewGoal, setInterviewGoal] = useState(() => {
    return localStorage.getItem('intertrain_profile_goal') || 'Placement / Internship';
  });
  const [preferredDomains, setPreferredDomains] = useState<string[]>(() => {
    const saved = localStorage.getItem('intertrain_profile_domains');
    return saved ? JSON.parse(saved) : ['Web Development', 'AI/ML', 'DevOps'];
  });
  const [newDomainInput, setNewDomainInput] = useState('');
  const [isAddingDomain, setIsAddingDomain] = useState(false);

  // Social Links
  const [linkedinUrl, setLinkedinUrl] = useState(() => {
    return localStorage.getItem('intertrain_profile_linkedin') || 'linkedin.com/in/billubadmash';
  });
  const [githubUrl, setGithubUrl] = useState(() => {
    return localStorage.getItem('intertrain_profile_github') || 'github.com/billubadmash';
  });
  const [portfolioUrl, setPortfolioUrl] = useState(() => {
    return localStorage.getItem('intertrain_profile_portfolio') || 'billu-dev.tech';
  });
  const [twitterUrl, setTwitterUrl] = useState(() => {
    return localStorage.getItem('intertrain_profile_twitter') || '@billubadmash';
  });

  // Skills
  const [skills, setSkills] = useState<string[]>(() => {
    const saved = localStorage.getItem('intertrain_profile_skills');
    return saved
      ? JSON.parse(saved)
      : ['Flutter', 'React', 'Node.js', 'Python', 'AI/ML', 'TypeScript', 'Docker', 'FastAPI'];
  });
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Education list
  const [educationList, setEducationList] = useState<EducationItem[]>([
    {
      id: 'edu-1',
      degree: 'Bachelor of Computer Applications (BCA)',
      institution: 'University of Mumbai',
      period: '2024 – 2027',
      score: 'CGPA: 8.8 / 10',
      description:
        'Coursework: Data Structures & Algorithms, Database Systems, Web Technologies, Object-Oriented Software Design.',
    },
    {
      id: 'edu-2',
      degree: 'Higher Secondary Certificate (HSC - Science)',
      institution: 'Maharashtra State Board of Secondary & Higher Secondary Education',
      period: '2022 – 2024',
      score: 'Score: 91.4%',
      description: 'Major subjects: Computer Science, Mathematics, Physics, Chemistry.',
    },
  ]);

  // Experience list
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([
    {
      id: 'exp-1',
      role: 'Full-Stack Developer Intern',
      company: 'TechNest Labs, Mumbai',
      location: 'Hybrid',
      period: 'Jun 2025 – Present',
      description:
        'Architected real-time WebSocket dashboard for microservice telemetry. Engineered FastAPI endpoints and integrated PostgreSQL with indexing optimization.',
      skills: ['FastAPI', 'React', 'PostgreSQL', 'Docker'],
    },
    {
      id: 'exp-2',
      role: 'Open-Source Contributor & Web Lead',
      company: 'College Tech Club (CSI Student Chapter)',
      location: 'Mumbai',
      period: 'Aug 2024 – May 2025',
      description:
        'Mentored 60+ junior peers on modern JavaScript, Git workflows, and API architectures. Led development of the annual hackathon portal.',
      skills: ['TypeScript', 'Next.js', 'Tailwind CSS'],
    },
  ]);

  // Projects list
  const [projectList, setProjectList] = useState<ProjectItem[]>([
    {
      id: 'proj-1',
      title: 'InterTrain — Multi-Agent AI Mock Interviewer',
      tagline: 'Real-time behavioral & coding interview simulator with code execution sandbox',
      tags: ['React', 'TypeScript', 'FastAPI', 'Gemini Live', 'WebRTC'],
      githubUrl: 'https://github.com/billubadmash/intertrain',
      demoUrl: 'https://intertrain.io',
    },
    {
      id: 'proj-2',
      title: 'Distributed Redis Task Queue',
      tagline: 'Lightweight asynchronous job processor with worker concurrency control and retries',
      tags: ['Python', 'Redis', 'Docker', 'Asyncio'],
      githubUrl: 'https://github.com/billubadmash/task-queue',
    },
    {
      id: 'proj-3',
      title: 'Smart Campus Attendance Ledger',
      tagline: 'Automated campus student presence tracker with tamper-evident audit trail',
      tags: ['React', 'Node.js', 'PostgreSQL'],
      githubUrl: 'https://github.com/billubadmash/campus-ledger',
    },
  ]);

  // Interviewer Persona / Rigor
  const [interviewerStyle, setInterviewerStyle] = useState<'supportive' | 'balanced' | 'rigorous'>('rigorous');
  const [codeLanguage, setCodeLanguage] = useState<'typescript' | 'python' | 'cpp' | 'java'>('typescript');
  const [enableVoiceSynth, setEnableVoiceSynth] = useState(true);
  const [autoTimer, setAutoTimer] = useState(true);

  // Resume status
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');

  // UI status
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingHeadline, setIsEditingHeadline] = useState(false);

  useEffect(() => {
    if (userName) {
      const cleanName = userName.includes('(') ? 'Developer' : userName;
      setName((prev) => (prev.includes('(') ? cleanName : prev));
    }
  }, [userName]);

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let score = 0;
    if (name.trim() && email.trim() && phone.trim() && location.trim() && bio.trim()) score += 25;
    if (targetRole && experienceLevel && preferredDomains.length > 0) score += 20;
    if (skills.length >= 4) score += 20;
    if (linkedinUrl.trim() || githubUrl.trim()) score += 20;
    if (resumeUploaded) score += 10;
    else score += 0;
    if (experienceList.length > 0) score += 5;
    return Math.min(100, score);
  };

  const completionPercentage = calculateCompletion();

  const handleSaveAll = () => {
    localStorage.setItem('intertrain_profile_name', name);
    localStorage.setItem('intertrain_profile_email', email);
    localStorage.setItem('intertrain_profile_phone', phone);
    localStorage.setItem('intertrain_profile_location', location);
    localStorage.setItem('intertrain_profile_headline', headline);
    localStorage.setItem('intertrain_profile_bio', bio);
    localStorage.setItem('intertrain_profile_role', targetRole);
    localStorage.setItem('intertrain_profile_exp', experienceLevel);
    localStorage.setItem('intertrain_profile_goal', interviewGoal);
    localStorage.setItem('intertrain_profile_domains', JSON.stringify(preferredDomains));
    localStorage.setItem('intertrain_profile_skills', JSON.stringify(skills));
    localStorage.setItem('intertrain_profile_linkedin', linkedinUrl);
    localStorage.setItem('intertrain_profile_github', githubUrl);
    localStorage.setItem('intertrain_profile_portfolio', portfolioUrl);
    localStorage.setItem('intertrain_profile_twitter', twitterUrl);

    if (onUpdateUser) {
      onUpdateUser({ name: name.trim() || 'Developer', email: email.trim() || 'developer@intertrain.io' });
    }

    setToastMessage('Profile changes saved successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDiscard = () => {
    const savedName = localStorage.getItem('intertrain_profile_name');
    setName(savedName && !savedName.includes('(') ? savedName : userName || 'Developer');
    setEmail(localStorage.getItem('intertrain_profile_email') || userEmail || 'developer@intertrain.io');
    setPhone(localStorage.getItem('intertrain_profile_phone') || '+91 98765 43210');
    setLocation(localStorage.getItem('intertrain_profile_location') || 'Mumbai, Maharashtra');
    setHeadline(
      localStorage.getItem('intertrain_profile_headline') ||
        (userName === 'Developer' ? 'Developer' : 'Student · BCA (2024 – 2027)')
    );
    setBio(
      localStorage.getItem('intertrain_profile_bio') ||
        'Enthusiastic developer focused on full-stack development, distributed backend architecture, and generative AI integrations. Always eager to take on challenging technical mock rounds.'
    );
    setToastMessage('Changes discarded.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleAddDomain = () => {
    if (newDomainInput.trim() && !preferredDomains.includes(newDomainInput.trim())) {
      setPreferredDomains([...preferredDomains, newDomainInput.trim()]);
      setNewDomainInput('');
      setIsAddingDomain(false);
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setPreferredDomains(preferredDomains.filter((d) => d !== domainToRemove));
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
      setResumeUploaded(true);
      setToastMessage(`Resume "${file.name}" uploaded successfully!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleDownloadProfile = () => {
    const profileData = {
      name,
      email,
      phone,
      location,
      headline,
      bio,
      targetRole,
      experienceLevel,
      interviewGoal,
      preferredDomains,
      skills,
      socialLinks: { linkedin: linkedinUrl, github: githubUrl, portfolio: portfolioUrl, twitter: twitterUrl },
      education: educationList,
      experience: experienceList,
      projects: projectList,
    };
    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '_')}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage('Profile exported as JSON!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Radial Donut Calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-slate-900 font-sans pb-16 relative">
      {/* ── Toast Notification Banner ─────────────────────────────────── */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 text-sm font-semibold border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Profile
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1 max-w-2xl">
              Manage your personal information and career profile. This helps our AI interviewers
              personalize your sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Student Account
            </span>
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Profile</span>
            </button>
          </div>
        </div>

        {/* ── TOP SECTION: User Profile Card & Profile Completion Card ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Card 1: User Profile Header Card (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_8px_30px_rgba(28,57,142,0.04)] flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar with Camera badge */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 p-0.5 shadow-md shadow-blue-500/20">
                <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-white text-3xl font-black tracking-tight">
                  {name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase() || 'BB'}
                </div>
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => {
                    setToastMessage('Avatar photo updated!');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 2500);
                  }}
                />
              </label>
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 min-w-0 space-y-2.5">
              {/* Name (with inline edit) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-lg font-bold px-2.5 py-1 border border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        handleSaveAll();
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl font-bold transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {name}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Name"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Headline (with inline edit) */}
              {isEditingHeadline ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="text-xs px-2.5 py-1 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingHeadline(false);
                      handleSaveAll();
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-600">
                    {headline}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEditingHeadline(true)}
                    className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                    title="Edit Headline"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{location}</span>
                <span className="text-slate-300">•</span>
                <span className="text-blue-600 font-semibold">{targetRole}</span>
              </div>

              <p className="text-xs text-slate-600 italic bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 max-w-xl line-clamp-2">
                "{bio}"
              </p>

              {/* Skill Pills matching the design */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {skills.slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70"
                  >
                    {skill}
                  </span>
                ))}
                {skills.length > 5 && (
                  <button
                    onClick={() => setActiveTab('skills')}
                    className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                  >
                    +{skills.length - 5}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Profile Completion Card (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_8px_30px_rgba(28,57,142,0.04)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Profile Completion
                </h3>
                <span className="text-xs font-bold text-blue-600">
                  {completionPercentage}% Complete
                </span>
              </div>

              {/* Radial Donut and Subtitle */}
              <div className="flex items-center gap-4 py-1">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 90 90">
                    <circle
                      cx="45"
                      cy="45"
                      r={radius}
                      className="text-slate-100 stroke-current"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="45"
                      cy="45"
                      r={radius}
                      className="text-blue-600 stroke-current transition-all duration-700 ease-out"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-slate-900">
                    {completionPercentage}%
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-600 font-medium leading-snug">
                    Complete your profile to unlock adaptive AI questioning.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Calibrates mock difficulty to your real skills.
                  </p>
                </div>
              </div>

              {/* Checklist items */}
              <div className="space-y-1.5 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-500 font-bold shrink-0" />
                  <span>Personal details</span>
                  <span className="ml-auto text-[10px] font-bold text-emerald-600">Done</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-500 font-bold shrink-0" />
                  <span>Target role & domain</span>
                  <span className="ml-auto text-[10px] font-bold text-emerald-600">Done</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-500 font-bold shrink-0" />
                  <span>Key skills added</span>
                  <span className="ml-auto text-[10px] font-bold text-emerald-600">Done</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-3.5 h-3.5 text-emerald-500 font-bold shrink-0" />
                  <span>Social & portfolio links</span>
                  <span className="ml-auto text-[10px] font-bold text-emerald-600">Done</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  {resumeUploaded ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 font-bold shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0" />
                  )}
                  <span>Resume uploaded</span>
                  <span
                    className={`ml-auto text-[10px] font-bold ${
                      resumeUploaded ? 'text-emerald-600' : 'text-amber-500'
                    }`}
                  >
                    {resumeUploaded ? 'Done' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── HORIZONTAL TABS BAR ─────────────────────────────────────── */}
        <div className="mt-8 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: 'personal', label: 'Personal Information', icon: User },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'experience', label: 'Experience', icon: Briefcase },
            { id: 'skills', label: 'Skills', icon: Code2 },
            { id: 'projects', label: 'Projects', icon: FolderGit2 },
            { id: 'preferences', label: 'Interview Preferences', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT 1: PERSONAL INFORMATION (Matches Design) ──────── */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            {/* ── Left Column: Personal Information & Interview Preferences ─ */}
            <div className="lg:col-span-8 space-y-6">
              {/* Card 1: Personal Information Form */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_8px_30px_rgba(28,57,142,0.04)] space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Update your photo and personal details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Divya Sharma"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Address with verified badge */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Email Address</label>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Verified
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="divya.sharma@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Mumbai, Maharashtra"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio & Character Counter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Professional Bio
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {bio.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell AI interviewers about your background, career focus, and favorite technologies..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Card 2: Interview Preferences Form */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_8px_30px_rgba(28,57,142,0.04)] space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Interview Preferences
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Tune how AI interviewers calibrate difficulty and interview questions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Target Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Target Role</label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="Full-Stack Developer">Full-Stack Developer</option>
                      <option value="Backend Engineer">Backend Engineer</option>
                      <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="AI / ML Engineer">AI / ML Engineer</option>
                      <option value="Data Engineer">Data Engineer</option>
                    </select>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="Fresher">Fresher (College Student / 0 YOE)</option>
                      <option value="Junior (1 - 2 Years)">Junior (1 – 2 Years)</option>
                      <option value="Mid-Level (3 - 5 Years)">Mid-Level (3 – 5 Years)</option>
                      <option value="Senior (5+ Years)">Senior (5+ Years)</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Domains Pills */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Preferred Domains</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {preferredDomains.map((domain) => (
                      <span
                        key={domain}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80"
                      >
                        <span>{domain}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(domain)}
                          className="text-blue-400 hover:text-blue-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {isAddingDomain ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={newDomainInput}
                          onChange={(e) => setNewDomainInput(e.target.value)}
                          placeholder="e.g. System Design"
                          className="px-2.5 py-1 text-xs border border-blue-400 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 w-32"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddDomain();
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddDomain}
                          className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingDomain(false)}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingDomain(true)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border border-dashed border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Domain</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Interview Goal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Interview Goal</label>
                  <select
                    value={interviewGoal}
                    onChange={(e) => setInterviewGoal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  >
                    <option value="Placement / Internship">
                      Campus Placements & Summer Internships
                    </option>
                    <option value="Product SDE-1">Product Company SDE-1 Track</option>
                    <option value="FAANG / High Bar">FAANG & High-Bar Technical Screening</option>
                    <option value="General Upskilling">General Coding & Architectural Upskilling</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Right Column: Social Links & Quick Actions ─────────────── */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 1: Social Profiles */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_8px_30px_rgba(28,57,142,0.04)] space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">Social Profiles</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Connect your GitHub and LinkedIn to let AI tailor project questions.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* LinkedIn */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                      <span>LinkedIn</span>
                    </label>
                    <input
                      type="text"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* GitHub */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-slate-800" />
                      <span>GitHub</span>
                    </label>
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="github.com/username"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Portfolio / Website */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Portfolio / Website</span>
                    </label>
                    <input
                      type="text"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="portfolio-site.com"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Twitter / X */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <Twitter className="w-3.5 h-3.5 text-sky-500" />
                      <span>Twitter / X</span>
                    </label>
                    <input
                      type="text"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="@username"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Quick Actions & Account */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_8px_30px_rgba(28,57,142,0.04)] space-y-3">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-extrabold text-slate-900">Quick Actions</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Account management and mock preparation tools.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {/* Preview as Interviewer */}
                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="w-full py-3 flex items-center justify-between text-left hover:text-blue-600 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Eye className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-blue-600">
                          Preview as Interviewer
                        </p>
                        <p className="text-[11px] text-slate-400">
                          View the AI interviewer's candidate dossier
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {/* Download Profile */}
                  <button
                    type="button"
                    onClick={handleDownloadProfile}
                    className="w-full py-3 flex items-center justify-between text-left hover:text-blue-600 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-blue-600">
                          Download Profile
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Export complete profile JSON summary
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {/* Resume Upload */}
                  <label className="w-full py-3 flex items-center justify-between text-left hover:text-blue-600 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-blue-600">
                          {resumeUploaded ? 'Replace Resume' : 'Upload Resume'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {resumeFileName || 'PDF / DOCX for question personalization'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                  </label>

                  {/* Danger Zone: Delete / Reset */}
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          'Are you sure you want to reset your profile and history? This will restore initial student demo settings.'
                        )
                      ) {
                        if (onResetData) onResetData();
                        handleDiscard();
                        setToastMessage('Account and history reset to default.');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                      }
                    }}
                    className="w-full py-3 flex items-center justify-between text-left hover:text-red-600 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-red-600">Delete Account / Reset</p>
                        <p className="text-[11px] text-slate-400">
                          Erase mock history and clear data
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons: Discard & Save */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT 2: EDUCATION ─────────────────────────────────── */}
        {activeTab === 'education' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_8px_30px_rgba(28,57,142,0.04)] mt-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Education History</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Your academic timeline and university degrees.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newEdu: EducationItem = {
                    id: `edu-${Date.now()}`,
                    degree: 'Certification / Degree',
                    institution: 'Institution Name',
                    period: '2024 – 2025',
                    score: 'Grade / Score',
                    description: 'Key academic focus areas and achievements.',
                  };
                  setEducationList([...educationList, newEdu]);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Education</span>
              </button>
            </div>

            <div className="space-y-4">
              {educationList.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 transition-colors space-y-2 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.degree}</h4>
                      <p className="text-xs font-semibold text-blue-600">{item.institution}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {item.period}
                      </span>
                      <button
                        onClick={() =>
                          setEducationList(educationList.filter((e) => e.id !== item.id))
                        }
                        className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-emerald-600">{item.score}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT 3: EXPERIENCE ────────────────────────────────── */}
        {activeTab === 'experience' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_8px_30px_rgba(28,57,142,0.04)] mt-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Work Experience & Internships</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Past roles, student leadership, and internships for behavioral round questions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newExp: ExperienceItem = {
                    id: `exp-${Date.now()}`,
                    role: 'Software Developer Intern',
                    company: 'Organization / Startup',
                    location: 'Remote',
                    period: '2025',
                    description: 'Impact, responsibilities, and technical contributions.',
                    skills: ['Python', 'SQL'],
                  };
                  setExperienceList([...experienceList, newExp]);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Experience</span>
              </button>
            </div>

            <div className="space-y-4">
              {experienceList.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 transition-colors space-y-2 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.role}</h4>
                      <p className="text-xs font-semibold text-slate-600">
                        {item.company} • <span className="text-slate-400">{item.location}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {item.period}
                      </span>
                      <button
                        onClick={() =>
                          setExperienceList(experienceList.filter((e) => e.id !== item.id))
                        }
                        className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {item.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/70 text-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT 4: SKILLS ────────────────────────────────────── */}
        {activeTab === 'skills' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_8px_30px_rgba(28,57,142,0.04)] mt-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">Skills & Tech Stack</h3>
              <p className="text-xs text-slate-500 font-medium">
                AI interviewers will probe these languages, frameworks, and database tools.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-400 hover:text-blue-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}

                {isAddingSkill ? (
                  <div className="inline-flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="e.g. Redis, GraphQL"
                      className="px-3 py-1.5 text-xs border border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSkill();
                      }}
                    />
                    <button
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsAddingSkill(false)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingSkill(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-dashed border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Skill</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT 5: PROJECTS ──────────────────────────────────── */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_8px_30px_rgba(28,57,142,0.04)] mt-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Featured Projects</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Technical interviewers use these projects to ask real architecture and system design questions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newProj: ProjectItem = {
                    id: `proj-${Date.now()}`,
                    title: 'New Technical Project',
                    tagline: 'High performance web service / algorithm implementation',
                    tags: ['React', 'FastAPI'],
                    githubUrl: 'https://github.com/billubadmash',
                  };
                  setProjectList([...projectList, newProj]);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectList.map((project) => (
                <div
                  key={project.id}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-400 transition-all space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{project.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{project.tagline}</p>
                    </div>
                    <button
                      onClick={() => setProjectList(projectList.filter((p) => p.id !== project.id))}
                      className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {project.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-blue-700 border border-blue-200/70"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-xs font-semibold text-slate-600">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Code Repository</span>
                    </a>
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT 6: INTERVIEW PREFERENCES DEEP DIVE ─────────────── */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_8px_30px_rgba(28,57,142,0.04)] mt-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">AI Evaluation Calibration</h3>
              <p className="text-xs text-slate-500 font-medium">
                Configure voice agent responses, evaluation rigor, and coding environment.
              </p>
            </div>

            <div className="space-y-6">
              {/* Interviewer Rigor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Interviewer Evaluation Rigor
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['supportive', 'balanced', 'rigorous'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setInterviewerStyle(style)}
                      className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                        interviewerStyle === style
                          ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 capitalize">{style}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {style === 'rigorous' && 'Strict grading on latency, edge cases, and DSA.'}
                        {style === 'balanced' && 'Standard industry screening with balanced feedback.'}
                        {style === 'supportive' && 'Gentle hints, ideal for initial practice rounds.'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sandbox Default Language */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Default Live Coding Sandbox Language
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['typescript', 'python', 'cpp', 'java'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setCodeLanguage(lang)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        codeLanguage === lang
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'typescript' ? 'TypeScript' : lang === 'python' ? 'Python 3' : lang === 'cpp' ? 'C++' : 'Java'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice & Timer Toggles */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      AI Voice Speech Synthesis
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Read interview questions and moderator instructions aloud.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableVoiceSynth}
                    onChange={(e) => setEnableVoiceSynth(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Auto-start Interview Timer
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Initialize timer when questions begin.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoTimer}
                    onChange={(e) => setAutoTimer(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Calibration Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: Preview as Interviewer ────────────────────────────── */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Interviewer Candidate Dossier
                  </h3>
                  <p className="text-xs text-slate-500">
                    This is what the AI Interview Panel inspects before conducting your round.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-blue-900 text-sm">{name}</span>
                  <span className="font-bold text-blue-600 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                    {targetRole} ({experienceLevel})
                  </span>
                </div>
                <p className="text-blue-800 font-medium">{headline}</p>
                <p className="text-blue-700/80">{location} • {email}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  Candidate Bio & Summary
                </h4>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {bio}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  Verified Skills for Technical Probing
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  Preferred Focus Domains
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {preferredDomains.map((d) => (
                    <span
                      key={d}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                  AI Calibrations
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-600">
                  <p>• Evaluation Style: <span className="font-bold capitalize">{interviewerStyle}</span></p>
                  <p>• Primary Code Language: <span className="font-bold capitalize">{codeLanguage}</span></p>
                  <p>• Resume Attached: <span className="font-bold">{resumeUploaded ? 'Yes (Parsed)' : 'No'}</span></p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">
                Ready to take a live mock round?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100"
                >
                  Close
                </button>
                {onStartPractice && (
                  <button
                    onClick={() => {
                      setIsPreviewModalOpen(false);
                      onStartPractice();
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25"
                  >
                    Start Practice Session →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
