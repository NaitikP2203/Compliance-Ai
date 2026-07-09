import React from 'react';
import { ShieldAlert } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full animate-ping bg-royal-100 opacity-75"></div>
        <div className="relative bg-[#111111] text-white p-3 rounded-xl shadow-xl shadow-royal-900/10">
          <ShieldAlert className="h-8 w-8 animate-pulse" />
        </div>
      </div>
      <p className="mt-6 text-sm font-medium text-[#666666] tracking-wide uppercase animate-pulse">
        Initializing Workspace...
      </p>
    </div>
  );
}
