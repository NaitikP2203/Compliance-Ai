import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, ArrowLeft, Check, X, AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { motion, AnimatePresence } from 'motion/react';
import { useSecurityStore } from '@/store/security';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();
  const addLog = useSecurityStore((state) => state.addLog);

  // Real-time password requirement checkers
  const passwordRequirements = [
    { label: 'At least 12 characters long', test: (p: string) => p.length >= 12 },
    { label: 'One uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number (0-9)', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One special character (!@#$%^&*)', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ];

  const checkRequirementsMet = () => {
    return passwordRequirements.every(req => req.test(password));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validations
    const newErrors: { [key: string]: string } = {};
    if (!password) {
      newErrors.password = 'A new secure password is required.';
    } else if (!checkRequirementsMet()) {
      newErrors.password = 'Password does not meet strength requirements.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try real Supabase password update
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      addLog('AUTH', 'INFO', 'Password Reset Successful', 'A password reset transaction was finalized successfully.');
      setSubmitted(true);
      toast.success('Your password has been successfully updated.');
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to update password. Please check your recovery link or try again.' });
      addLog('SYSTEM', 'CRITICAL', 'Password Update Exception', `${err?.message || err}`);
    } finally {
      setIsLoading(false);
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
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Secure Profile Lock
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight max-w-md">
              Reset Your Password
            </h1>
            <p className="text-neutral-400 text-[14px] leading-relaxed max-w-sm">
              Enter a new password conforming to our cryptographic strength metrics to fully restore your enterprise workspace credentials.
            </p>
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
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 bg-neutral-50/50">
        
        {/* Content Container (Perfect vertical & horizontal centering) */}
        <div className="w-full max-w-[440px] space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-neutral-200/80 shadow-sm my-6">
          
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                    Reset Password
                  </h2>
                  <p className="text-sm text-neutral-500">
                    Please configure a strong new password for your account.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleUpdate} className="space-y-4">
                  
                  {/* Password field */}
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"} 
                        disabled={isLoading}
                        placeholder="••••••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-900 rounded-xl placeholder-neutral-400" 
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
                    {errors.password && <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> {errors.password}</p>}
                  </div>

                  {/* Confirm Password field */}
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <Input 
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"} 
                      disabled={isLoading}
                      placeholder="••••••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-900 rounded-xl placeholder-neutral-400" 
                      aria-required="true"
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> {errors.confirmPassword}</p>}
                  </div>

                  {/* Password Strength matrix */}
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/60 space-y-2">
                    <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">Password Strength Checklist</p>
                    <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                      {passwordRequirements.map((req, i) => {
                        const met = req.test(password);
                        return (
                          <div key={i} className="flex items-center text-xs">
                            {met ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500 mr-2 flex-shrink-0 font-bold" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-neutral-300 mr-2 flex-shrink-0" />
                            )}
                            <span className={met ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {errors.general && (
                    <p className="text-xs text-red-600 font-semibold text-center mt-2 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2 justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-500" /> {errors.general}
                    </p>
                  )}

                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 text-[14px] font-bold mt-2 group rounded-xl bg-neutral-900 text-white hover:bg-neutral-850 transition-all duration-200 shadow-sm" 
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-5 py-4"
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Check className="h-5 w-5 font-bold" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-neutral-900">Password Updated</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Your account credentials have been successfully updated. You can now use your new password to sign in.
                  </p>
                </div>
                <div className="pt-2">
                  <Button 
                    onClick={() => navigate(ROUTES.AUTH.LOGIN)}
                    className="w-full h-11 text-xs font-bold rounded-xl bg-neutral-900 text-white hover:bg-neutral-850"
                  >
                    Go to Sign In
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-px bg-neutral-100" />

          {/* Back link */}
          <div className="text-center">
            <Link to={ROUTES.AUTH.LOGIN} className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-black transition-colors group">
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to Sign In
            </Link>
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
