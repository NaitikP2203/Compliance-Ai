export type BusinessStatus = 'compliant' | 'review' | 'action_required';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type DocumentStatus = 'verified' | 'pending' | 'rejected';
export type DocumentType = 'PDF' | 'DOCX' | 'XLSX' | 'CSV' | 'IMAGE';
export type AlertType = 'urgent' | 'warning' | 'info';
export type AlertStatus = 'open' | 'resolved' | 'ignored';

export interface Business {
  id: string;
  name: string;
  gstin: string;
  status: BusinessStatus;
  risk: RiskLevel;
  industry: string;
  lastUpdated?: string;
  complianceScore?: number;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: string;
  date: string;
  author: string;
  status: DocumentStatus;
  url?: string;
  businessId?: string;
}

export interface Alert {
  id: string;
  title: string;
  entity: string;
  time: string;
  type: AlertType;
  status: AlertStatus;
  description?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatarUrl?: string;
}
