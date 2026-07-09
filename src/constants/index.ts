export const APP_CONFIG = {
  NAME: 'Compliance AI',
  VERSION: '1.0.0',
  API_TIMEOUT: 15000,
  DEFAULT_LANGUAGE: 'en',
};

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  BUSINESSES: '/businesses',
  DOCUMENTS: '/documents',
  COMPLIANCE_REPORTS: '/reports',
  RISK_ANALYSIS: '/risk',
  ALERTS: '/alerts',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_EMAIL: '/verify-email',
    RESET_PASSWORD: '/reset-password',
    SESSION_EXPIRED: '/session-expired',
    UNAUTHORIZED: '/unauthorized',
  },
  HELP_CENTER: '/help',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  AUDIT_LOGS: '/audit-logs',
  SECURITY: '/security',
};

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const COMPLIANCE_STATUS = {
  COMPLIANT: 'compliant',
  PENDING: 'pending',
  NON_COMPLIANT: 'non_compliant',
  UNDER_REVIEW: 'under_review',
} as const;
