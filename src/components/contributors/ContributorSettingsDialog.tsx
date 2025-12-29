import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Save, Loader2, RefreshCw, Map } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  target: number;
  description: string;
  display_order: number;
}

interface MembershipOption {
  id: string;
  title: string;
  price: number;
  benefits: string[];
  helloasso_link: string | null;
  display_order: number;
  is_featured: boolean;
}

interface ContributorSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ContributorSettingsDialog({ open, onOpenChange }: ContributorSettingsDialogProps) {
  const queryClient = useQueryClient();
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editingMembership, setEditingMembership] = useState<MembershipOption | null>(null);
  const [currentMembers, setCurrentMembers] = useState(0);
  const [manualAddition, setManualAddition] = useState(0);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch milestones
  const { data: milestones = [] } = useQuery({
    queryKey: ['community-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_milestones')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as Milestone[];
    },
  });

  // Fetch membership options
  const { data: membershipOptions = [] } = useQuery({
    queryKey: ['membership-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_options')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as MembershipOption[];
    },
  });

  // Fetch community settings
  const { data: communitySettings } = useQuery({
    queryKey: ['community-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_settings')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (communitySettings) {
      const memberSetting = communitySettings.find(s => s.key === 'current_members');
      if (memberSetting) {
        const value = memberSetting.value as { count: number; manual_addition: number };
        setCurrentMembers(value.count || 0);
        setManualAddition(value.manual_addition || 0);
      }
      const mapboxSetting = communitySettings.find(s => s.key === 'mapbox_token');
      if (mapboxSetting) {
        const tokenValue = mapboxSetting.value;
        setMapboxToken(typeof tokenValue === 'string' ? tokenValue.replace(/"/g, '') : '');
      }
    }
  }, [communitySettings]);

  // Mutations
  const saveMilestoneMutation = useMutation({
    mutationFn: async (milestone: Partial<Milestone>) => {
      if (milestone.id) {
        const { error } = await supabase
          .from('community_milestones')
          .update({ title: milestone.title, target: milestone.target, description: milestone.description, display_order: milestone.display_order })
          .eq('id', milestone.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_milestones')
          .insert([{ title: milestone.title!, target: milestone.target!, description: milestone.description, display_order: milestone.display_order }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-milestones'] });
      setEditingMilestone(null);
      toast.success('Jalon enregistré');
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('community_milestones')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-milestones'] });
      toast.success('Jalon supprimé');
    },
  });

  const saveMembershipMutation = useMutation({
    mutationFn: async (membership: Partial<MembershipOption>) => {
      const payload = { 
        title: membership.title, 
        price: membership.price, 
        benefits: membership.benefits, 
        helloasso_link: membership.helloasso_link, 
        display_order: membership.display_order, 
        is_featured: membership.is_featured 
      };
      if (membership.id) {
        const { error } = await supabase
          .from('membership_options')
          .update(payload)
          .eq('id', membership.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('membership_options')
          .insert([{ ...payload, title: payload.title!, price: payload.price! }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-options'] });
      setEditingMembership(null);
      toast.success('Option d\'adhésion enregistrée');
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  });

  const deleteMembershipMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('membership_options')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-options'] });
      toast.success('Option supprimée');
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('community_settings')
        .upsert({
          key: 'current_members',
          value: { count: currentMembers, manual_addition: manualAddition },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-settings'] });
      toast.success('Paramètres enregistrés');
    },
  });

  const saveMapboxTokenMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('community_settings')
        .upsert({
          key: 'mapbox_token',
          value: mapboxToken,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-settings'] });
      toast.success('Token Mapbox enregistré');
    },
  });

  const syncHelloAsso = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-helloasso-members', {
        body: { organizationSlug: 'institut-de-la-langue-savoyarde-le-franco-provencal-de-savoie' },
      });
      if (error) throw error;
      toast.success(`Synchronisé: ${data.members_synced} membres, ${data.donors_synced} donateurs`);
      queryClient.invalidateQueries({ queryKey: ['helloasso-members'] });
      queryClient.invalidateQueries({ queryKey: ['helloasso-donors'] });
      queryClient.invalidateQueries({ queryKey: ['community-settings'] });
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Paramètres & Jalons</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="gauge" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gauge">Jauge</TabsTrigger>
            <TabsTrigger value="milestones">Jalons</TabsTrigger>
            <TabsTrigger value="membership">Adhésion</TabsTrigger>
            <TabsTrigger value="map">Carte</TabsTrigger>
          </TabsList>

          <TabsContent value="gauge" className="space-y-4 mt-4">
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold">Jauge d'Influence</h3>
              
              <div className="space-y-2">
                <Label>Nombre actuel de membres (HelloAsso)</Label>
                <Input
                  type="number"
                  value={currentMembers}
                  onChange={(e) => setCurrentMembers(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Ajout manuel (+X membres hors HelloAsso)</Label>
                <Input
                  type="number"
                  value={manualAddition}
                  onChange={(e) => setManualAddition(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Total affiché: {currentMembers + manualAddition} membres
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
                <Button variant="outline" onClick={syncHelloAsso} disabled={isSyncing}>
                  {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Synchroniser HelloAsso
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4 mt-4">
            <Button 
              onClick={() => setEditingMilestone({ id: '', title: '', target: 0, description: '', display_order: milestones.length + 1 })}
              className="mb-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un Jalon
            </Button>

            {editingMilestone && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Titre</Label>
                    <Input
                      value={editingMilestone.title}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Objectif (nombre)</Label>
                    <Input
                      type="number"
                      value={editingMilestone.target}
                      onChange={(e) => setEditingMilestone({ ...editingMilestone, target: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={editingMilestone.description}
                    onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveMilestoneMutation.mutate(editingMilestone)}>
                    Enregistrer
                  </Button>
                  <Button variant="outline" onClick={() => setEditingMilestone(null)}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-card border rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{m.title}</span>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <span className="text-primary font-bold">{m.target}</span>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <span className="text-sm text-muted-foreground">{m.description}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setEditingMilestone(m)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMilestoneMutation.mutate(m.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="membership" className="space-y-4 mt-4">
            <Button 
              onClick={() => setEditingMembership({ id: '', title: '', price: 0, benefits: [], helloasso_link: '', display_order: membershipOptions.length + 1, is_featured: false })}
              className="mb-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une Option
            </Button>

            {editingMembership && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Titre</Label>
                    <Input
                      value={editingMembership.title}
                      onChange={(e) => setEditingMembership({ ...editingMembership, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Prix (€)</Label>
                    <Input
                      type="number"
                      value={editingMembership.price}
                      onChange={(e) => setEditingMembership({ ...editingMembership, price: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Lien HelloAsso</Label>
                  <Input
                    value={editingMembership.helloasso_link || ''}
                    onChange={(e) => setEditingMembership({ ...editingMembership, helloasso_link: e.target.value })}
                    placeholder="https://www.helloasso.com/..."
                  />
                </div>
                <div>
                  <Label>Bénéfices (un par ligne)</Label>
                  <textarea
                    className="w-full min-h-[80px] p-2 border rounded-md bg-background"
                    value={editingMembership.benefits.join('\n')}
                    onChange={(e) => setEditingMembership({ ...editingMembership, benefits: e.target.value.split('\n').filter(b => b.trim()) })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingMembership.is_featured}
                    onChange={(e) => setEditingMembership({ ...editingMembership, is_featured: e.target.checked })}
                    className="rounded"
                  />
                  <Label>Mettre en avant (badge "Meilleure offre")</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => saveMembershipMutation.mutate(editingMembership)}>
                    Enregistrer
                  </Button>
                  <Button variant="outline" onClick={() => setEditingMembership(null)}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {membershipOptions.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-card border rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium">{m.title}</span>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <span className="text-primary font-bold">{m.price}€</span>
                    {m.is_featured && <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Featured</span>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setEditingMembership(m)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteMembershipMutation.mutate(m.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4 mt-4">
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Configuration Mapbox</h3>
              </div>
              
              <div className="space-y-2">
                <Label>Token Public Mapbox</Label>
                <Input
                  type="text"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  placeholder="pk.eyJ1..."
                />
                <p className="text-xs text-muted-foreground">
                  Récupérez votre token sur <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a> → Tokens
                </p>
              </div>

              <Button onClick={() => saveMapboxTokenMutation.mutate()} disabled={saveMapboxTokenMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer le Token
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
