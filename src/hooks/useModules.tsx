import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAssociation } from "@/hooks/useAssociation";
import { toast } from "sonner";

export interface ModuleDefinition {
  key: string;
  label: string;
  description: string;
  icon: string; // lucide icon name
  category: "core" | "network" | "management" | "tools";
  defaultEnabled: boolean;
}

// Registry of all available modules
export const MODULE_REGISTRY: ModuleDefinition[] = [
  // Core - always recommended
  { key: "dashboard", label: "Tableau de bord", description: "Vue d'ensemble et KPIs de votre association", icon: "LayoutDashboard", category: "core", defaultEnabled: true },
  { key: "accompagnateur", label: "L'Accompagnateur", description: "Assistant IA pour diagnostiquer et guider votre association", icon: "Sparkles", category: "core", defaultEnabled: true },
  
  // Management modules
  { key: "members", label: "Membres & Adhésions", description: "CRM des membres, gestion des cotisations et invitations", icon: "UserCheck", category: "management", defaultEnabled: false },
  { key: "finance", label: "Finance & Comptabilité", description: "Budget, trésorerie, rapports financiers et documents", icon: "PiggyBank", category: "management", defaultEnabled: false },
  { key: "organigramme", label: "RH & Organigramme", description: "Organigramme interactif, fiches de poste et bénévoles", icon: "Users", category: "management", defaultEnabled: true },
  { key: "value-chains", label: "Chaînes de valeur", description: "Modélisez les processus et flux de votre association", icon: "GitBranch", category: "management", defaultEnabled: false },
  { key: "jobs", label: "Bénévolat", description: "Publiez des offres de bénévolat et recevez des candidatures", icon: "Briefcase", category: "management", defaultEnabled: false },
  { key: "projects", label: "Projets & Tâches", description: "Kanban unifié pour projets, tâches et suivi d'avancement", icon: "FolderKanban", category: "management", defaultEnabled: true },
  
  // Network modules (ex-Hub)
  { key: "annuaire", label: "Annuaire B2B", description: "Trouvez et contactez d'autres associations du réseau", icon: "Building2", category: "network", defaultEnabled: false },
  { key: "experts", label: "Experts partenaires", description: "Accédez à des experts juridiques, comptables, RH...", icon: "GraduationCap", category: "network", defaultEnabled: false },
  { key: "mutualisation", label: "Mutualisation", description: "Partagez des ressources humaines et matérielles", icon: "Handshake", category: "network", defaultEnabled: false },
  { key: "projets-reseau", label: "Projets Réseau", description: "Collaborez sur des projets inter-associations", icon: "Rocket", category: "network", defaultEnabled: false },
  { key: "opportunites", label: "Opportunités & Subventions", description: "Veille sur les appels à projets et financements", icon: "TrendingUp", category: "network", defaultEnabled: false },
  
  // Tools
  { key: "toolbox", label: "Boîte à outils", description: "Intégrations tierces et outils complémentaires", icon: "Briefcase", category: "tools", defaultEnabled: false },
];

// Map module keys to sidebar paths
export const MODULE_PATH_MAP: Record<string, string> = {
  "dashboard": "/dashboard",
  "accompagnateur": "/accompagnateur",
  "members": "/members",
  "finance": "/finance",
  "organigramme": "/organigramme",
  "value-chains": "/value-chains",
  "jobs": "/jobs",
  "projects": "/projects",
  "annuaire": "/annuaire",
  "experts": "/experts",
  "mutualisation": "/mutualisation",
  "projets-reseau": "/projets-reseau",
  "opportunites": "/opportunites",
  "toolbox": "/toolbox",
};

export function useModules() {
  const { currentAssociation } = useAssociation();
  const queryClient = useQueryClient();
  const associationId = currentAssociation?.id;

  const { data: enabledModules = [], isLoading } = useQuery({
    queryKey: ["association-modules", associationId],
    queryFn: async () => {
      if (!associationId) return [];
      const { data, error } = await supabase
        .from("association_modules")
        .select("module_key, is_enabled")
        .eq("association_id", associationId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!associationId,
  });

  const toggleModule = useMutation({
    mutationFn: async ({ moduleKey, enabled }: { moduleKey: string; enabled: boolean }) => {
      if (!associationId) throw new Error("No association selected");

      const { error } = await supabase
        .from("association_modules")
        .upsert(
          {
            association_id: associationId,
            module_key: moduleKey,
            is_enabled: enabled,
            enabled_at: enabled ? new Date().toISOString() : null,
          },
          { onConflict: "association_id,module_key" }
        );

      if (error) throw error;
    },
    onSuccess: (_, { moduleKey, enabled }) => {
      queryClient.invalidateQueries({ queryKey: ["association-modules", associationId] });
      const mod = MODULE_REGISTRY.find(m => m.key === moduleKey);
      toast.success(enabled 
        ? `${mod?.label || moduleKey} activé` 
        : `${mod?.label || moduleKey} désactivé`
      );
    },
    onError: () => {
      toast.error("Erreur lors de la modification du module");
    },
  });

  // Check if a module is enabled
  const isModuleEnabled = (moduleKey: string): boolean => {
    const found = enabledModules.find(m => m.module_key === moduleKey);
    if (found) return found.is_enabled;
    // Default: use registry default
    const def = MODULE_REGISTRY.find(m => m.key === moduleKey);
    return def?.defaultEnabled ?? false;
  };

  // Settings is always visible for admins, not a toggleable module
  const isModuleVisibleInSidebar = (path: string): boolean => {
    if (path === "/settings") return true; // always visible for admins
    const entry = Object.entries(MODULE_PATH_MAP).find(([, p]) => p === path);
    if (!entry) return true; // unknown paths are always visible
    return isModuleEnabled(entry[0]);
  };

  return {
    enabledModules,
    isLoading,
    isModuleEnabled,
    isModuleVisibleInSidebar,
    toggleModule,
    modules: MODULE_REGISTRY,
  };
}
