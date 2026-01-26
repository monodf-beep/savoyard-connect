import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NetworkStats {
  associationsCount: number;
  projectsCount: number;
  membersCount: number;
  countriesCount: number;
}

export function useNetworkStats() {
  return useQuery({
    queryKey: ["network-stats"],
    queryFn: async (): Promise<NetworkStats> => {
      // Count associations
      const { count: associationsCount, error: assocError } = await supabase
        .from("associations")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (assocError) throw assocError;

      // Count active projects
      const { count: projectsCount, error: projectsError } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .in("status", ["planned", "in_progress"]);

      if (projectsError) throw projectsError;

      // Count unique members across all associations
      const { count: membersCount, error: membersError } = await supabase
        .from("association_members")
        .select("*", { count: "exact", head: true });

      if (membersError) throw membersError;

      // Count unique countries from zones
      const { data: zones } = await supabase
        .from("associations")
        .select("primary_zone")
        .not("primary_zone", "is", null);

      const uniqueCountries = new Set(
        (zones || []).map((z) => {
          const zone = z.primary_zone;
          if (zone === "savoie" || zone === "alpes-maritimes") return "FR";
          if (zone === "vallee-aoste" || zone === "piemont") return "IT";
          return null;
        }).filter(Boolean)
      );

      return {
        associationsCount: associationsCount || 0,
        projectsCount: projectsCount || 0,
        membersCount: membersCount || 0,
        countriesCount: uniqueCountries.size || 2, // Default to 2 (FR/IT)
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
