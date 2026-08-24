import React, { useState } from 'react';
import axios from 'axios';
import {
  ShieldCheck, LogIn, UserPlus, AlertCircle, ArrowRight,
  Mail, KeyRound, CheckCircle2, Fingerprint, Eye, EyeOff
} from 'lucide-react';

interface AuthPagesProps {
  apiUrl: string;
  onAuthSuccess: (token: string, username: string) => void;
  onContinueGuest: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthPages: React.FC<AuthPagesProps> = ({
  apiUrl,
  onAuthSuccess,
  onContinueGuest,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Shared form state
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Reset flow state
  const [resetCode, setResetCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [codeSentTo, setCodeSentTo] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password visibility toggles (eye icon)
  const [showLoginPwd, setShowLoginPwd] = useState<boolean>(false);
  const [showSignupPwd, setShowSignupPwd] = useState<boolean>(false);
  const [showNewPwd, setShowNewPwd] = useState<boolean>(false);

  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isResetFlow = mode === 'forgot' || mode === 'reset';

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!isResetFlow) {
      setResetCode('');
      setNewPassword('');
    }
  };

  // ---------------------------------------------------------------------
  // LOGIN / SIGNUP
  // ---------------------------------------------------------------------
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (isSignup && username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }
    if (password.trim() === '') {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        const response = await axios.post(`${apiUrl}/auth/login`, { email: email.trim(), password });
        onAuthSuccess(response.data.access_token, response.data.username || email.trim());
      } else {
        await axios.post(`${apiUrl}/auth/register`, { username, email: email.trim(), password });
        const loginResponse = await axios.post(`${apiUrl}/auth/login`, { email: email.trim(), password });
        setSuccessMsg('Account created successfully! Redirecting to your console...');
        onAuthSuccess(loginResponse.data.access_token, loginResponse.data.username || username);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------
  // FORGOT PASSWORD â€” STEP 1: request code via email
  // ---------------------------------------------------------------------
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await axios.post(`${apiUrl}/auth/forgot-password`, { email });
      setCodeSentTo(email.trim());
      setSuccessMsg('If that email is registered, a 6-digit reset code has been sent to your inbox.');
      setMode('reset');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Could not process the reset request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------
  // FORGOT PASSWORD â€” STEP 2: verify code & set new password
  // ---------------------------------------------------------------------
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(resetCode.trim())) {
      setErrorMsg('Enter the 6-digit code from your email.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await axios.post(`${apiUrl}/auth/reset-password`, {
        email: codeSentTo,
        code: resetCode.trim(),
        new_password: newPassword
      });
      setSuccessMsg('Password updated successfully! You can now log in with your new password.');
      setPassword('');
      setResetCode('');
      setNewPassword('');
      setMode('login');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Password reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Theme accents differ between Login (violet/indigo) and Signup (cyan/violet)
  const accentGlow = isLogin
    ? 'top-24 -left-24 w-[380px] h-[380px] bg-blue-500/10'
    : 'bottom-10 -right-24 w-[380px] h-[380px] bg-sky-500/10';

  const headerTitle = isLogin
    ? 'Welcome Back'
    : isSignup
      ? 'Create Account'
      : mode === 'forgot'
        ? 'Reset Password'
        : 'Enter Reset Code';

  const headerSubtitle = isLogin
    ? 'Sign in to access your forensic audit history'
    : isSignup
      ? 'Register with your email to unlock scan history tracking'
      : mode === 'forgot'
        ? "Enter the email linked to your account â€” we'll send a 6-digit verification code"
        : `Enter the 6-digit code sent to ${codeSentTo || 'your email'} and choose a new password`;

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col justify-center min-h-[80vh] relative">
      {/* Background radial highlight â€” position/color varies by mode */}
      <div className={`absolute ${accentGlow} rounded-full blur-[90px] pointer-events-none -z-10`}></div>
      {!isSignup && (
        <div className="absolute bottom-0 -right-24 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>
      )}

      <div className="p-8 rounded-3xl bg-white dark:bg-[#131c30] border border-zinc-200 dark:border-blue-900/40 shadow-2xl shadow-blue-500/5 transition-colors duration-300">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className={`h-12 w-12 bg-gradient-to-tr ${isSignup ? 'from-sky-500 to-blue-600' : 'from-blue-500 to-sky-500'} rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4`}>
            {isResetFlow ? (
              <KeyRound className="h-6 w-6 text-white" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {headerTitle}
          </h2>
          <p className={`text-xs mt-2 max-w-[280px] text-center leading-relaxed ${isSignup ? 'text-sky-600 dark:text-sky-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {headerSubtitle}
          </p>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 flex items-start gap-2.5 mb-6 text-xs shadow-md shadow-blue-500/5">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-900/30 text-green-600 dark:text-green-400 flex items-start gap-2.5 mb-6 text-xs shadow-md shadow-green-500/5">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* ============================= LOGIN ============================= */}
        {isLogin && (
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-[11px] font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showLoginPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 pr-11 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPwd((v) => !v)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  title={showLoginPwd ? 'Hide password' : 'Show password'}
                >
                  {showLoginPwd ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/15 hover:shadow-blue-600/25 transition-all duration-200 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="h-4.5 w-4.5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        )}

        {/* ============================ SIGNUP ============================ */}
        {isSignup && (
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Username</label>
              <input
                type="text"
                required
                minLength={3}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition"
                />
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Used for password recovery codes</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showSignupPwd ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 pr-11 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPwd((v) => !v)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  title={showSignupPwd ? 'Hide password' : 'Show password'}
                >
                  {showSignupPwd ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-sm font-bold shadow-lg shadow-sky-500/15 hover:shadow-blue-600/25 transition-all duration-200 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="h-4.5 w-4.5" />
                  Create Account
                </>
              )}
            </button>
          </form>
        )}

        {/* ======================= FORGOT: STEP 1 ======================== */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/15 transition-all duration-200 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Mail className="h-4.5 w-4.5" />
                  Send Reset Code
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-blue-500 hover:underline"
            >
              &larr; Back to Sign In
            </button>
          </form>
        )}

        {/* ======================= FORGOT: STEP 2 ======================== */}
        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Verification Code</label>
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                placeholder="- - - - - -"
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-lg text-center font-mono font-bold tracking-[0.5em] text-blue-600 dark:text-blue-300 placeholder-zinc-300 dark:placeholder-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
              />
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Didn&apos;t receive it?{' '}
                <button type="button" onClick={() => setMode('forgot')} className="font-bold text-blue-500 hover:underline">
                  Resend code
                </button>
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 pr-11 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-[#0c1322]/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  title={showNewPwd ? 'Hide password' : 'Show password'}
                >
                  {showNewPwd ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-600/15 transition-all duration-200 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Fingerprint className="h-4.5 w-4.5" />
                  Update Password
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-blue-500 hover:underline"
            >
              &larr; Back to Sign In
            </button>
          </form>
        )}

        {/* ===================== FOOTER LINKS ============================ */}
        {(isLogin || isSignup) && (
          <div className="mt-6 flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800/80 pt-6 text-center">
            <button
              onClick={() => switchMode(isLogin ? 'signup' : 'login')}
              className={`text-xs font-semibold hover:underline ${
                isLogin ? 'text-sky-600 dark:text-sky-400' : 'text-blue-500'
              }`}
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already registered? Sign In'}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
              <span className="flex-shrink mx-4 text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold">Or</span>
              <div className="flex-grow border-t border-zinc-100 dark:border-zinc-800"></div>
            </div>

            <button
              onClick={onContinueGuest}
              className="flex items-center justify-center gap-1 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-white transition mx-auto"
            >
              Continue as Guest
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
