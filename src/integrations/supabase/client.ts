import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { createMockClient } from './mock/mockClient';

const SUPABASE_URL = "https://perfpsiibarwgvjtrlxr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcmZwc2lpYmFyd2d2anRybHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MzQyNDksImV4cCI6MjA3MTAxMDI0OX0.M9A_Vps__pP2J4uUvQ6e3mNIKwf0mKwwN4_Sw7yRZ30";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Mode développement : faux backend en mémoire (connexion fictive + données factices).
// Jamais actif dans un build de production, sauf build de démonstration explicite (.env.demo).
const USE_MOCK =
  import.meta.env.VITE_MOCK_BACKEND === 'true' &&
  (!import.meta.env.PROD || import.meta.env.VITE_ALLOW_MOCK_IN_BUILD === 'true');

export const supabase: SupabaseClient<Database> = USE_MOCK
  ? (createMockClient() as unknown as SupabaseClient<Database>)
  : createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    });