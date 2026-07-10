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
  HelpCircle,
  BarChart3,
  List,
  Menu,
  X,
  Shield,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSecurityStore, UserRole } from '@/store/security';
import { useSettingsStore } from '@/store/settings';
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
  const { t, language } = useTranslation();
  const { theme, setTheme, setLanguage } = useSettingsStore();
  
  const navigate = useNavigate();
  
  const currentRole = useSecurityStore((state) => state.currentRole);
  const currentEmail = useSecurityStore((state) => state.currentEmail);
  const sessionTimeoutMinutes = useSecurityStore((state) => state.sessionTimeoutMinutes);
  const lastActivityTimestamp = useSecurityStore((state) => state.lastActivityTimestamp);
  
  const changeRole = useSecurityStore((state) => state.changeRole);
  const setCurrentEmail = useSecurityStore((state) => state.setCurrentEmail);
  const updateActivity = useSecurityStore((state) => state.updateActivity);
  const addLog = useSecurityStore((state) => state.addLog);

  useEffect(() => {
    const updateLiveness = () => updateActivity();
    window.addEventListener('mousemove', updateLiveness);
    window.addEventListener('keydown', updateLiveness);
    window.addEventListener('click', updateLiveness);
    window.addEventListener('scroll', updateLiveness);

    const interval = setInterval(() => {
      const inactiveMs = Date.now() - useSecurityStore.getState().lastActivityTimestamp;
      const timeoutMs = sessionTimeoutMinutes * 60 * 1000;

      if (inactiveMs > timeoutMs) {
        addLog(
          'AUTH',
          'WARNING',
          'Session Timeout Expired',
          `Session for [${currentEmail || 'anonymous'}] was automatically terminated.`,
          currentEmail || undefined
        );
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en'; // simple toggle for now
    setLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col md:flex-row font-sans selection:bg-[var(--primary)]/10 transition-colors duration-200">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-[var(--primary)] text-white p-1.5 rounded-lg">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">Compliance AI</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop and Mobile) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-10 w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="hidden md:flex h-16 items-center px-6 border-b border-[var(--border)]">
          <div className="bg-[var(--foreground)] text-[var(--background)] p-1.5 rounded-lg mr-3">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">Compliance AI</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest mb-3 px-3">
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
                    ? "bg-[var(--muted)] text-[var(--foreground)]" 
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-[18px] w-[18px] flex-shrink-0 transition-colors",
                  "group-hover:text-[var(--foreground)]"
                )} />
                {t(item.translationKey)}
              </NavLink>
            ))}
          </div>
          
          <div className="mt-8 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-widest mb-3 px-3">
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
                    ? "bg-[var(--muted)] text-[var(--foreground)]" 
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <item.icon className="mr-3 h-[18px] w-[18px] flex-shrink-0 transition-colors group-hover:text-[var(--foreground)]" />
                {t(item.translationKey)}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User profile with settings */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] space-y-3">
          <div className="flex items-center justify-between px-2">
            <button onClick={toggleTheme} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1.5 rounded-md hover:bg-[var(--muted)] transition-colors" title="Toggle Theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={toggleLanguage} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1.5 rounded-md hover:bg-[var(--muted)] transition-colors flex items-center gap-1 text-xs font-semibold uppercase" title="Toggle Language">
              <Globe className="h-4 w-4" /> {language}
            </button>
          </div>
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-bold text-xs">
              {currentEmail ? currentEmail.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--foreground)] truncate">{currentEmail || 'Admin User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn(
                  "inline-block w-1.5 h-1.5 rounded-full animate-pulse",
                  currentRole === 'admin' ? "bg-red-500" : currentRole === 'officer' ? "bg-blue-500" : "bg-slate-400"
                )} />
                <span className="text-[10px] font-extrabold uppercase text-[var(--muted-foreground)] tracking-wider">{currentRole} role</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            size="sm" 
            className="w-full h-9 rounded-lg text-xs font-semibold text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50/10 border border-transparent hover:border-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t('terminate_clearance')}
          </Button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Desktop Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-10 transition-colors duration-200">
          
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> {t('clearance_active')}
            </span>
            <div className="relative">
              <select 
                value={currentRole} 
                onChange={handleRoleChangeInHeader}
                className="appearance-none bg-[var(--muted)] hover:bg-[var(--border)] border border-transparent text-[var(--foreground)] text-xs font-bold pl-3 pr-8 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--foreground)] cursor-pointer transition-all"
              >
                <option value="admin">ADMIN (Full Sandbox Permissions)</option>
                <option value="officer">OFFICER (Read / Upload / Scans)</option>
                <option value="viewer">VIEWER (Read-Only Guard)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--muted-foreground)] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-[var(--background)]" />
              <Bell className="h-5 w-5" />
            </Button>
            <div className="h-4 w-[1px] bg-[var(--border)] mx-2" />
            <Button 
              variant="outline" 
              size="sm" 
              className="font-bold h-9 border-[var(--border)] text-xs"
              onClick={() => navigate(ROUTES.SECURITY)}
            >
              {t('active_syslogs')}
            </Button>
          </div>
        </header>

        {/* Dynamic page content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-[var(--background)]">
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

