import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, ArrowLeft, Mail, RefreshCw, AlertTriangle } from 'lucide-react';
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
      setError('Please enter a valid work email address.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Trigger Supabase password reset
      // Note: Supabase will always return 200/ok regardless of whether the email exists
      // to prevent enumeration, unless configured otherwise.
      await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}${ROUTES.AUTH.LOGIN}`,
      });

      // 2. Log security audit event
      addLog(
        'AUTH',
        'INFO',
        'Password Reset Requested',
        `A password recovery ticket has been logged for [${trimmedEmail}]. Secure link dispatched.`,
        trimmedEmail
      );

      // Show success screen
      setSubmitted(true);
      toast.success('Security ticket created. Verification email dispatched.');
    } catch (err: any) {
      // Safe error output
      setError('Unable to issue recovery ticket at this moment.');
      addLog('SYSTEM', 'CRITICAL', 'Password Recovery Dispath Failure', `Exception details: ${err?.message || err}`, trimmedEmail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#111111]/10 relative overflow-hidden">
      
      {/* Decorative background blurs */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#111111]/5 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-slate-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10"
      >
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            className="bg-[#111111] text-white p-3.5 rounded-2xl shadow-xl mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-2xl pointer-events-none" />
            <ShieldAlert className="h-8 w-8 relative z-10 text-emerald-400" />
          </motion.div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#111111] leading-tight">
            Account Recovery
          </h2>
          <p className="mt-2.5 text-center text-[14px] text-[#666666]">
            Dispatch a secure password reset handshake
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-8"
        >
          <Card className="border-[#eaeaea] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] rounded-[24px] overflow-hidden bg-white/90 backdrop-blur-xl">
            <CardContent className="pt-8 px-8 pb-8">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form 
                    key="form"
                    onSubmit={handleReset} 
                    className="space-y-4"
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#111111] uppercase tracking-wider font-sans">Work Email Address</label>
                      <Input 
                        type="text" 
                        placeholder="officer@enterprise.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-[#fafafa] border-[#eaeaea] focus-visible:ring-[#111111] rounded-xl font-medium" 
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
                      className="w-full h-12 text-[14px] font-bold mt-4 group rounded-xl bg-[#111111] text-white hover:bg-[#222222] transition-all duration-200 shadow-sm" 
                      variant="default"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        'Request Reset Handshake'
                      )}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4 py-4"
                  >
                    <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-[#111111]">Ticket Dispatched</h3>
                      <p className="text-sm text-[#666666] leading-relaxed">
                        If <span className="font-semibold text-[#111111]">{email}</span> is registered in our compliance registry, password reset instructions have been issued.
                      </p>
                    </div>
                    <p className="text-xs text-[#888888]">
                      Please inspect your spam folder or contact security operations if instructions fail to arrive within 5 minutes.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            
            <div className="px-8 py-5 bg-[#fafafa]/50 border-t border-[#eaeaea] text-center">
              <Link to={ROUTES.AUTH.LOGIN} className="inline-flex items-center text-[14px] font-bold text-[#111111] hover:underline group">
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to credentials login
              </Link>
            </div>
          </Card>
          
          <div className="mt-6 text-center text-[12px] text-[#888888] flex flex-col items-center">
            <p className="flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> Handshake signed and protected.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
