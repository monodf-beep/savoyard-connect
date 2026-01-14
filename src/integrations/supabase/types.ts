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
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      community_milestones: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          target: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          target: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          target?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      community_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      financial_reports: {
        Row: {
          achats: number | null
          autres_produits: number | null
          autres_services: number | null
          charges_financieres: number | null
          charges_personnel: number | null
          created_at: string | null
          created_by: string | null
          documents: Json | null
          dons_cotisations: number | null
          dotations_amortissements: number | null
          id: string
          is_provisional: boolean | null
          is_published: boolean | null
          notes: string | null
          produits_financiers: number | null
          report_name: string
          reserves: number | null
          resultat: number | null
          services_exterieurs: number | null
          subventions: number | null
          total_actif: number | null
          total_charges: number | null
          total_passif: number | null
          total_produits: number | null
          tresorerie: number | null
          updated_at: string | null
          ventes_prestations: number | null
          year: number
        }
        Insert: {
          achats?: number | null
          autres_produits?: number | null
          autres_services?: number | null
          charges_financieres?: number | null
          charges_personnel?: number | null
          created_at?: string | null
          created_by?: string | null
          documents?: Json | null
          dons_cotisations?: number | null
          dotations_amortissements?: number | null
          id?: string
          is_provisional?: boolean | null
          is_published?: boolean | null
          notes?: string | null
          produits_financiers?: number | null
          report_name?: string
          reserves?: number | null
          resultat?: number | null
          services_exterieurs?: number | null
          subventions?: number | null
          total_actif?: number | null
          total_charges?: number | null
          total_passif?: number | null
          total_produits?: number | null
          tresorerie?: number | null
          updated_at?: string | null
          ventes_prestations?: number | null
          year: number
        }
        Update: {
          achats?: number | null
          autres_produits?: number | null
          autres_services?: number | null
          charges_financieres?: number | null
          charges_personnel?: number | null
          created_at?: string | null
          created_by?: string | null
          documents?: Json | null
          dons_cotisations?: number | null
          dotations_amortissements?: number | null
          id?: string
          is_provisional?: boolean | null
          is_published?: boolean | null
          notes?: string | null
          produits_financiers?: number | null
          report_name?: string
          reserves?: number | null
          resultat?: number | null
          services_exterieurs?: number | null
          subventions?: number | null
          total_actif?: number | null
          total_charges?: number | null
          total_passif?: number | null
          total_produits?: number | null
          tresorerie?: number | null
          updated_at?: string | null
          ventes_prestations?: number | null
          year?: number
        }
        Relationships: []
      }
      helloasso_donors: {
        Row: {
          city: string | null
          created_at: string | null
          donation_count: number | null
          email: string | null
          first_name: string | null
          helloasso_id: string | null
          id: string
          is_hidden: boolean | null
          last_donation_date: string | null
          last_name: string | null
          total_donated: number | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          donation_count?: number | null
          email?: string | null
          first_name?: string | null
          helloasso_id?: string | null
          id?: string
          is_hidden?: boolean | null
          last_donation_date?: string | null
          last_name?: string | null
          total_donated?: number | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          donation_count?: number | null
          email?: string | null
          first_name?: string | null
          helloasso_id?: string | null
          id?: string
          is_hidden?: boolean | null
          last_donation_date?: string | null
          last_name?: string | null
          total_donated?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      helloasso_members: {
        Row: {
          amount: number | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          helloasso_id: string | null
          id: string
          is_hidden: boolean | null
          last_name: string | null
          membership_date: string | null
          membership_type: string | null
          postal_code: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          helloasso_id?: string | null
          id?: string
          is_hidden?: boolean | null
          last_name?: string | null
          membership_date?: string | null
          membership_type?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          helloasso_id?: string | null
          id?: string
          is_hidden?: boolean | null
          last_name?: string | null
          membership_date?: string | null
          membership_type?: string | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      idea_votes: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          points: number
          voter_identifier: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          points?: number
          voter_identifier: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          points?: number
          voter_identifier?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_votes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          title: string
          updated_at: string
          votes_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string
          votes_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
          votes_count?: number
        }
        Relationships: []
      }
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
      manual_funds: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          donor_name: string | null
          id: string
          is_public: boolean | null
          note: string | null
          project_id: string | null
          source: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          donor_name?: string | null
          id?: string
          is_public?: boolean | null
          note?: string | null
          project_id?: string | null
          source: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          donor_name?: string | null
          id?: string
          is_public?: boolean | null
          note?: string | null
          project_id?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_funds_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_options: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          display_order: number | null
          helloasso_link: string | null
          id: string
          is_featured: boolean | null
          price: number
          title: string
          updated_at: string | null
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          display_order?: number | null
          helloasso_link?: string | null
          id?: string
          is_featured?: boolean | null
          price: number
          title: string
          updated_at?: string | null
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          display_order?: number | null
          helloasso_link?: string | null
          id?: string
          is_featured?: boolean | null
          price?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          primary_color: string
          secondary_color: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
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
          embeds: Json | null
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
          embeds?: Json | null
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
          embeds?: Json | null
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
          approval_status: string | null
          approved_by: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          documents: Json | null
          end_date: string | null
          funded_amount: number | null
          funding_deadline: string | null
          funding_goal: number | null
          ha_net_total: number | null
          id: string
          is_funding_project: boolean | null
          manual_cash_total: number | null
          roadmap: string | null
          section_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          supporter_count: number | null
          title: string
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          approved_by?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          funded_amount?: number | null
          funding_deadline?: string | null
          funding_goal?: number | null
          ha_net_total?: number | null
          id?: string
          is_funding_project?: boolean | null
          manual_cash_total?: number | null
          roadmap?: string | null
          section_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          supporter_count?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          approved_by?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          documents?: Json | null
          end_date?: string | null
          funded_amount?: number | null
          funding_deadline?: string | null
          funding_goal?: number | null
          ha_net_total?: number | null
          id?: string
          is_funding_project?: boolean | null
          manual_cash_total?: number | null
          roadmap?: string | null
          section_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          supporter_count?: number | null
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
          leader_id: string | null
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
          leader_id?: string | null
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
          leader_id?: string | null
          parent_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_actors: {
        Row: {
          created_at: string | null
          id: string
          person_id: string
          segment_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          person_id: string
          segment_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          person_id?: string
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "segment_actors_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "segment_actors_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "value_chain_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_sections: {
        Row: {
          created_at: string | null
          id: string
          section_id: string
          segment_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          section_id: string
          segment_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          section_id?: string
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "segment_sections_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "segment_sections_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "value_chain_segments"
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
      value_chain_segments: {
        Row: {
          created_at: string | null
          display_order: number
          function_name: string
          id: string
          position_x: number | null
          position_y: number | null
          updated_at: string | null
          value_chain_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          function_name: string
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string | null
          value_chain_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          function_name?: string
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string | null
          value_chain_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "value_chain_segments_value_chain_id_fkey"
            columns: ["value_chain_id"]
            isOneToOne: false
            referencedRelation: "value_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      value_chains: {
        Row: {
          approval_status: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
          viewport_x: number | null
          viewport_y: number | null
          viewport_zoom: number | null
        }
        Insert: {
          approval_status?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
          viewport_x?: number | null
          viewport_y?: number | null
          viewport_zoom?: number | null
        }
        Update: {
          approval_status?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          viewport_x?: number | null
          viewport_y?: number | null
          viewport_zoom?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
          embeds: Json | null
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
      get_user_led_sections: {
        Args: { _user_id: string }
        Returns: {
          section_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_section_leader: {
        Args: { _section_id: string; _user_id: string }
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
      app_role: "admin" | "user" | "section_leader"
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
      app_role: ["admin", "user", "section_leader"],
      project_status: ["planned", "in_progress", "completed"],
    },
  },
} as const
