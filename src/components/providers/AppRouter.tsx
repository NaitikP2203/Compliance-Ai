import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/components/providers/RequireAuth';
import { ErrorBoundary } from '@/components/providers/ErrorBoundary';
import { PageLoader } from '@/components/layout/PageLoader';
import { ROUTES } from '@/constants';
import { Toaster } from 'sonner';

// Lazy load all pages for better code splitting
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Businesses = React.lazy(() => import('@/pages/Businesses'));
const Documents = React.lazy(() => import('@/pages/Documents'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const RiskAnalysis = React.lazy(() => import('@/pages/RiskAnalysis'));
const Alerts = React.lazy(() => import('@/pages/Alerts'));
const Settings = React.lazy(() => import('@/pages/Settings'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Login = React.lazy(() => import('@/pages/auth/Login'));
const Register = React.lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('@/pages/auth/ForgotPassword'));
const VerifyEmail = React.lazy(() => import('@/pages/auth/VerifyEmail'));
const ResetPassword = React.lazy(() => import('@/pages/auth/ResetPassword'));
const SessionExpired = React.lazy(() => import('@/pages/auth/SessionExpired'));
const Unauthorized = React.lazy(() => import('@/pages/auth/Unauthorized'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));
const HelpCenter = React.lazy(() => import('@/pages/HelpCenter'));
const Security = React.lazy(() => import('@/pages/Security'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

export function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path={ROUTES.AUTH.LOGIN} element={<Login />} />
            <Route path={ROUTES.AUTH.REGISTER} element={<Register />} />
            <Route path={ROUTES.AUTH.FORGOT_PASSWORD} element={<ForgotPassword />} />
            <Route path={ROUTES.AUTH.VERIFY_EMAIL} element={<VerifyEmail />} />
            <Route path={ROUTES.AUTH.RESET_PASSWORD} element={<ResetPassword />} />
            <Route path={ROUTES.AUTH.SESSION_EXPIRED} element={<SessionExpired />} />
            <Route path={ROUTES.AUTH.UNAUTHORIZED} element={<Unauthorized />} />
            
            <Route element={<RequireAuth />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.BUSINESSES} element={<Businesses />} />
                <Route path={ROUTES.DOCUMENTS} element={<Documents />} />
                <Route path={ROUTES.COMPLIANCE_REPORTS} element={<Reports />} />
                <Route path={ROUTES.RISK_ANALYSIS} element={<RiskAnalysis />} />
                <Route path={ROUTES.ALERTS} element={<Alerts />} />
                <Route path={ROUTES.SETTINGS} element={<Settings />} />
                <Route path={ROUTES.PROFILE} element={<Profile />} />
                <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
                <Route path={ROUTES.HELP_CENTER} element={<HelpCenter />} />
                <Route path={ROUTES.SECURITY} element={<Security />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
