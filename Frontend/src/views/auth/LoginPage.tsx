import { useState, type FormEvent, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Code2,
  BarChart3,
  MessageSquare,
  Zap,
} from 'lucide-react';
import loginFullBg from '../../assets/login.jpg';
import intertrainLogo from '../../assets/logo.jpg';

export interface UserAuthData {
  name: string;
  email: string;
  isGuest?: boolean;
}

export interface LoginPageProps {
  onLogin: (userData: UserAuthData) => void;
  initialMode?: 'signin' | 'signup';
}

export default function LoginPage({ onLogin, initialMode = 'signin' }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const resolvedName = name.trim() || 'Divya Sharma';
    const resolvedEmail = email.trim() || 'divya.sharma@example.com';
    onLogin({
      name: resolvedName,
      email: resolvedEmail,
      isGuest: false,
    });
  };

  const handleGuestLogin = () => {
    onLogin({
      name: 'Divya Sharma',
      email: 'divya.sharma@example.com',
      isGuest: true,
    });
  };

  const handleOAuth = (provider: string) => {
    onLogin({
      name: 'Divya Sharma',
      email: `divya.sharma@${provider.toLowerCase()}.com`,
      isGuest: false,
    });
  };

  return (
    <>
      <style>{`
        @keyframes floatBadge1 {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-7px) rotate(1deg); }
        }
        @keyframes floatBadge2 {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-5px) rotate(5deg); }
        }
        @keyframes floatBubble {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.02); }
        }
        .anim-badge-1 { animation: floatBadge1 4.5s ease-in-out infinite; }
        .anim-badge-2 { animation: floatBadge2 5.5s ease-in-out infinite; }
        .anim-bubble { animation: floatBubble 5s ease-in-out infinite; }
      `}</style>

      {/* Main viewport container */}
      <div className="min-h-screen lg:h-screen lg:overflow-hidden relative flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">

        {/* ── FULL SCREEN OFFICE BACKGROUND ──────────────────────────────── */}
        <div
          className="absolute inset-0 bg-cover bg-center lg:bg-[center_top] bg-no-repeat pointer-events-none transition-transform duration-1000 scale-[1.01]"
          style={{
            backgroundImage: `url(${loginFullBg})`,
            filter: 'contrast(1.02) brightness(0.98)',
          }}
        />

        {/* Subtle, professional ambient gradient vignette for optimal contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/25 to-white/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-white/30 pointer-events-none" />

        {/* ── TOP HEADER / BRAND BAR ─────────────────────────────────────── */}
        <header
          className={`relative z-20 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 pt-4 sm:pt-6 flex items-center justify-between shrink-0 transition-opacity duration-500 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-3">
            <img
              src={intertrainLogo}
              alt="InterTrain Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-white/80 shadow-xs shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                InterTrain
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#1D68FE] tracking-wide mt-0.5 leading-none">
                Practice · Perform · Grow
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
            <span className="text-slate-600 font-medium hidden sm:inline">
              {isSignUp ? 'Already have an account?' : 'Need an account?'}
            </span>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/90 bg-white/90 hover:bg-white text-slate-700 hover:text-[#1D68FE] font-bold transition-all shadow-xs backdrop-blur-xs cursor-pointer active:scale-95"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </header>

        {/* ── MAIN CONTENT GRID ──────────────────────────────────────────── */}
        <main className="relative z-10 flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-10 lg:px-14 py-3 sm:py-4 flex items-center">
          <div className="w-full grid lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-center">

            {/* ═══════════════════════════════════════════════════════════════════════
                LEFT SECTION: Headline, Features & Floating Elements (7 cols)
                ═══════════════════════════════════════════════════════════════════════ */}
            <div
              className={`lg:col-span-7 flex flex-col justify-between min-h-[440px] lg:min-h-[500px] transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              {/* Headline and Subtitle */}
              <div className="max-w-xl">
                <h1 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[50px] font-black text-slate-900 tracking-tight leading-[1.12]">
                  Practice interviews<br />
                  with AI that<br />
                  <span className="text-[#1D68FE]">adapts to you.</span>
                </h1>
                <p className="text-sm sm:text-[15px] text-slate-700 font-medium mt-3 max-w-lg leading-relaxed">
                  AI interviewers simulate realistic tech rounds — questioning, evaluating code, and scoring your communication in real time.
                </p>
              </div>

              {/* Middle / Bottom Area: Feature Cards on Left + Floating Badges over Robot */}
              <div className="relative grid sm:grid-cols-12 gap-5 items-end pt-4">

                {/* 3 Vertical Feature Cards on Left (5.5 cols) — Cohesive Signature Blue */}
                <div className="sm:col-span-6 space-y-3 relative z-20">
                  {/* 1. Live Mock Interviews */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/92 backdrop-blur-md border border-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_24px_rgba(29,104,254,0.12)] hover:-translate-y-0.5 hover:bg-white transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D68FE] to-[#1250D4] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                      <MessageSquare className="w-5 h-5 fill-white/20" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        Live Mock Interviews
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Realistic AI interviewers for technical and behavioral rounds.
                      </p>
                    </div>
                  </div>

                  {/* 2. Detailed Analytics */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/92 backdrop-blur-md border border-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_24px_rgba(29,104,254,0.12)] hover:-translate-y-0.5 hover:bg-white transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D68FE] to-[#1250D4] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        Detailed Analytics
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Understand your strengths and areas to improve.
                      </p>
                    </div>
                  </div>

                  {/* 3. Personalized Practice */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/92 backdrop-blur-md border border-white/95 shadow-[0_4px_16px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_24px_rgba(29,104,254,0.12)] hover:-translate-y-0.5 hover:bg-white transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1D68FE] to-[#1250D4] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                      <Zap className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        Personalized Practice
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        Adaptive questions based on your performance and goals.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Badges positioned above the robot (6.5 cols) */}
                <div className="sm:col-span-6 relative h-[220px] pointer-events-none">
                  {/* Floating Badge 1: Code </> Cube */}
                  <div className="absolute top-2 left-6 z-20 anim-badge-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-[#1D68FE] text-white flex items-center justify-center shadow-xl shadow-blue-500/35 border-2 border-white/50">
                      <span className="font-mono font-bold text-lg select-none">&lt;/&gt;</span>
                    </div>
                  </div>

                  {/* Floating Badge 2: Chart Bar Cube */}
                  <div className="absolute bottom-16 -left-3 z-20 anim-badge-2">
                    <div className="w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-xs border border-blue-100 text-[#1D68FE] flex items-center justify-center shadow-lg shadow-blue-500/15">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Floating Badge 3: Speech Bubble above robot */}
                  <div className="absolute -top-6 right-2 z-20 anim-bubble">
                    <div className="bg-white/95 rounded-2xl px-4 py-2.5 shadow-xl shadow-blue-900/10 border border-blue-100 max-w-[205px] relative pointer-events-auto backdrop-blur-xs">
                      <p className="text-[11px] font-bold text-slate-700 leading-tight">
                        Better Preparation<br />
                        <span className="text-[#1D68FE] font-black">Brighter Opportunities!</span>
                      </p>
                      {/* Tail */}
                      <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white border-b border-r border-blue-100 rotate-45" />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════════════
                RIGHT SECTION: Welcome Back Authentication Card (5 cols)
                ═══════════════════════════════════════════════════════════════════════ */}
            <div
              className={`lg:col-span-5 w-full max-w-[450px] mx-auto transition-all duration-700 delay-100 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-[32px] p-8 sm:p-9 border border-white/90 shadow-[0_24px_64px_-12px_rgba(15,23,42,0.14),0_0_0_1px_rgba(255,255,255,0.8)] space-y-4">

                {/* Title & Subtitle */}
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
                    {isSignUp ? 'Create your account' : 'Welcome Back'}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-1 leading-snug">
                    {isSignUp
                      ? 'Start your personalized mock interview journey.'
                      : 'Continue your interview preparation journey.'}
                  </p>
                </div>

                {/* OAuth Buttons (Side by Side) */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => handleOAuth('Google')}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                    </svg>
                    <span className="truncate">Continue with Google</span>
                  </button>

                  {/* GitHub */}
                  <button
                    type="button"
                    onClick={() => handleOAuth('GitHub')}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4 text-slate-900 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span className="truncate">Continue with GitHub</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="w-full border-t border-slate-200" />
                  <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    OR
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Full name (if signing up) */}
                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Divya Sharma"
                          className="w-full bg-[#F8FAFC] hover:bg-white focus:bg-white text-sm text-slate-900 placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-xl border border-slate-200/90 focus:outline-none focus:border-[#1D68FE] focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="divya.sharma@example.com"
                        required
                        className="w-full bg-[#F8FAFC] hover:bg-white focus:bg-white text-sm text-slate-900 placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-xl border border-slate-200/90 focus:outline-none focus:border-[#1D68FE] focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-[#F8FAFC] hover:bg-white focus:bg-white text-sm text-slate-900 placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-xl border border-slate-200/90 focus:outline-none focus:border-[#1D68FE] focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password Row */}
                  <div className="flex items-center justify-between pt-0.5 pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-[#1D68FE] border-slate-300 focus:ring-[#1D68FE] cursor-pointer"
                      />
                      <span className="text-xs text-slate-600 font-medium">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {}}
                      className="text-xs font-semibold text-[#1D68FE] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Primary Button */}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#1D68FE] via-[#1A60F0] to-[#1250D4] hover:from-[#175BE0] hover:to-[#0E47C7] text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(29,104,254,0.45)] hover:shadow-[0_12px_24px_-4px_rgba(29,104,254,0.55)] transition-all duration-200 cursor-pointer mt-1 active:scale-[0.98]"
                  >
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Mode Toggle Switch */}
                <div className="text-center pt-1">
                  <span className="text-xs text-slate-500 font-normal">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs font-semibold text-[#1D68FE] hover:underline cursor-pointer"
                  >
                    {isSignUp ? 'Sign In' : 'Sign up'}
                  </button>
                </div>

                {/* Divider: Or continue as */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="w-full border-t border-slate-200" />
                  <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400">
                    Or continue as
                  </span>
                </div>

                {/* Developer Mode Instant Bypass */}
                <div className="bg-gradient-to-r from-blue-50/90 via-slate-50/80 to-blue-50/60 rounded-2xl p-3.5 border border-blue-100/90 flex items-center justify-between hover:border-blue-200 hover:shadow-xs transition-all duration-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100/90 text-[#1D68FE] flex items-center justify-center shrink-0 shadow-2xs">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        Developer Mode
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Skip onboarding and explore directly
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="text-xs font-bold text-[#1D68FE] hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors group"
                  >
                    <span>Instant Access</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </main>

        {/* ── SUBTLE BOTTOM FOOTER BAR ────────────────────────────────────── */}
        <footer className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 pb-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>© 2026 InterTrain. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-800 cursor-pointer transition-colors">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-800 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </footer>

      </div>
    </>
  );
}

export { LoginPage as SignUpPage };
