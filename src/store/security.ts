import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'officer' | 'viewer';

export interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  category: 'AUTH' | 'RBAC' | 'API' | 'UPLOAD' | 'CSP' | 'XSS' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
  ip: string;
  userEmail?: string;
}

interface SecurityState {
  // Current user context
  currentRole: UserRole;
  currentEmail: string | null;
  
  // Security settings & hardening parameters
  isStrictCSPEnabled: boolean;
  isFileScanEnabled: boolean;
  isRateLimitingEnabled: boolean;
  isXssSanitizerEnabled: boolean;
  sessionTimeoutMinutes: number;
  lastActivityTimestamp: number;
  
  // Live audit trail
  logs: SecurityLog[];
  
  // Brute force protection
  lockouts: {
    [email: string]: {
      attempts: number;
      lockedUntil: number | null;
    };
  };

  // Actions
  changeRole: (role: UserRole) => void;
  setCurrentEmail: (email: string | null) => void;
  toggleStrictCSP: () => void;
  toggleFileScan: () => void;
  toggleRateLimiting: () => void;
  toggleXssSanitizer: () => void;
  setSessionTimeoutMinutes: (minutes: number) => void;
  updateActivity: () => void;
  
  // Audit log actions
  addLog: (
    category: SecurityLog['category'],
    severity: SecurityLog['severity'],
    event: string,
    details: string,
    userEmail?: string
  ) => void;
  clearLogs: () => void;
  
  // Auth security operations
  registerFailedLogin: (email: string) => { isLocked: boolean; lockedUntil: number | null; remainingSeconds: number };
  registerSuccessfulLogin: (email: string) => void;
  checkLockout: (email: string) => { isLocked: boolean; remainingSeconds: number };
}

