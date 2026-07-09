import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Clock, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { motion } from 'motion/react';

export default function SessionExpired() {
  const navigate = useNavigate();

  const handleReauthenticate = () => {
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <div id="session-expired-page" className="min-h-screen bg-[#fcfcfc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#111111]/10 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-royal-50/50 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-royal-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10"
      >
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-[#111111] text-white p-4 rounded-2xl shadow-lg mb-6 relative"
          >
            <Clock className="h-8 w-8 text-royal-400 relative z-10" />
          </motion.div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#111111]">
            Session Terminated
          </h2>
          <p className="mt-2 text-center text-sm text-[#666666]">
            Active clearance window has closed
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-8"
        >
          <Card className="border-[#eaeaea] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[24px] bg-white/95">
            <CardContent className="pt-8 px-8 pb-8 space-y-6 text-center">
              
              <div className="space-y-2">
                <p className="text-[15px] text-[#444444] leading-relaxed">
                  Your compliance portal session was automatically terminated to secure confidential organization logs and businesses against unauthorized screen exposure.
                </p>
                <p className="text-xs text-slate-400">
                  Enforced by OWASP Client Session Lifetime Security Standards.
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleReauthenticate}
                  className="w-full h-12 text-sm font-bold rounded-xl bg-royal-900 text-white hover:bg-royal-950 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Re-Authenticate Securely
                </Button>
              </div>

            </CardContent>
            
            <div className="px-8 py-5 bg-[#fafafa]/50 border-t border-[#eaeaea] text-center">
              <span className="text-[13px] text-[#666666] flex items-center justify-center gap-1.5 font-medium">
                <ShieldAlert className="h-4 w-4 text-royal-600" />
                Compliance AI Secure Vault Node
              </span>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
