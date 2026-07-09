import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { motion } from 'motion/react';

export default function NotFound() {
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
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-[#111111] text-white p-4 rounded-2xl shadow-xl relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-2xl pointer-events-none" />
            <ShieldAlert className="h-10 w-10 relative z-10" />
          </div>
        </motion.div>
        
        <h1 className="text-[120px] font-bold text-[#111111] leading-none tracking-tighter opacity-5 select-none">
          404
        </h1>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="mt-4 text-[28px] font-bold tracking-tight text-[#111111] leading-tight">
            Page not found
          </h2>
          <p className="mt-3 text-[15px] text-[#666666] max-w-sm mx-auto leading-relaxed">
            The requested resource could not be found. It may have been moved, deleted, or you might lack the necessary clearance.
          </p>

          <div className="mt-10">
            <Button asChild variant="default" className="h-12 px-8 rounded-xl font-semibold bg-[#111111] hover:bg-[#222222] transition-all duration-200 shadow-md hover:shadow-xl group">
              <Link to={ROUTES.DASHBOARD}>
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Return to Command Center
              </Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
