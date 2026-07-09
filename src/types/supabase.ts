export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          created_at: string
          name: string
          industry: string
          status: 'active' | 'inactive' | 'pending'
          risk_score: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          industry: string
          status?: 'active' | 'inactive' | 'pending'
          risk_score?: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          industry?: string
          status?: 'active' | 'inactive' | 'pending'
          risk_score?: number
        }
      }
      documents: {
        Row: {
          id: string
          created_at: string
          business_id: string
          title: string
          type: string
          status: 'verified' | 'pending' | 'rejected'
          url: string
        }
        Insert: {
          id?: string
          created_at?: string
          business_id: string
          title: string
          type: string
          status?: 'verified' | 'pending' | 'rejected'
          url: string
        }
        Update: {
          id?: string
          created_at?: string
          business_id?: string
          title?: string
          type?: string
          status?: 'verified' | 'pending' | 'rejected'
          url?: string
        }
      }
    }
  }
}
