import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  ShieldAlert, 
  Activity, 
  Bell, 
  Settings, 
  User, 
  HelpCircle,
  BarChart3,
  List,
  Menu,
  X,
  Shield,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSecurityStore, UserRole } from '@/store/security';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { TranslationKey } from '@/constants/translations';

interface NavItem {
  name: string;
  translationKey: TranslationKey;
  href: string;
  icon: React.ComponentType<any>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', translationKey: 'dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Businesses', translationKey: 'businesses', href: ROUTES.BUSINESSES, icon: Building2 },
  { name: 'Documents', translationKey: 'documents', href: ROUTES.DOCUMENTS, icon: FileText },
  { name: 'Reports', translationKey: 'reports', href: ROUTES.COMPLIANCE_REPORTS, icon: List },
  { name: 'Risk Analysis', translationKey: 'risk_analysis', href: ROUTES.RISK_ANALYSIS, icon: Activity },
  { name: 'Alerts', translationKey: 'alerts', href: ROUTES.ALERTS, icon: ShieldAlert },
  { name: 'Analytics', translationKey: 'analytics', href: ROUTES.ANALYTICS, icon: BarChart3 },
  { name: 'Security Center', translationKey: 'security_center', href: ROUTES.SECURITY, icon: Shield },
];

const secondaryNavigation: NavItem[] = [
  { name: 'Settings', translationKey: 'settings', href: ROUTES.SETTINGS, icon: Settings },
  { name: 'Help Center', translationKey: 'help_center', href: ROUTES.HELP_CENTER, icon: HelpCircle },
];

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  
  const navigate = useNavigate();
  
  // Security store hooks
  const currentRole = useSecurityStore((state) => state.currentRole);
  const currentEmail = useSecurityStore((state) => state.currentEmail);
  const sessionTimeoutMinutes = useSecurityStore((state) => state.sessionTimeoutMinutes);
  const lastActivityTimestamp = useSecurityStore((state) => state.lastActivityTimestamp);
  
  const changeRole = useSecurityStore((state) => state.changeRole);
  const setCurrentEmail = useSecurityStore((state) => state.setCurrentEmail);
  const updateActivity = useSecurityStore((state) => state.updateActivity);
  const addLog = useSecurityStore((state) => state.addLog);

  // 1. Idle Session Inactivity Monitor (ASVS Compliance)
  useEffect(() => {
    // List of active user inputs to check for liveness
    const updateLiveness = () => {
      updateActivity();
    };

    window.addEventListener('mousemove', updateLiveness);
    window.addEventListener('keydown', updateLiveness);
    window.addEventListener('click', updateLiveness);
    window.addEventListener('scroll', updateLiveness);

    // Activity check loop (every 5 seconds)
    const interval = setInterval(() => {
      const inactiveMs = Date.now() - useSecurityStore.getState().lastActivityTimestamp;
      const timeoutMs = sessionTimeoutMinutes * 60 * 1000;

      if (inactiveMs > timeoutMs) {
        // Log event
        addLog(
          'AUTH',
          'WARNING',
          'Session Timeout Expired',
          `Session for [${currentEmail || 'anonymous'}] was automatically terminated due to ${sessionTimeoutMinutes} minutes of total inactivity.`,
          currentEmail || undefined
        );
        // Clear active auth state
        setCurrentEmail(null);
        toast.error('Session expired due to inactivity. Re-authentication required.');
        navigate(ROUTES.AUTH.SESSION_EXPIRED);
      }
    }, 5000);

    return () => {
      window.removeEventListener('mousemove', updateLiveness);
      window.removeEventListener('keydown', updateLiveness);
      window.removeEventListener('click', updateLiveness);
      window.removeEventListener('scroll', updateLiveness);
      clearInterval(interval);
    };
  }, [sessionTimeoutMinutes, currentEmail, updateActivity, setCurrentEmail, navigate, addLog]);

  // 2. Perform safe sign out
  const handleLogout = () => {
    addLog(
      'AUTH',
      'INFO',
      'User Signed Out',
      `Active sign out action initiated by [${currentEmail}]. Session credentials terminated safely.`,
      currentEmail || undefined
    );
    setCurrentEmail(null);
    toast.success('Securely logged out from compliance vault.');
    navigate(ROUTES.AUTH.LOGIN);
  };

  const handleRoleChangeInHeader = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleSelected = e.target.value as UserRole;
    changeRole(roleSelected);
    toast.info(`Active role converted to: ${roleSelected.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col md:flex-row font-sans selection:bg-[#111111]/10">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#eaeaea] bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-[#111111] text-white p-1.5 rounded-lg">
            <ShieldAlert className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-lg font-bold text-[#111111] tracking-tight">Compliance AI</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[#444444] hover:text-[#111111]">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop and Mobile) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-10 w-64 bg-white border-r border-[#eaeaea] flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden md:flex h-16 items-center px-6 border-b border-[#eaeaea]">
          <div className="bg-[#111111] text-white p-1.5 rounded-lg mr-3">
            <ShieldAlert className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-lg font-bold text-[#111111] tracking-tight">Compliance AI</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-[#888888] uppercase tracking-widest mb-3 px-3">
            Platform
          </div>
          <div className="space-y-0.5">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-[#f5f5f5] text-[#111111]" 
                    : "text-[#666666] hover:bg-[#fafafa] hover:text-[#111111]"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-[18px] w-[18px] flex-shrink-0 transition-colors",
                  "group-hover:text-[#111111]"
                )} />
                {t(item.translationKey)}
              </NavLink>
            ))}
          </div>
          
          <div className="mt-8 text-[11px] font-semibold text-[#888888] uppercase tracking-widest mb-3 px-3">
            Preferences
          </div>
          <div className="space-y-0.5">
            {secondaryNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-[#f5f5f5] text-[#111111]" 
                    : "text-[#666666] hover:bg-[#fafafa] hover:text-[#111111]"
                )}
              >
                <item.icon className="mr-3 h-[18px] w-[18px] flex-shrink-0 transition-colors group-hover:text-[#111111]" />
                {t(item.translationKey)}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User profile with logout and role display */}
        <div className="p-4 border-t border-[#eaeaea] bg-[#fafafa]/50 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
              {currentEmail ? currentEmail.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#111111] truncate">{currentEmail || 'Admin User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn(
                  "inline-block w-1.5 h-1.5 rounded-full animate-pulse",
                  currentRole === 'admin' ? "bg-red-500" : currentRole === 'officer' ? "bg-blue-500" : "bg-slate-400"
                )} />
                <span className="text-[10px] font-extrabold uppercase text-[#666666] tracking-wider">{currentRole} role</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            size="sm" 
            className="w-full h-9 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t('terminate_clearance')}
          </Button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Desktop Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-[#eaeaea] bg-white sticky top-0 z-10">
          
          {/* Real-time interactive Role-Switcher inside Top Header */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-slate-500" /> {t('clearance_active')}
            </span>
            <div className="relative">
              <select 
                value={currentRole} 
                onChange={handleRoleChangeInHeader}
                className="appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-800 text-xs font-bold pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer transition-all"
              >
                <option value="admin">ADMIN (Full Sandbox Permissions)</option>
                <option value="officer">OFFICER (Read / Upload / Scans)</option>
                <option value="viewer">VIEWER (Read-Only Guard)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative text-[#666666] hover:text-[#111111]">
              <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              <Bell className="h-5 w-5" />
            </Button>
            <div className="h-4 w-[1px] bg-[#eaeaea] mx-2" />
            <Button 
              variant="outline" 
              size="sm" 
              className="font-bold h-9 border-[#eaeaea] text-xs"
              onClick={() => navigate(ROUTES.SECURITY)}
            >
              {t('active_syslogs')}
            </Button>
          </div>
        </header>

        {/* Dynamic page content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Backdrop overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-0 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
