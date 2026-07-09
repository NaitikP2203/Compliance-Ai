import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, Home, UserCheck, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useSecurityStore, UserRole } from '@/store/security';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Unauthorized() {
  const navigate = useNavigate();
  const currentRole = useSecurityStore((state) => state.currentRole);
  const changeRole = useSecurityStore((state) => state.changeRole);

  const handleReturnHome = () => {
    navigate(ROUTES.DASHBOARD);
  };

  const handleEscalateClearance = (role: UserRole) => {
    changeRole(role);
    toast.success(`Access Clearance converted to ${role.toUpperCase()} in sandbox mode.`);
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div id="unauthorized-page" className="min-h-screen bg-[#fcfcfc] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#111111]/10 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-red-50/25 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-100/30 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-[460px] relative z-10"
      >
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-[#111111] text-white p-4 rounded-2xl shadow-lg mb-6 relative"
          >
            <ShieldX className="h-8 w-8 text-red-400 relative z-10" />
          </motion.div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#111111]">
            Clearance Required
          </h2>
          <p className="mt-2 text-center text-sm text-[#666666]">
            Active security clearance: <span className="font-extrabold text-[#111111] uppercase font-mono">{currentRole}</span>
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-8"
        >
          <Card className="border-[#eaeaea] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[24px] bg-white/95">
            <CardContent className="pt-8 px-8 pb-8 space-y-6">
              
              <div className="space-y-2 text-center">
                <p className="text-[15px] text-[#444444] leading-relaxed">
                  Your active role assignment does not possess the requisite clearance levels to inspect or update this workspace resource.
                </p>
                <p className="text-xs text-slate-400">
                  Resource protected by Role-Based Access Controls (RBAC).
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  onClick={handleReturnHome}
                  variant="outline"
                  className="w-full h-11 text-sm font-semibold border-[#eaeaea] text-[#111111] hover:bg-[#fafafa] rounded-xl flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Return to Dashboard
                </Button>
                
                {/* Sandbox override helper */}
                <div className="p-4 bg-royal-50/50 rounded-xl border border-royal-100/50 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-royal-700" />
                    <p className="text-[11px] font-bold text-royal-900 uppercase tracking-wider">Sandbox Role Override</p>
                  </div>
                  <p className="text-[11px] text-royal-800 leading-normal">
                    Since you are evaluating our sandbox platform, you may instantly escalate your active session role below to unlock pages.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button 
                      onClick={() => handleEscalateClearance('admin')}
                      className="text-[11px] font-bold py-2 px-3 bg-royal-900 text-white rounded-lg hover:bg-royal-950 transition-all text-center"
                    >
                      Admin Access
                    </button>
                    <button 
                      onClick={() => handleEscalateClearance('officer')}
                      className="text-[11px] font-bold py-2 px-3 bg-white border border-[#eaeaea] text-[#111111] rounded-lg hover:bg-[#fafafa] transition-all text-center"
                    >
                      Officer Access
                    </button>
                  </div>
                </div>
              </div>

            </CardContent>
            
            <div className="px-8 py-5 bg-[#fafafa]/50 border-t border-[#eaeaea] text-center">
              <span className="text-[13px] text-[#666666] flex items-center justify-center gap-1.5 font-medium">
                <UserCheck className="h-4 w-4 text-royal-600" />
                Role Access Control Active
              </span>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
