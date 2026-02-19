import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Association role enum matching database
export type AssociationRole = 'owner' | 'admin' | 'gestionnaire' | 'contributeur' | 'membre';

export interface AssociationMembership {
  id: string;
  association_id: string;
  role: AssociationRole;
  person_id: string | null;
  joined_at: string;
  association: Association;
}

export interface Association {
  id: string;
  name: string;
  logo_url: string | null;
  siret: string | null;
  rna: string | null;
  naf_ape: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  is_active: boolean;
  created_at: string;
  city: string | null;
  description: string | null;
  silo: string | null;
  primary_zone: string | null;
}

interface AssociationContextType {
  associations: AssociationMembership[];
  currentAssociation: Association | null;
  currentMembership: AssociationMembership | null;
  setCurrentAssociation: (asso: Association) => void;
  isLoading: boolean;
  refetch: () => Promise<void>;
  isOwnerOrAdmin: boolean;
  isGestionnaire: boolean;
  currentRole: AssociationRole | null;
}

const AssociationContext = createContext<AssociationContextType | undefined>(undefined);

export const AssociationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [associations, setAssociations] = useState<AssociationMembership[]>([]);
  const [currentAssociation, setCurrentAssociationState] = useState<Association | null>(null);
  const [currentMembership, setCurrentMembership] = useState<AssociationMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setCurrentAssociationFromMemberships = (memberships: AssociationMembership[]) => {
    const savedAssoId = localStorage.getItem("currentAssociationId");
    const savedMembership = memberships.find((m) => m.association_id === savedAssoId);
    
    if (savedMembership) {
      setCurrentAssociationState(savedMembership.association);
      setCurrentMembership(savedMembership);
    } else if (memberships.length > 0) {
      setCurrentAssociationState(memberships[0].association);
      setCurrentMembership(memberships[0]);
      localStorage.setItem("currentAssociationId", memberships[0].association_id);
    }
  };

  const fetchAssociations = async () => {
    if (!user) {
      setAssociations([]);
      setCurrentAssociationState(null);
      setCurrentMembership(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data: memberships, error } = await supabase
        .from("association_members")
        .select(`
          id,
          association_id,
          role,
          person_id,
          joined_at,
          association:associations (
            id, name, logo_url, siret, rna, naf_ape,
            instagram_url, linkedin_url, is_active, created_at, city, description, silo, primary_zone
          )
        `)
        .eq("user_id", user.id)
        .order("joined_at", { ascending: true });

      if (error) {
        console.log("Falling back to legacy associations query:", error.message);
        const { data: legacyData, error: legacyError } = await supabase
          .from("associations")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: true });

        if (legacyError) throw legacyError;

        const legacyMemberships: AssociationMembership[] = (legacyData || []).map(asso => ({
          id: asso.id + '_membership',
          association_id: asso.id,
          role: 'owner' as AssociationRole,
          person_id: null,
          joined_at: asso.created_at,
          association: asso,
        }));

        setAssociations(legacyMemberships);
        setCurrentAssociationFromMemberships(legacyMemberships);
        setIsLoading(false);
        return;
      }

      const validMemberships: AssociationMembership[] = (memberships || [])
        .filter((m: any) => m.association)
        .map((m: any) => ({
          id: m.id,
          association_id: m.association_id,
          role: m.role as AssociationRole,
          person_id: m.person_id,
          joined_at: m.joined_at,
          association: m.association,
        }));

      setAssociations(validMemberships);
      setCurrentAssociationFromMemberships(validMemberships);
    } catch (error) {
      console.error("Error fetching associations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssociations();
  }, [user]);

  const setCurrentAssociation = (asso: Association) => {
    setCurrentAssociationState(asso);
    localStorage.setItem("currentAssociationId", asso.id);
    const membership = associations.find(m => m.association_id === asso.id);
    if (membership) {
      setCurrentMembership(membership);
    }
  };

  const currentRole = currentMembership?.role || null;
  const isOwnerOrAdmin = currentRole === 'owner' || currentRole === 'admin';
  const isGestionnaire = currentRole === 'gestionnaire' || isOwnerOrAdmin;

  return (
    <AssociationContext.Provider
      value={{
        associations,
        currentAssociation,
        currentMembership,
        setCurrentAssociation,
        isLoading,
        refetch: fetchAssociations,
        isOwnerOrAdmin,
        isGestionnaire,
        currentRole,
      }}
    >
      {children}
    </AssociationContext.Provider>
  );
};

export const useAssociation = () => {
  const context = useContext(AssociationContext);
  if (context === undefined) {
    throw new Error("useAssociation must be used within an AssociationProvider");
  }
  return context;
};
