// =============================================================================
// Supabase Database TypeScript Types
// Generated for EAN Aviation — Lead Collection Engine
// =============================================================================

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
      leads: {
        Row: {
          id: string
          lead_code: string
          full_name: string
          email: string
          phone: string
          company: string | null
          service: LeadServiceEnum
          message: string
          status: LeadStatusEnum
          priority: LeadPriorityEnum
          estimated_value: number
          source: string
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_code?: string
          full_name: string
          email: string
          phone?: string
          company?: string | null
          service?: LeadServiceEnum
          message: string
          status?: LeadStatusEnum
          priority?: LeadPriorityEnum
          estimated_value?: number
          source?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_code?: string
          full_name?: string
          email?: string
          phone?: string
          company?: string | null
          service?: LeadServiceEnum
          message?: string
          status?: LeadStatusEnum
          priority?: LeadPriorityEnum
          estimated_value?: number
          source?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_tracking: {
        Row: {
          id: string
          lead_id: string
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_term: string | null
          referrer_url: string | null
          referrer_domain: string | null
          landing_page: string | null
          form_page: string | null
          form_id: string | null
          device_type: string
          browser_name: string | null
          user_language: string | null
          screen_resolution: string | null
          ip_address: string | null
          captured_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          referrer_url?: string | null
          referrer_domain?: string | null
          landing_page?: string | null
          form_page?: string | null
          form_id?: string | null
          device_type?: string
          browser_name?: string | null
          user_language?: string | null
          screen_resolution?: string | null
          ip_address?: string | null
          captured_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          referrer_url?: string | null
          referrer_domain?: string | null
          landing_page?: string | null
          form_page?: string | null
          form_id?: string | null
          device_type?: string
          browser_name?: string | null
          user_language?: string | null
          screen_resolution?: string | null
          ip_address?: string | null
          captured_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lead_tracking_lead_id_fkey'
            columns: ['lead_id']
            referencedRelation: 'leads'
            referencedColumns: ['id']
          }
        ]
      }
      lead_activities: {
        Row: {
          id: string
          lead_id: string
          author: string
          action: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          author?: string
          action: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          author?: string
          action?: string
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lead_activities_lead_id_fkey'
            columns: ['lead_id']
            referencedRelation: 'leads'
            referencedColumns: ['id']
          }
        ]
      }
      lead_notes: {
        Row: {
          id: string
          lead_id: string
          author: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          author?: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          author?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lead_notes_lead_id_fkey'
            columns: ['lead_id']
            referencedRelation: 'leads'
            referencedColumns: ['id']
          }
        ]
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          category: string
          excerpt: string
          content: Json
          cover_image_url: string | null
          seo_title: string | null
          seo_description: string | null
          og_image_url: string | null
          status: 'draft' | 'published'
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          category?: string
          excerpt?: string
          content?: Json
          cover_image_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          status?: 'draft' | 'published'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          category?: string
          excerpt?: string
          content?: Json
          cover_image_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          status?: 'draft' | 'published'
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lead_service: LeadServiceEnum
      lead_status: LeadStatusEnum
      lead_priority: LeadPriorityEnum
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Enum types matching PostgreSQL enums
export type LeadServiceEnum =
  | 'fbo'
  | 'maintenance'
  | 'charter'
  | 'catering'
  | 'vip'
  | 'leasing'
  | 'general'

export type LeadStatusEnum =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'closed_won'
  | 'closed_lost'
  | 'spam'

export type LeadPriorityEnum =
  | 'urgent'
  | 'high'
  | 'normal'
  | 'low'
