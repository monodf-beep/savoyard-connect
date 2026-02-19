import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HubPageLayout } from '@/components/hub/HubPageLayout';
import { useValueChains } from '@/hooks/useValueChains';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ValueChainForm } from '@/components/valueChain/ValueChainForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowRight,
  Building2,
  User,
  GitBranch,
} from 'lucide-react';
import { ValueChain } from '@/types/valueChain';
import { toast } from 'sonner';
import { ApprovalActions } from '@/components/ApprovalActions';

export default function ValueChains() {
  const { t } = useTranslation();
  const { user, isAdmin, isSectionLeader } = useAuth();
  const {
    chains,
    people,
    sections,
    loading,
    createChain,
    updateChain,
    deleteChain,
    saveSegments,
    refetch,
  } = useValueChains();

  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingChain, setEditingChain] = useState<ValueChain | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chainToDelete, setChainToDelete] = useState<string | null>(null);

  const filteredChains = chains.filter(
    (chain) =>
      chain.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chain.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingChains = filteredChains.filter((c) => c.approval_status === 'pending');
  const approvedChains = filteredChains.filter((c) => c.approval_status !== 'pending');

  const handleCreateOrUpdate = async (
    title: string,
    description: string,
    segments: Array<{ function_name: string; actorIds: string[]; sectionIds?: string[] }>
  ) => {
    if (editingChain) {
      await updateChain(editingChain.id, { title, description });
      await saveSegments(editingChain.id, segments);
    } else {
      const newChain = await createChain(title, description);
      if (newChain) {
        await saveSegments(newChain.id, segments);
      }
    }
    await refetch();
    setEditingChain(undefined);
  };

  const handleEdit = (chain: ValueChain, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChain(chain);
    setFormOpen(true);
  };

  const handleDelete = (chainId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChainToDelete(chainId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (chainToDelete) {
      await deleteChain(chainToDelete);
      setChainToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleApproveChain = async (chainId: string) => {
    try {
      const { error } = await supabase
        .from('value_chains')
        .update({ approval_status: 'approved', approved_by: user?.id })
        .eq('id', chainId);
      if (error) throw error;
      await refetch();
      toast.success('Chaîne de valeur approuvée');
    } catch {
      toast.error("Impossible d'approuver la chaîne de valeur");
    }
  };

  const handleRejectChain = async (chainId: string) => {
    try {
      const { error } = await supabase
        .from('value_chains')
        .update({ approval_status: 'rejected', approved_by: user?.id })
        .eq('id', chainId);
      if (error) throw error;
      await refetch();
      toast.success('Chaîne de valeur rejetée');
    } catch {
      toast.error('Impossible de rejeter la chaîne de valeur');
    }
  };

  return (
    <HubPageLayout
      title={t('nav.valueChains')}
      subtitle="Visualisez les processus opérationnels"
      loading={loading}
      headerActions={
        (isAdmin || isSectionLeader) ? (
          <Button
            onClick={() => {
              setEditingChain(undefined);
              setFormOpen(true);
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer
          </Button>
        ) : undefined
      }
    >
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une chaîne..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Pending approvals */}
      {isAdmin && pendingChains.length > 0 && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg space-y-2">
          <p className="font-medium text-sm text-destructive">
            {pendingChains.length} chaîne(s) en attente d'approbation
          </p>
          {pendingChains.map((chain) => (
            <div key={chain.id} className="flex items-center justify-between bg-card/50 p-2 rounded">
              <span className="text-sm">{chain.title}</span>
              <ApprovalActions
                onApprove={() => handleApproveChain(chain.id)}
                onReject={() => handleRejectChain(chain.id)}
                itemType="chaîne de valeur"
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {chains.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <GitBranch className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Aucune chaîne de valeur créée</p>
          {(isAdmin || isSectionLeader) && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer la première chaîne
            </Button>
          )}
        </div>
      )}

      {/* Chains list as accordions */}
      {approvedChains.length > 0 && (
        <Accordion type="multiple" className="space-y-3">
          {approvedChains.map((chain) => (
            <AccordionItem
              key={chain.id}
              value={chain.id}
              className="border rounded-lg px-4 bg-card"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                  <span className="font-semibold text-foreground truncate">
                    {chain.title}
                  </span>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {chain.segments?.length || 0} étape{(chain.segments?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
                  {isAdmin && (
                    <div className="flex items-center gap-1 flex-shrink-0 ml-auto mr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => handleEdit(chain, e)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => handleDelete(chain.id, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {chain.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {chain.description}
                  </p>
                )}

                {/* Linear segments display */}
                {chain.segments && chain.segments.length > 0 ? (
                  <div className="flex flex-wrap items-start gap-2">
                    {chain.segments
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((segment, idx) => (
                        <React.Fragment key={segment.id}>
                          {/* Segment card */}
                          <div className="flex-shrink-0 min-w-[140px] max-w-[200px] p-3 rounded-lg border border-border bg-muted/30">
                            <p className="font-medium text-sm text-foreground mb-2">
                              {segment.function_name}
                            </p>
                            <div className="space-y-1">
                              {segment.actors?.map((actor) => (
                                <div key={actor.id} className="flex items-center gap-1.5">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={actor.photo} />
                                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                      {actor.firstName?.[0]}{actor.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {actor.firstName} {actor.lastName?.[0]}.
                                  </span>
                                </div>
                              ))}
                              {segment.sections?.map((section) => (
                                <div key={section.id} className="flex items-center gap-1.5">
                                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-3 w-3 text-primary" />
                                  </div>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {section.title}
                                  </span>
                                </div>
                              ))}
                              {!segment.actors?.length && !segment.sections?.length && (
                                <span className="text-xs text-muted-foreground italic">
                                  Aucun acteur
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Arrow between segments */}
                          {idx < (chain.segments?.length || 0) - 1 && (
                            <div className="flex items-center self-center pt-2">
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Aucun segment défini
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Form dialog */}
      <ValueChainForm
        open={formOpen}
        onOpenChange={setFormOpen}
        chain={editingChain}
        people={people}
        sections={sections}
        onSave={handleCreateOrUpdate}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette chaîne ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les segments et acteurs associés seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </HubPageLayout>
  );
}
