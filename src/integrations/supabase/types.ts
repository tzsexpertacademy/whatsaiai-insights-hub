export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analysis_cost_control: {
        Row: {
          analysis_date: string
          cache_hits: number | null
          cache_miss: number | null
          conversations_processed: number | null
          created_at: string
          id: string
          insights_generated: number | null
          total_analyses: number | null
          total_cost_estimate: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_date?: string
          cache_hits?: number | null
          cache_miss?: number | null
          conversations_processed?: number | null
          created_at?: string
          id?: string
          insights_generated?: number | null
          total_analyses?: number | null
          total_cost_estimate?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_date?: string
          cache_hits?: number | null
          cache_miss?: number | null
          conversations_processed?: number | null
          created_at?: string
          id?: string
          insights_generated?: number | null
          total_analyses?: number | null
          total_cost_estimate?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analysis_summaries: {
        Row: {
          analysis_type: string
          chat_messages_analyzed: number | null
          conversations_analyzed: number | null
          cost_estimate: number | null
          created_at: string
          data_hash: string
          id: string
          insights_generated: number | null
          summary_content: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_type: string
          chat_messages_analyzed?: number | null
          conversations_analyzed?: number | null
          cost_estimate?: number | null
          created_at?: string
          data_hash: string
          id?: string
          insights_generated?: number | null
          summary_content: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_type?: string
          chat_messages_analyzed?: number | null
          conversations_analyzed?: number | null
          cost_estimate?: number | null
          created_at?: string
          data_hash?: string
          id?: string
          insights_generated?: number | null
          summary_content?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assistants_config: {
        Row: {
          assistant_name: string
          assistant_role: string
          created_at: string
          id: string
          is_active: boolean
          prompt: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assistant_name: string
          assistant_role: string
          created_at?: string
          id?: string
          is_active?: boolean
          prompt: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assistant_name?: string
          assistant_role?: string
          created_at?: string
          id?: string
          is_active?: boolean
          prompt?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          assistant_id: string
          assistant_response: string
          created_at: string
          id: string
          timestamp: string
          updated_at: string
          user_id: string
          user_message: string
        }
        Insert: {
          assistant_id: string
          assistant_response: string
          created_at?: string
          id?: string
          timestamp: string
          updated_at?: string
          user_id: string
          user_message: string
        }
        Update: {
          assistant_id?: string
          assistant_response?: string
          created_at?: string
          id?: string
          timestamp?: string
          updated_at?: string
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
      client_configs: {
        Row: {
          created_at: string | null
          firebase_config: Json | null
          id: string
          openai_config: Json | null
          updated_at: string | null
          user_id: string | null
          whatsapp_config: Json | null
        }
        Insert: {
          created_at?: string | null
          firebase_config?: Json | null
          id?: string
          openai_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_config?: Json | null
        }
        Update: {
          created_at?: string | null
          firebase_config?: Json | null
          id?: string
          openai_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_config?: Json | null
        }
        Relationships: []
      }
      commercial_assistants_config: {
        Row: {
          assistant_name: string
          assistant_role: string
          created_at: string | null
          id: string
          is_active: boolean | null
          prompt: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assistant_name: string
          assistant_role: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          prompt: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assistant_name?: string
          assistant_role?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          prompt?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      commercial_conversations: {
        Row: {
          contact_name: string
          contact_phone: string
          conversion_metrics: Json | null
          created_at: string
          id: string
          lead_status: string | null
          messages: Json | null
          sales_analysis: Json | null
          sales_stage: string | null
          session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_name: string
          contact_phone: string
          conversion_metrics?: Json | null
          created_at?: string
          id?: string
          lead_status?: string | null
          messages?: Json | null
          sales_analysis?: Json | null
          sales_stage?: string | null
          session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_name?: string
          contact_phone?: string
          conversion_metrics?: Json | null
          created_at?: string
          id?: string
          lead_status?: string | null
          messages?: Json | null
          sales_analysis?: Json | null
          sales_stage?: string | null
          session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commercial_insights: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          description: string
          id: string
          insight_type: string
          priority: string | null
          sales_impact: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          insight_type: string
          priority?: string | null
          sales_impact?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          insight_type?: string
          priority?: string | null
          sales_impact?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_insights_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "commercial_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_messages: {
        Row: {
          ai_generated: boolean | null
          conversation_id: string | null
          conversion_score: number | null
          id: string
          message_text: string
          sales_intent: Json | null
          sender_type: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          conversation_id?: string | null
          conversion_score?: number | null
          id?: string
          message_text: string
          sales_intent?: Json | null
          sender_type?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          conversation_id?: string | null
          conversion_score?: number | null
          id?: string
          message_text?: string
          sales_intent?: Json | null
          sender_type?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commercial_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "commercial_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_analysis_cache: {
        Row: {
          analysis_results: Json | null
          content_hash: string
          conversation_id: string
          conversation_type: string
          created_at: string
          id: string
          last_analysis_date: string
          message_count: number | null
          processed_by_assistants: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_results?: Json | null
          content_hash: string
          conversation_id: string
          conversation_type: string
          created_at?: string
          id?: string
          last_analysis_date?: string
          message_count?: number | null
          processed_by_assistants?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_results?: Json | null
          content_hash?: string
          conversation_id?: string
          conversation_type?: string
          created_at?: string
          id?: string
          last_analysis_date?: string
          message_count?: number | null
          processed_by_assistants?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          category: string | null
          content: string | null
          conversation_id: string | null
          created_at: string | null
          description: string
          id: string
          insight_type: string
          metadata: Json | null
          priority: string | null
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          insight_type: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          insight_type?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insights_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_analysis_enabled: boolean | null
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          plan: string | null
          updated_at: string | null
        }
        Insert: {
          ai_analysis_enabled?: boolean | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          plan?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_analysis_enabled?: boolean | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sales_funnel_data: {
        Row: {
          average_time_in_stage: number | null
          conversion_rate: number | null
          created_at: string | null
          id: string
          leads_count: number | null
          stage_name: string
          stage_order: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_time_in_stage?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          leads_count?: number | null
          stage_name: string
          stage_order: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_time_in_stage?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          id?: string
          leads_count?: number | null
          stage_name?: string
          stage_order?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sales_metrics: {
        Row: {
          average_deal_size: number | null
          conversations_started: number | null
          conversion_rate: number | null
          conversions: number | null
          created_at: string | null
          id: string
          leads_generated: number | null
          metric_date: string
          qualified_leads: number | null
          revenue_generated: number | null
          sales_cycle_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_deal_size?: number | null
          conversations_started?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          leads_generated?: number | null
          metric_date: string
          qualified_leads?: number | null
          revenue_generated?: number | null
          sales_cycle_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_deal_size?: number | null
          conversations_started?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          leads_generated?: number | null
          metric_date?: string
          qualified_leads?: number | null
          revenue_generated?: number | null
          sales_cycle_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          contact_name: string
          contact_phone: string
          created_at: string | null
          emotional_analysis: Json | null
          id: string
          messages: Json | null
          psychological_profile: Json | null
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contact_name: string
          contact_phone: string
          created_at?: string | null
          emotional_analysis?: Json | null
          id?: string
          messages?: Json | null
          psychological_profile?: Json | null
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact_name?: string
          contact_phone?: string
          created_at?: string | null
          emotional_analysis?: Json | null
          id?: string
          messages?: Json | null
          psychological_profile?: Json | null
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          ai_generated: boolean | null
          conversation_id: string | null
          id: string
          message_text: string
          sender_type: string | null
          sentiment_analysis: Json | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          conversation_id?: string | null
          id?: string
          message_text: string
          sender_type?: string | null
          sentiment_analysis?: Json | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          conversation_id?: string | null
          id?: string
          message_text?: string
          sender_type?: string | null
          sentiment_analysis?: Json | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
