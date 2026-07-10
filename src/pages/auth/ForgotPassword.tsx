import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, ArrowLeft, Mail, AlertTriangle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { motion, AnimatePresence } from 'motion/react';
import { useSecurityStore } from '@/store/security';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const addLog = useSecurityStore((state) => state.addLog);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input validation
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Trigger Supabase password reset
      await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}${ROUTES.AUTH.RESET_PASSWORD}`,
      });

      // 2. Log security audit event
      addLog(
        'AUTH',
        'INFO',
        'Password Reset Requested',
        `A password recovery ticket has been logged for [${trimmedEmail}].`,
        trimmedEmail
      );

      // Show success screen
      setSubmitted(true);
      toast.success('Reset link sent to your email.');
    } catch (err: any) {
      setError('Unable to send reset email. Please try again.');
      addLog('SYSTEM', 'CRITICAL', 'Password Recovery Dispatch Failure', `${err?.message || err}`, trimmedEmail);
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
              Reset Credentials
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight max-w-md">
              Secure Account Recovery
            </h1>
            <p className="text-neutral-400 text-[14px] leading-relaxed max-w-sm">
              Verify your identity and recover your workspace workspace profile safely using our encrypted token service.
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
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 md:p-20 bg-neutral-50/50">
        
        {/* Content Container (Perfect vertical & horizontal centering) */}
        <div className="w-full max-w-[440px] space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-neutral-200/80 shadow-sm">
          
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
                    Enter your email address and we will send you a reset link.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Email Address
                    </label>
                    <Input 
                      id="email"
                      type="email" 
                      disabled={isLoading}
                      placeholder="you@company.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 bg-neutral-50/50 border-neutral-200 focus-visible:ring-neutral-900 rounded-xl font-medium placeholder-neutral-400" 
                      aria-required="true"
                    />
                    {error && (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3.5 w-3.5" /> {error}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 text-[14px] font-bold mt-4 group rounded-xl bg-neutral-900 text-white hover:bg-neutral-850 transition-all duration-200 shadow-sm" 
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Send Reset Link'
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
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-neutral-900">Reset Link Sent</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    If <span className="font-semibold text-neutral-900">{email}</span> is registered with us, we've sent instructions to reset your password.
                  </p>
                </div>
                <p className="text-xs text-neutral-400">
                  Please check your spam folder if the email does not arrive in a few minutes.
                </p>
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
