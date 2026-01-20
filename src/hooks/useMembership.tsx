import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAssociation } from "@/hooks/useAssociation";

export type MembershipTier = "free" | "member" | "premium";

interface MembershipContextType {
  tier: MembershipTier;
  isLoading: boolean;
  canAccessMutualisation: boolean;
  canAccessExperts: boolean;
  canAccessOpportunities: boolean;
  setTier: (tier: MembershipTier) => void; // For demo purposes
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

interface MembershipProviderProps {
  children: ReactNode;
}

export function MembershipProvider({ children }: MembershipProviderProps) {
  const { currentAssociation } = useAssociation();
  const [tier, setTier] = useState<MembershipTier>("free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from the database
    // For now, we'll use localStorage for demo purposes
    const fetchMembership = async () => {
      setIsLoading(true);
      
      if (currentAssociation) {
        const storedTier = localStorage.getItem(`membership-tier-${currentAssociation.id}`);
        if (storedTier && ["free", "member", "premium"].includes(storedTier)) {
          setTier(storedTier as MembershipTier);
        } else {
          setTier("free"); // Default to free
        }
      }
      
      setIsLoading(false);
    };

    fetchMembership();
  }, [currentAssociation]);

  const handleSetTier = (newTier: MembershipTier) => {
    setTier(newTier);
    if (currentAssociation) {
      localStorage.setItem(`membership-tier-${currentAssociation.id}`, newTier);
    }
  };

  const value: MembershipContextType = {
    tier,
    isLoading,
    canAccessMutualisation: tier === "member" || tier === "premium",
    canAccessExperts: tier === "member" || tier === "premium",
    canAccessOpportunities: tier === "member" || tier === "premium",
    setTier: handleSetTier,
  };

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (context === undefined) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  return context;
}
