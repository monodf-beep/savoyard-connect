import { useState } from "react";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { useModules, MODULE_REGISTRY, ModuleDefinition } from "@/hooks/useModules";
import { useAssociation } from "@/hooks/useAssociation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, Users, FolderKanban, Briefcase, PiggyBank, Settings, 
  Building2, GraduationCap, Sparkles, UserCheck, Kanban, Handshake,
  GitBranch, TrendingUp, Rocket, Search, Package
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, FolderKanban, Briefcase, PiggyBank, Settings,
  Building2, GraduationCap, Sparkles, UserCheck, Kanban, Handshake,
  GitBranch, TrendingUp, Rocket, Package,
};

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  core: { label: "Essentiel", color: "bg-primary/10 text-primary" },
  management: { label: "Gestion", color: "bg-secondary/10 text-secondary" },
  network: { label: "Réseau", color: "bg-blue-500/10 text-blue-600" },
  tools: { label: "Outils", color: "bg-amber-500/10 text-amber-600" },
};

const ModuleStore = () => {
  const { isModuleEnabled, toggleModule, isLoading } = useModules();
  const { isOwnerOrAdmin } = useAssociation();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredModules = MODULE_REGISTRY.filter(mod => {
    const matchesSearch = mod.label.toLowerCase().includes(search.toLowerCase()) ||
      mod.description.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || mod.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const enabledCount = MODULE_REGISTRY.filter(m => isModuleEnabled(m.key)).length;

  const renderModuleCard = (mod: ModuleDefinition) => {
    const Icon = ICON_MAP[mod.icon] || Package;
    const enabled = isModuleEnabled(mod.key);
    const catInfo = CATEGORY_LABELS[mod.category];

    return (
      <Card 
        key={mod.key} 
        className={cn(
          "transition-all duration-200 border",
          enabled ? "border-primary/30 bg-primary/[0.02] shadow-sm" : "border-border hover:border-muted-foreground/30"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                enabled ? "bg-primary/10" : "bg-muted"
              )}>
                <Icon className={cn("h-5 w-5", enabled ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">{mod.label}</CardTitle>
                <Badge variant="outline" className={cn("text-[10px] mt-1", catInfo.color)}>
                  {catInfo.label}
                </Badge>
              </div>
            </div>
            {isOwnerOrAdmin && (
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => toggleModule.mutate({ moduleKey: mod.key, enabled: checked })}
                disabled={toggleModule.isPending || isLoading}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs leading-relaxed">
            {mod.description}
          </CardDescription>
        </CardContent>
      </Card>
    );
  };

  return (
    <HubPageLayout
      title="Store de modules"
      subtitle={`${enabledCount} modules actifs sur ${MODULE_REGISTRY.length} disponibles`}
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="core">Essentiel</TabsTrigger>
            <TabsTrigger value="management">Gestion</TabsTrigger>
            <TabsTrigger value="network">Réseau</TabsTrigger>
            <TabsTrigger value="tools">Outils</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModules.map(renderModuleCard)}
            </div>
            {filteredModules.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>Aucun module trouvé</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </HubPageLayout>
  );
};

export default ModuleStore;
