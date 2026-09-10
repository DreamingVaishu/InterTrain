import { useState, type FormEvent } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Terminal,
  Sparkles,
} from 'lucide-react'

export interface UserAuthData {
  name: string
  email: string
  isGuest?: boolean
}

export interface LoginPageProps {
  onLogin: (userData: UserAuthData) => void
  initialMode?: 'signin' | 'signup'
}

export default function LoginPage({ onLogin, initialMode = 'signup' }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onLogin({
      name: name.trim() || (isSignUp ? 'New Engineer' : 'InterTrain Candidate'),
      email: email.trim() || 'candidate@intertrain.io',
      isGuest: false,
    })
  }

  const handleGuestLogin = (role: string = 'Developer') => {
    onLogin({
      name: `Guest (${role})`,
      email: 'guest.dev@intertrain.local',
      isGuest: true,
    })
  }

  const handleOAuth = (provider: string) => {
    onLogin({
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
    })
  }

  return (
    <div className="min-h-screen bg-brand-dark flex relative overflow-hidden font-sans">
      {/* ── Ambient background effects ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-right cyan orb */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/[0.04] blur-[100px]" />
        {/* Bottom-left indigo orb */}
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.03] blur-[120px]" />
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.02] blur-[150px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Left Panel — Branding & Visual ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-10 relative">
        {/* Top: Logo */}
        <div className="flex items-center space-x-3 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            InterTrain
          </span>
        </div>

        {/* Center: Hero visual */}
        <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
          {/* Floating Robot Assembly */}
          <div className="relative mb-10">
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-44 h-44 rounded-full bg-brand-cyan/[0.06] blur-2xl pointer-events-none" />

            {/* Robot container */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Orbiting particles */}
              <div className="absolute w-full h-full animate-[spin_20s_linear_infinite]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400/60" />
                <div className="absolute bottom-4 right-2 w-1 h-1 rounded-full bg-indigo-400/40" />
              </div>
              <div className="absolute w-[90%] h-[90%] animate-[spin_15s_linear_infinite_reverse]">
                <div className="absolute top-2 right-4 w-1 h-1 rounded-full bg-cyan-300/50" />
                <div className="absolute bottom-0 left-6 w-1.5 h-1.5 rounded-full bg-violet-400/30" />
              </div>

              {/* Main Robot */}
              <div className="relative animate-float">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border border-zinc-700/60 flex items-center justify-center shadow-2xl relative overflow-hidden">
                  {/* Inner shine */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.04] to-transparent rounded-t-3xl" />
                  {/* Antenna */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan shadow-[0_0_12px_#06b6d4] animate-pulse" />
                    <div className="w-1 h-3 bg-zinc-700 rounded-b-full" />
                  </div>
                  {/* Visor */}
                  <div className="w-20 h-20 rounded-2xl bg-black border border-zinc-800/80 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                    {/* Scanline effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.03] via-transparent to-transparent pointer-events-none" />
                    {/* Eyes */}
                    <div className="flex items-center space-x-4">
                      <div className="w-5 h-5 rounded-full bg-cyan-950 border-[1.5px] border-cyan-400 flex items-center justify-center shadow-[0_0_14px_#06b6d4]">
                        <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9]" />
                      </div>
                      <div className="w-5 h-5 rounded-full bg-cyan-950 border-[1.5px] border-cyan-400 flex items-center justify-center shadow-[0_0_14px_#06b6d4]">
                        <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9]" />
                      </div>
                    </div>
                    {/* Mouth waveform */}
                    <div className="flex items-center space-x-[2px] h-3">
                      {[1, 2.5, 1.5, 3, 2, 3.5, 1.5, 2.5, 1].map((h, i) => (
                        <span
                          key={i}
                          className="w-[2px] bg-cyan-400/70 rounded-full animate-pulse"
                          style={{
                            height: `${h * 3}px`,
                            animationDelay: `${i * 80}ms`,
                            animationDuration: '1.2s',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-2xl font-bold text-white text-center mb-3 tracking-tight">
            Practice interviews with
            <br />
            <span className="text-gradient-cyan">AI that adapts to you</span>
          </h2>
          <p className="text-sm text-zinc-500 text-center max-w-sm leading-relaxed">
            AI interviewers simulate realistic tech rounds — questioning,
            evaluating code, and scoring speech cadence in real time.
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-8">
            {[
              { value: '4+', label: 'Practice Tracks' },
              { value: 'Live', label: 'Audio & Code' },
              { value: '100%', label: 'Adaptive Feedback' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-lg font-bold text-white font-mono">
                  {stat.value}
                </div>
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Subtle footer */}
        <div className="text-[11px] text-zinc-700 animate-fade-in">
          © {new Date().getFullYear()} InterTrain · College Finale Edition
        </div>
      </div>

      {/* ── Vertical Divider ── */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-brand-border to-transparent my-10" />

      {/* ── Right Panel — Auth Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-[400px] animate-scale-in">
          {/* Mobile logo (visible on small screens) */}
          <div className="flex lg:hidden items-center justify-center space-x-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              InterTrain
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-zinc-500">
              {isSignUp
                ? 'Sign up to start live mock interviews and analytics'
                : 'Sign in to access your interview practice tracks'}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuth('GitHub')}
              className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium text-zinc-300 hover:bg-brand-card hover:border-zinc-600 hover:text-white transition cursor-pointer"
            >
              <svg className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('Google')}
              className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-sm font-medium text-zinc-300 hover:bg-brand-card hover:border-zinc-600 hover:text-white transition cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-brand-border" />
            <span className="text-[11px] text-zinc-600 uppercase tracking-wider font-medium">
              or continue with email
            </span>
            <div className="flex-1 h-px bg-brand-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (sign up only) */}
            {isSignUp && (
              <div className="animate-slide-down">
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-medium text-zinc-400 mb-1.5"
                >
                  Full name
                </label>
                <div
                  className={`relative rounded-xl border transition-all duration-200 ${
                    focusedField === 'name'
                      ? 'border-brand-cyan/50 shadow-[0_0_12px_-4px_rgba(6,182,212,0.25)]'
                      : 'border-brand-border hover:border-zinc-600'
                  }`}
                >
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Jane Doe"
                    className="w-full bg-brand-surface rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-zinc-400 mb-1.5"
              >
                Email address
              </label>
              <div
                className={`relative rounded-xl border transition-all duration-200 ${
                  focusedField === 'email'
                    ? 'border-brand-cyan/50 shadow-[0_0_12px_-4px_rgba(6,182,212,0.25)]'
                    : 'border-brand-border hover:border-zinc-600'
                }`}
              >
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className={`w-4 h-4 transition-colors ${focusedField === 'email' ? 'text-brand-cyan' : 'text-zinc-600'}`} />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className="w-full bg-brand-surface rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-medium text-zinc-400"
                >
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    className="text-[11px] text-brand-cyan hover:text-cyan-300 transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div
                className={`relative rounded-xl border transition-all duration-200 ${
                  focusedField === 'password'
                    ? 'border-brand-cyan/50 shadow-[0_0_12px_-4px_rgba(6,182,212,0.25)]'
                    : 'border-brand-border hover:border-zinc-600'
                }`}
              >
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className={`w-4 h-4 transition-colors ${focusedField === 'password' ? 'text-brand-cyan' : 'text-zinc-600'}`} />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••••"
                  className="w-full bg-brand-surface rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-zinc-300 transition cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-cyan text-zinc-950 font-semibold text-sm hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-950/40 hover:shadow-cyan-500/25 cursor-pointer group mt-2"
            >
              <span>{isSignUp ? 'Create Account & Enter Platform' : 'Sign In & Enter Platform'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Toggle sign up / sign in */}
          <p className="text-center text-sm text-zinc-500 mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand-cyan hover:text-cyan-300 font-medium transition cursor-pointer"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>

          {/* Developer / Guest Login Quick Bypass */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Developer Mode
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Instant bypass</span>
            </div>

            <button
              type="button"
              onClick={() => handleGuestLogin('Developer')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 hover:text-white text-xs font-semibold transition-all shadow-sm group cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Continue as Guest (Instant Access)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Quick Role Presets for Dev Testing */}
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {[
                { label: 'DevOps', role: 'DevOps' },
                { label: 'Backend', role: 'Backend' },
                { label: 'Full-Stack', role: 'Full-Stack' },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleGuestLogin(p.role)}
                  className="py-1 px-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition text-center cursor-pointer truncate"
                  title={`Login directly as ${p.role} guest`}
                >
                  ⚡ {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-[10px] text-zinc-700 mt-4 leading-relaxed">
            By continuing, you agree to InterTrain's{' '}
            <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer transition">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer transition">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export { LoginPage as SignUpPage }
