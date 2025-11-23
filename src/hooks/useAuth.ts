import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSectionLeader, setIsSectionLeader] = useState(false);
  const [ledSections, setLedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check admin role when session changes
        if (session?.user) {
          setTimeout(() => {
            checkUserRoles(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
          setIsSectionLeader(false);
          setLedSections([]);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRoles(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRoles = async (userId: string) => {
    try {
      // Check admin role
      const { data: adminData, error: adminError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      if (adminError && adminError.code !== 'PGRST116') {
        if (import.meta.env.DEV) console.error('Error checking admin role:', adminError);
      }

      setIsAdmin(!!adminData);

      // Check section leader status
      const { data: sectionsData, error: sectionsError } = await supabase
        .rpc('get_user_led_sections', { _user_id: userId });

      if (sectionsError) {
        if (import.meta.env.DEV) console.error('Error checking section leader:', sectionsError);
        setIsSectionLeader(false);
        setLedSections([]);
      } else {
        const sectionIds = sectionsData?.map((s: any) => s.section_id) || [];
        setIsSectionLeader(sectionIds.length > 0);
        setLedSections(sectionIds);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error checking roles:', error);
      setIsAdmin(false);
      setIsSectionLeader(false);
      setLedSections([]);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Attempt to sign out
      const { error } = await supabase.auth.signOut();
      
      // Even if there's an error (like session not found), clear local state
      if (error) {
        console.warn('Sign out error (clearing local state anyway):', error.message);
      }
      
      // Clear local state
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsSectionLeader(false);
      setLedSections([]);
      
      // Redirect to auth page
      window.location.href = '/auth';
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      // Force clear state and redirect even on error
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsSectionLeader(false);
      setLedSections([]);
      window.location.href = '/auth';
    }
  };

  return {
    user,
    session,
    isAdmin,
    isSectionLeader,
    ledSections,
    loading,
    signOut
  };
};
