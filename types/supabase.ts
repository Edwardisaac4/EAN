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
      /**
       * Dashboard lead aggregates in one round trip — see
       * supabase/migrations/003_lead_analytics.sql. The payload is validated at
       * the service boundary (`getLeadAnalytics`) because Postgres returns it as
       * an opaque jsonb value.
       */
      lead_analytics: {
        Args: Record<string, never>
        Returns: Json
      }
      /**
       * Rate limiting — see supabase/migrations/004_rate_limits.sql. Each of
       * these returns a single-row table, which supabase-js surfaces as an
       * array; lib/rate-limiter.ts normalises that.
       */
      rate_limit_status: {
        Args: { p_key: string }
        Returns: RateLimitRpcRow[]
      }
      rate_limit_record_failure: {
        Args: {
          p_key: string
          p_max: number
          p_window_seconds: number
          p_lockout_seconds: number
        }
        Returns: RateLimitRpcRow[]
      }
      rate_limit_consume: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: RateLimitRpcRow[]
      }
      rate_limit_clear: {
        Args: { p_key: string }
        Returns: undefined
      }
      rate_limit_prune: {
        Args: { p_older_than_seconds?: number }
        Returns: number
      }
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

/**
 * Row shape returned by every rate_limit_* RPC that reports a verdict.
 * `retry_after_seconds` is 0 whenever `is_allowed` is true.
 */
export interface RateLimitRpcRow {
  is_allowed: boolean
  retry_after_seconds: number
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
