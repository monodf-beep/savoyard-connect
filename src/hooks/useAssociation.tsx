import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Association {
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
}

interface AssociationContextType {
  associations: Association[];
  currentAssociation: Association | null;
  setCurrentAssociation: (asso: Association) => void;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const AssociationContext = createContext<AssociationContextType | undefined>(undefined);

export const AssociationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [associations, setAssociations] = useState<Association[]>([]);
  const [currentAssociation, setCurrentAssociationState] = useState<Association | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssociations = async () => {
    if (!user) {
      setAssociations([]);
      setCurrentAssociationState(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("associations")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setAssociations(data || []);

      // Set current association from localStorage or first one
      const savedAssoId = localStorage.getItem("currentAssociationId");
      const savedAsso = data?.find((a) => a.id === savedAssoId);
      
      if (savedAsso) {
        setCurrentAssociationState(savedAsso);
      } else if (data && data.length > 0) {
        setCurrentAssociationState(data[0]);
        localStorage.setItem("currentAssociationId", data[0].id);
      }
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
  };

  return (
    <AssociationContext.Provider
      value={{
        associations,
        currentAssociation,
        setCurrentAssociation,
        isLoading,
        refetch: fetchAssociations,
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
