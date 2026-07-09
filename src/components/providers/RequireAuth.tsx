import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityStore } from '@/store/security';
import { ROUTES } from '@/constants';

export function RequireAuth() {
  const { user, loading: supabaseLoading } = useAuth();
  const currentEmail = useSecurityStore((state) => state.currentEmail);

  if (supabaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#111111] border-t-transparent" />
          <p className="text-sm font-semibold text-[#444444]">Securing enterprise vault session...</p>
        </div>
      </div>
    );
  }

  if (!user && !currentEmail) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  return <Outlet />;
}
