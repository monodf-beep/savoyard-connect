export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          person_id: string | null
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          person_id?: string | null
          status?: string
          token: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          person_id?: string | null
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          location: string | null
          requirements: string[] | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          location?: string | null
          requirements?: string[] | null
          status?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          location?: string | null
          requirements?: string[] | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      people: {
        Row: {
          adresse: string | null
          avatar_url: string | null
          bio: string | null
          competences: string[] | null
          created_at: string | null
          date_entree: string | null
          email: string | null
          experience: string | null
          first_name: string
          formation: string | null
          hobbies: string | null
          id: string
          langues: string[] | null
          last_name: string
          linkedin: string | null
          phone: string | null
          specialite: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          adresse?: string | null
          avatar_url?: string | null
          bio?: string | null
          competences?: string[] | null
          created_at?: string | null
          date_entree?: string | null
          email?: string | null
          experience?: string | null
          first_name: string
          formation?: string | null
          hobbies?: string | null
          id?: string
          langues?: string[] | null
          last_name: string
          linkedin?: string | null
          phone?: string | null
          specialite?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          adresse?: string | null
          avatar_url?: string | null
          bio?: string | null
          competences?: string[] | null
          created_at?: string | null
          date_entree?: string | null
          email?: string | null
          experience?: string | null
          first_name?: string
          formation?: string | null
          hobbies?: string | null
          id?: string
          langues?: string[] | null
          last_name?: string
          linkedin?: string | null
          phone?: string | null
          specialite?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          documents: Json | null
          end_date: string | null
          id: string
          roadmap: string | null
          section_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          id?: string
          roadmap?: string | null
          section_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          id?: string
          roadmap?: string | null
          section_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_members: {
        Row: {
          created_at: string | null
          id: string
          person_id: string
          role: string | null
          section_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          person_id: string
          role?: string | null
          section_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          person_id?: string
          role?: string | null
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_members_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_reassurance: {
        Row: {
          availability_details: string | null
          commitment_details: string | null
          created_at: string
          custom_info: string | null
          flexible_commitment: boolean | null
          flexible_hours: boolean | null
          id: string
          location: string | null
          on_site_required: boolean | null
          section_id: string
          updated_at: string
        }
        Insert: {
          availability_details?: string | null
          commitment_details?: string | null
          created_at?: string
          custom_info?: string | null
          flexible_commitment?: boolean | null
          flexible_hours?: boolean | null
          id?: string
          location?: string | null
          on_site_required?: boolean | null
          section_id: string
          updated_at?: string
        }
        Update: {
          availability_details?: string | null
          commitment_details?: string | null
          created_at?: string
          custom_info?: string | null
          flexible_commitment?: boolean | null
          flexible_hours?: boolean | null
          id?: string
          location?: string | null
          on_site_required?: boolean | null
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_reassurance_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: true
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_expanded: boolean | null
          is_hidden: boolean | null
          parent_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_expanded?: boolean | null
          is_hidden?: boolean | null
          parent_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_expanded?: boolean | null
          is_hidden?: boolean | null
          parent_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      spontaneous_applications: {
        Row: {
          availability: string | null
          commitment: string | null
          created_at: string
          cv_url: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          linkedin: string | null
          location: string | null
          message: string | null
          phone: string | null
          section_id: string
          status: string
          updated_at: string
        }
        Insert: {
          availability?: string | null
          commitment?: string | null
          created_at?: string
          cv_url?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          linkedin?: string | null
          location?: string | null
          message?: string | null
          phone?: string | null
          section_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          availability?: string | null
          commitment?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          linkedin?: string | null
          location?: string | null
          message?: string | null
          phone?: string | null
          section_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vacant_positions: {
        Row: {
          created_at: string
          description: string | null
          external_link: string | null
          id: string
          section_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_link?: string | null
          id?: string
          section_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          external_link?: string | null
          id?: string
          section_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacant_positions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      people_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          linkedin: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_people_detailed: {
        Args: never
        Returns: {
          adresse: string | null
          avatar_url: string | null
          bio: string | null
          competences: string[] | null
          created_at: string | null
          date_entree: string | null
          email: string | null
          experience: string | null
          first_name: string
          formation: string | null
          hobbies: string | null
          id: string
          langues: string[] | null
          last_name: string
          linkedin: string | null
          phone: string | null
          specialite: string | null
          title: string | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "people"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_people_with_details: {
        Args: never
        Returns: {
          adresse: string
          avatar_url: string
          bio: string
          competences: string[]
          created_at: string
          date_entree: string
          email: string
          first_name: string
          id: string
          last_name: string
          linkedin: string
          phone: string
          title: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      people_public_fn: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          linkedin: string
          title: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      project_status: "planned" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      project_status: ["planned", "in_progress", "completed"],
    },
  },
} as const
