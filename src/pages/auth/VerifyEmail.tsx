import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { motion } from 'motion/react';

export default function VerifyEmail() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-royal-200 selection:text-royal-900 relative overflow-hidden">
      
      {/* Decorative background blurs */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-royal-50/80 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-royal-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

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
            className="bg-[#111111] text-white p-3 rounded-2xl shadow-xl mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-2xl pointer-events-none" />
            <ShieldAlert className="h-8 w-8 relative z-10" />
          </motion.div>
          <h2 className="text-center text-[30px] font-bold tracking-tight text-[#111111] leading-tight">
            Verify Email
          </h2>
          <p className="mt-3 text-center text-[15px] text-[#666666]">
            We sent a 6-digit code to <span className="font-semibold text-[#111111]">admin@enterprise.com</span>
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-10"
        >
          <Card className="border-[#eaeaea] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-xl">
            <CardContent className="pt-8 px-8 pb-8 space-y-6">
              <div className="flex justify-between gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-[#fafafa] border border-[#eaeaea] rounded-xl focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500 hover:border-[#cccccc] transition-colors shadow-sm"
                  />
                ))}
              </div>

              <Button className="w-full h-12 text-[15px] font-semibold mt-4 group rounded-xl bg-[#111111] hover:bg-[#222222] transition-all duration-200 shadow-md hover:shadow-xl" variant="default">
                Verify Code
                <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
            
            <div className="px-8 py-5 bg-[#fafafa]/50 border-t border-[#eaeaea] text-center">
              <p className="text-[14px] text-[#666666]">
                Didn't receive the code?{' '}
                <button className="font-semibold text-[#111111] hover:text-royal-600 transition-colors">
                  Resend now
                </button>
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
