import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AssociationStats {
  membersCount: number;
  projectsCount: number;
  tasksCount: number;
  pendingTasksCount: number;
}

export function useAssociationStats(associationId: string | undefined) {
  return useQuery({
    queryKey: ["association-stats", associationId],
    queryFn: async (): Promise<AssociationStats> => {
      if (!associationId) {
        return {
          membersCount: 0,
          projectsCount: 0,
          tasksCount: 0,
          pendingTasksCount: 0,
        };
      }

      // Count members
      const { count: membersCount, error: membersError } = await supabase
        .from("association_members")
        .select("*", { count: "exact", head: true })
        .eq("association_id", associationId);

      if (membersError) throw membersError;

      // Count projects (via sections - for now we count all projects)
      const { count: projectsCount, error: projectsError } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      if (projectsError) throw projectsError;

      // Count tasks for this association
      const { count: tasksCount, error: tasksError } = await supabase
        .from("admin_tasks")
        .select("*", { count: "exact", head: true })
        .eq("association_id", associationId);

      if (tasksError) throw tasksError;

      // Count pending tasks
      const { count: pendingTasksCount, error: pendingError } = await supabase
        .from("admin_tasks")
        .select("*", { count: "exact", head: true })
        .eq("association_id", associationId)
        .eq("status", "pending");

      if (pendingError) throw pendingError;

      return {
        membersCount: membersCount || 0,
        projectsCount: projectsCount || 0,
        tasksCount: tasksCount || 0,
        pendingTasksCount: pendingTasksCount || 0,
      };
    },
    enabled: !!associationId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAssociationTasks(associationId: string | undefined) {
  return useQuery({
    queryKey: ["association-tasks", associationId],
    queryFn: async () => {
      if (!associationId) return [];

      const { data, error } = await supabase
        .from("admin_tasks")
        .select("*")
        .eq("association_id", associationId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!associationId,
    staleTime: 1000 * 60 * 2,
  });
}
