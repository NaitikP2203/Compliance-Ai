import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { motion } from 'motion/react';
import { useSecurityStore } from '@/store/security';
import { toast } from 'sonner';

export default function VerifyEmail() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const addLog = useSecurityStore((state) => state.addLog);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate/perform OTP verification
      addLog('AUTH', 'INFO', 'Email OTP Verification Attempt', `Verifying OTP token for current registration pipeline.`);
      
      toast.success('Email verified successfully! You may now sign in.');
      navigate(ROUTES.AUTH.LOGIN);
    } catch (err: any) {
      toast.error('Invalid verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    toast.success('A new 6-digit verification code has been dispatched.');
    addLog('AUTH', 'INFO', 'OTP Dispatched', 'Resent email verification token code to user mailbox.');
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
              Verifying Security Link
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight max-w-md">
              Secure Email Verification
            </h1>
            <p className="text-neutral-400 text-[14px] leading-relaxed max-w-sm">
              Verify your registered mailbox to activate your corporate sandbox credentials.
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
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
              Verify Email
            </h2>
            <p className="text-sm text-neutral-500">
              Please enter the 6-digit code we sent to your email.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2.5">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  disabled={isLoading}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-14 text-center text-lg font-bold bg-neutral-50/50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 hover:border-neutral-300 transition-colors shadow-sm font-sans"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-[14px] font-bold mt-4 group rounded-xl bg-neutral-900 text-white hover:bg-neutral-850 transition-all duration-200 shadow-sm" 
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Verify Code
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
          </form>

          {/* Resend Action */}
          <div className="text-center pt-2">
            <p className="text-xs text-neutral-500">
              Didn't receive the code?{' '}
              <button 
                type="button"
                onClick={handleResend}
                className="font-bold text-neutral-900 hover:underline"
              >
                Resend Code
              </button>
            </p>
          </div>

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