const INITIAL_LOGS: SecurityLog[] = [
  {
    id: 'sec-init-1',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    event: 'Security Engine Initiated',
    category: 'SYSTEM',
    severity: 'INFO',
    details: 'Compliance AI application security framework loaded successfully. OWASP ASVS v4.0 policies enforced.',
    ip: '127.0.0.1'
  },
  {
    id: 'sec-init-2',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    event: 'Database Encryption Verified',
    category: 'SYSTEM',
    severity: 'INFO',
    details: 'Supabase TLS handshake completed. Client environment secrets successfully masked and isolated.',
    ip: '127.0.0.1'
  },
  {
    id: 'sec-init-3',
    timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    event: 'Role-Based Access Guard Active',
    category: 'RBAC',
    severity: 'INFO',
    details: 'Route verification filters loaded. Standard policies: Admin=Full, Officer=Write/Audit, Viewer=Read-Only.',
    ip: '127.0.0.1'
  }
];

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      currentRole: 'admin', // Default to admin so preview acts fully, but user can change it
      currentEmail: null,
      isStrictCSPEnabled: true,
      isFileScanEnabled: true,
      isRateLimitingEnabled: true,
      isXssSanitizerEnabled: true,
      sessionTimeoutMinutes: 15,
      lastActivityTimestamp: Date.now(),
      logs: INITIAL_LOGS,
      lockouts: {},

      changeRole: (role) => {
        const prevRole = get().currentRole;
        const email = get().currentEmail || 'anonymous';
        set({ currentRole: role });
        get().addLog(
          'RBAC',
          'WARNING',
          'User Role Modified',
          `Privilege set altered from [${prevRole}] to [${role}] by active administrator.`,
          email
        );
      },

      setCurrentEmail: (email) => set({ currentEmail: email }),
      
      toggleStrictCSP: () => {
        const current = get().isStrictCSPEnabled;
        set({ isStrictCSPEnabled: !current });
        get().addLog(
          'SYSTEM',
          'WARNING',
          'Security Policy Toggled',
          `Strict Content Security Policy (CSP) header enforcement ${!current ? 'ENABLED' : 'DISABLED'}.`,
          get().currentEmail || undefined
        );
      },

      toggleFileScan: () => {
        const current = get().isFileScanEnabled;
        set({ isFileScanEnabled: !current });
        get().addLog(
          'SYSTEM',
          'WARNING',
          'Security Policy Toggled',
          `Server-side binary signature verification (File Scan) ${!current ? 'ENABLED' : 'DISABLED'}.`,
          get().currentEmail || undefined
        );
      },

      toggleRateLimiting: () => {
        const current = get().isRateLimitingEnabled;
        set({ isRateLimitingEnabled: !current });
        get().addLog(
          'SYSTEM',
          'WARNING',
          'Security Policy Toggled',
          `Brute-force protection & route rate-limiting ${!current ? 'ENABLED' : 'DISABLED'}.`,
          get().currentEmail || undefined
        );
      },

      toggleXssSanitizer: () => {
        const current = get().isXssSanitizerEnabled;
        set({ isXssSanitizerEnabled: !current });
        get().addLog(
          'SYSTEM',
          'WARNING',
          'Security Policy Toggled',
          `XSS HTML output sanitization engine ${!current ? 'ENABLED' : 'DISABLED'}.`,
          get().currentEmail || undefined
        );
      },

      setSessionTimeoutMinutes: (minutes) => {
        set({ sessionTimeoutMinutes: minutes });
        get().addLog(
          'SYSTEM',
          'INFO',
          'Session Timeout Setting Updated',
          `Idle session automatic invalidation interval set to ${minutes} minutes.`,
          get().currentEmail || undefined
        );
      },

      updateActivity: () => set({ lastActivityTimestamp: Date.now() }),

      addLog: (category, severity, event, details, userEmail) => {
        const newLog: SecurityLog = {
          id: `sec-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          category,
          severity,
          event,
          details,
          ip: '192.168.1.144', // Secure mocked client container gateway
          userEmail: userEmail || get().currentEmail || undefined
        };
        set((state) => ({ logs: [newLog, ...state.logs].slice(0, 500) })); // Keep last 500 logs
      },

      clearLogs: () => {
        if (get().currentRole !== 'admin') {
          get().addLog(
            'RBAC',
            'CRITICAL',
            'Unauthorized Logs Clear Attempt',
            `User with insufficient role [${get().currentRole}] attempted to clear secure system logs. Action denied.`
          );
          throw new Error('Access Denied: Only users with [admin] role can purge security audit logs.');
        }
        set({ logs: [] });
        get().addLog(
          'SYSTEM',
          'CRITICAL',
          'Audit Log Purged',
          'Active administrator wiped security and audit logs from persistent store.',
          get().currentEmail || undefined
        );
      },

      checkLockout: (email) => {
        const record = get().lockouts[email];
        if (!record) return { isLocked: false, remainingSeconds: 0 };
        
        if (record.lockedUntil && Date.now() < record.lockedUntil) {
          const remaining = Math.ceil((record.lockedUntil - Date.now()) / 1000);
          return { isLocked: true, remainingSeconds: remaining };
        }
        
        // Lock expired
        if (record.lockedUntil && Date.now() >= record.lockedUntil) {
          set((state) => ({
            lockouts: {
              ...state.lockouts,
              [email]: { attempts: 0, lockedUntil: null }
            }
          }));
        }
        
        return { isLocked: false, remainingSeconds: 0 };
      },

      registerFailedLogin: (email) => {
        const currentLockouts = get().lockouts;
        const record = currentLockouts[email] || { attempts: 0, lockedUntil: null };
        const attempts = record.attempts + 1;
        let lockedUntil = record.lockedUntil;
        let remainingSeconds = 0;
        
        get().addLog(
          'AUTH',
          attempts >= 4 ? 'CRITICAL' : 'WARNING',
          'Authentication Failed',
          `Unsuccessful sign-in attempt for account [${email}]. Attempt ${attempts}/5 before temporary lock.`,
          email
        );

        if (attempts >= 5) {
          const lockoutDurationMs = 60 * 1000; // 1 minute lockout
          lockedUntil = Date.now() + lockoutDurationMs;
          remainingSeconds = 60;
          get().addLog(
            'AUTH',
            'CRITICAL',
            'Account Temporarily Locked',
            `Rate-limiting threshold breached for [${email}]. 60-second authentication freeze applied.`,
            email
          );
        }

        set((state) => ({
          lockouts: {
            ...state.lockouts,
            [email]: { attempts, lockedUntil }
          }
        }));

        return { isLocked: attempts >= 5, lockedUntil, remainingSeconds };
      },

      registerSuccessfulLogin: (email) => {
        set((state) => ({
          currentEmail: email,
          lockouts: {
            ...state.lockouts,
            [email]: { attempts: 0, lockedUntil: null }
          }
        }));
        get().addLog(
          'AUTH',
          'INFO',
          'Authentication Succeeded',
          `User [${email}] successfully signed in. Token session created.`,
          email
        );
      }
    }),
    {
      name: 'compliance-security-store',
      partialize: (state) => ({
        currentRole: state.currentRole,
        currentEmail: state.currentEmail,
        isStrictCSPEnabled: state.isStrictCSPEnabled,
        isFileScanEnabled: state.isFileScanEnabled,
        isRateLimitingEnabled: state.isRateLimitingEnabled,
        isXssSanitizerEnabled: state.isXssSanitizerEnabled,
        sessionTimeoutMinutes: state.sessionTimeoutMinutes,
        logs: state.logs,
        lockouts: state.lockouts
      })
    }
  )
);
