import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, ArrowRight, Key, AlertTriangle, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { motion, AnimatePresence } from 'motion/react';
import { useSecurityStore } from '@/store/security';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  
  const navigate = useNavigate();
  
  // Security store hooks
  const checkLockout = useSecurityStore((state) => state.checkLockout);
  const registerFailedLogin = useSecurityStore((state) => state.registerFailedLogin);
  const registerSuccessfulLogin = useSecurityStore((state) => state.registerSuccessfulLogin);
  const addLog = useSecurityStore((state) => state.addLog);
  
  const [lockoutState, setLockoutState] = useState(checkLockout(email));

  // Load remembered email on startup
  useEffect(() => {
    const savedEmail = localStorage.getItem('remember_me_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Lockout check interval tick
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStatus = checkLockout(email);
      setLockoutState(currentStatus);
    }, 1000);
    return () => clearInterval(interval);
  }, [email, checkLockout]);

  // Client-side Input Validation
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailTrimmed = email.trim();
    
    if (!emailTrimmed) {
      newErrors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailTrimmed)) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Safe Authentication Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const currentLock = checkLockout(email);
    if (currentLock.isLocked) {
      toast.error(`Too many attempts. Locked out for ${currentLock.remainingSeconds}s.`);
      addLog('AUTH', 'CRITICAL', 'Locked User Sign-in Blocked', `Locked account [${email}] tried to log in.`, email);
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    // SQLi Defense
    const sqlInjectionPattern = /('|--|#|\/\*|\*\/|union|select|insert|delete|drop|update)/gi;
    if (sqlInjectionPattern.test(email) || sqlInjectionPattern.test(password)) {
      addLog('API', 'CRITICAL', 'SQL Injection Pattern Blocked', `SQLi attempt blocked: [${email}]`, email);
      toast.error('Invalid character sequence detected in inputs.');
      registerFailedLogin(email);
      setIsLoading(false);
      return;
    }

    try {
      // 1. Try real Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (!error && data?.user) {
        registerSuccessfulLogin(email.trim());
        
        // Handle Remember Me
        if (rememberMe) {
          localStorage.setItem('remember_me_email', email.trim());
        } else {
          localStorage.removeItem('remember_me_email');
        }

        toast.success('Signed in successfully.');
        navigate(ROUTES.DASHBOARD);
        return;
      }

      // 2. Demo accounts fallback
      const sanitizedEmail = email.trim().toLowerCase();
      let matchedRole: 'admin' | 'officer' | 'viewer' | null = null;
      if (sanitizedEmail === 'admin@enterprise.com' && password === 'EnterpriseSecure123!') {
        matchedRole = 'admin';
      } else if (sanitizedEmail === 'officer@enterprise.com' && password === 'OfficerSecure123!') {
        matchedRole = 'officer';
      } else if (sanitizedEmail === 'viewer@enterprise.com' && password === 'ViewerSecure123!') {
        matchedRole = 'viewer';
      }

      if (matchedRole) {
        registerSuccessfulLogin(sanitizedEmail);
        useSecurityStore.getState().changeRole(matchedRole);
        
        // Handle Remember Me
        if (rememberMe) {
          localStorage.setItem('remember_me_email', sanitizedEmail);
        } else {
          localStorage.removeItem('remember_me_email');
        }

        toast.success(`Welcome back. Logged in as ${matchedRole.toUpperCase()}`);
        navigate(ROUTES.DASHBOARD);
      } else {
        const lockoutResult = registerFailedLogin(email.trim());
        if (lockoutResult.isLocked) {
          toast.error(`Too many failed logins. Your account is locked for 60 seconds.`);
        } else {
          toast.error('Invalid email or password.');
          setErrors({ general: 'The email or password you entered is incorrect.' });
        }
      }
    } catch (err: any) {
      setErrors({ general: 'A connection error occurred. Please try again.' });
      addLog('SYSTEM', 'CRITICAL', 'Authentication Exception', `${err?.message || err}`, email);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo accounts helper
  const loadTestingPreset = (type: 'admin' | 'officer' | 'viewer') => {
    setErrors({});
    if (type === 'admin') {
      setEmail('admin@enterprise.com');
      setPassword('EnterpriseSecure123!');
      toast.info('Loaded administrator test account details.');
    } else if (type === 'officer') {
      setEmail('officer@enterprise.com');
      setPassword('OfficerSecure123!');
      toast.info('Loaded compliance officer test account details.');
    } else if (type === 'viewer') {
      setEmail('viewer@enterprise.com');
      setPassword('ViewerSecure123!');
      toast.info('Loaded viewer test account details.');
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 font-sans bg-white text-neutral-900 selection:bg-neutral-900/10">
      
      {/* LEFT SPLIT COLUMN: Premium Brand Side Panel (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-neutral-950 text-white flex-col justify-between p-16 relative overflow-hidden">
        {/* Abstract background mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-neutral-800/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-white text-black p-2 rounded-xl flex items-center justify-center shadow-md">
            <ShieldAlert className="h-6 w-6 text-neutral-900" />
          </div>
          <span className="text-xl font-bold tracking-tight">Compliance AI</span>
        </div>

        {/* Marketing Value Prop */}
        <div className="space-y-8 relative z-10 my-auto">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Enterprise Security Grade
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight max-w-md">
              Trust & Transparency, Automated.
            </h1>
            <p className="text-neutral-400 text-[14px] leading-relaxed max-w-sm">
              Register business entities, verify regulatory credentials, and monitor company compliance scores in real time.
            </p>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-neutral-800 max-w-sm">
            <div>
              <h4 className="text-3xl font-extrabold text-white">10x</h4>
              <p className="text-xs text-neutral-400 mt-1">Faster Document Reviews</p>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-white">100%</h4>
              <p className="text-xs text-neutral-400 mt-1">Real-time Risk Reports</p>
            </div>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="text-xs text-neutral-500 relative z-10 flex items-center gap-4">
          <span>Certified SOC2 Type II</span>
          <span>•</span>
          <span>ISO 27001 Enforced</span>
        </div>
      </div>

      {/* RIGHT SPLIT COLUMN: Aligned Form Panel */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 bg-neutral-50/50">
        
        {/* Content Container (Perfect vertical & horizontal centering) */}
        <div className="w-full max-w-[440px] space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-neutral-200/80 shadow-sm">
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Sign In
            </h2>
            <p className="text-sm text-neutral-500">
              Welcome back. Enter your account details below.
            </p>
          </div>

          {/* Lockout banner */}
          <AnimatePresence>
            {lockoutState.isLocked && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800"
              >
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Too Many Attempts</p>
                  <p className="text-xs text-red-700/90 mt-1">
                    Sign-ins are temporarily disabled. Please wait <span className="font-bold text-red-800 font-mono text-sm">{lockoutState.remainingSeconds}s</span> before retrying.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Email Address
              </label>
              <Input 
                id="email"
                type="email" 
                disabled={lockoutState.isLocked || isLoading}
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-900 rounded-xl font-medium placeholder-neutral-400"
                aria-required="true"
              />
              {errors.email && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.email}
                </p>
              )}
            </div>
            
            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  disabled={lockoutState.isLocked || isLoading}
                  placeholder="••••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-900 rounded-xl pr-10 placeholder-neutral-400"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs font-semibold text-neutral-600 select-none cursor-pointer hover:text-neutral-900 transition-colors">
                  Remember me
                </label>
              </div>
              <Link to={ROUTES.AUTH.FORGOT_PASSWORD} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* General validation error */}
            {errors.general && (
              <p className="text-xs text-red-600 font-semibold text-center mt-2 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2 justify-center">
                <AlertTriangle className="h-4 w-4 text-red-500" /> {errors.general}
              </p>
            )}

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={lockoutState.isLocked || isLoading}
              className="w-full h-11 text-[14px] font-bold mt-4 group rounded-xl bg-neutral-900 text-white hover:bg-neutral-850 transition-all duration-200 shadow-sm" 
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          {/* Redirect link */}
          <div className="text-center pt-2">
            <p className="text-xs text-neutral-500">
              Don't have an account?{' '}
              <Link to={ROUTES.AUTH.REGISTER} className="font-bold text-neutral-900 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Test account selector - streamlined & beautiful */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-neutral-400" />
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Sandbox Accounts</h4>
            </div>
            <p className="text-[11px] text-neutral-400">
              Instantly log in using preconfigured workspace permissions:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => loadTestingPreset('admin')}
                className="text-[11px] font-semibold py-2 px-1 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all text-center"
              >
                Admin
              </button>
              <button 
                type="button"
                onClick={() => loadTestingPreset('officer')}
                className="text-[11px] font-semibold py-2 px-1 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all text-center"
              >
                Officer
              </button>
              <button 
                type="button"
                onClick={() => loadTestingPreset('viewer')}
                className="text-[11px] font-semibold py-2 px-1 border border-neutral-200 rounded-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all text-center"
              >
                Viewer
              </button>
            </div>
          </div>
        </div>

        {/* Small footer */}
        <p className="mt-8 text-xs text-neutral-400">
          Enforced by enterprise access control guidelines.
        </p>
      </div>
    </div>
  );
}
