import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { HubPageLayout } from '@/components/hub/HubPageLayout';
import { useValueChains } from '@/hooks/useValueChains';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowCanvas, WorkflowCanvasRef } from '@/components/valueChain/WorkflowCanvas';
import { ChainSidebar } from '@/components/valueChain/ChainSidebar';
import { SegmentDetailPanel } from '@/components/valueChain/SegmentDetailPanel';
import { ValueChainForm } from '@/components/valueChain/ValueChainForm';
import { TutorialDialog } from '@/components/TutorialDialog';
import { ApprovalBadge } from '@/components/ApprovalBadge';
import { ApprovalActions } from '@/components/ApprovalActions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Plus,
  Edit,
  Trash2,
  Combine,
  Split,
  Loader2,
  PanelLeftClose,
  PanelLeft,
  Info,
  LayoutGrid,
  Workflow,
} from 'lucide-react';
import { KanbanChainDisplay } from '@/components/valueChain/KanbanChainDisplay';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ValueChain, ValueChainSegment } from '@/types/valueChain';
import { toast } from 'sonner';

export default function ValueChains() {
  const { t } = useTranslation();
  const { user, isAdmin, isSectionLeader } = useAuth();
  const isMobile = useIsMobile();
  const {
    chains,
    people,
    sections,
    loading,
    createChain,
    updateChain,
    deleteChain,
    saveSegments,
    mergeChains,
    splitChain,
    reorderSegments,
    saveSegmentPositions,
    refetch,
  } = useValueChains();

  const canvasRef = useRef<WorkflowCanvasRef>(null);

  const [selectedChain, setSelectedChain] = useState<ValueChain | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<ValueChainSegment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'workflow' | 'kanban'>('workflow');

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [editingChain, setEditingChain] = useState<ValueChain | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chainToDelete, setChainToDelete] = useState<string | null>(null);

  // Merge dialog state
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergeChainA, setMergeChainA] = useState<string>('');
  const [mergeChainB, setMergeChainB] = useState<string>('');
  const [mergeTitle, setMergeTitle] = useState('');

  // Split dialog state
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [splitChainId, setSplitChainId] = useState<string>('');
  const [splitIndex, setSplitIndex] = useState(1);
  const [splitTitle1, setSplitTitle1] = useState('');
  const [splitTitle2, setSplitTitle2] = useState('');

  // Save positions before switching or leaving
  const saveBeforeLeave = useCallback(async () => {
    if (canvasRef.current?.hasUnsavedChanges()) {
      await canvasRef.current.savePositions();
    }
  }, []);

  // Save when switching chains
  const handleSelectChain = useCallback(async (chain: ValueChain) => {
    await saveBeforeLeave();
    setSelectedChain(chain);
  }, [saveBeforeLeave]);

  // Save before leaving the page (navigation)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (canvasRef.current?.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
        canvasRef.current.savePositions();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Auto-select first chain and sync selected chain with updated data
  useEffect(() => {
    if (chains.length > 0) {
      if (selectedChain) {
        const updatedChain = chains.find(c => c.id === selectedChain.id);
        if (updatedChain && updatedChain !== selectedChain) {
          setSelectedChain(updatedChain);
        }
      } else {
        const approvedChains = chains.filter(c => c.approval_status !== 'pending');
        if (approvedChains.length > 0) {
          setSelectedChain(approvedChains[0]);
        }
      }
    }
  }, [chains]);

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

  const handleEdit = (chain: ValueChain) => {
    setEditingChain(chain);
    setFormOpen(true);
  };

  const handleDelete = (chainId: string) => {
    setChainToDelete(chainId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (chainToDelete) {
      await deleteChain(chainToDelete);
      if (selectedChain?.id === chainToDelete) {
        setSelectedChain(null);
      }
      setChainToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleMerge = async () => {
    if (!mergeChainA || !mergeChainB || !mergeTitle.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (mergeChainA === mergeChainB) {
      toast.error('Veuillez sélectionner deux chaînes différentes');
      return;
    }

    await mergeChains(mergeChainA, mergeChainB, mergeTitle);
    setMergeDialogOpen(false);
    setMergeChainA('');
    setMergeChainB('');
    setMergeTitle('');
    setSelectedChain(null);
  };

  const handleSplit = async () => {
    if (!splitChainId || !splitTitle1.trim() || !splitTitle2.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const chain = chains.find((c) => c.id === splitChainId);
    if (!chain || !chain.segments || chain.segments.length < 2) {
      toast.error('La chaîne doit avoir au moins 2 segments');
      return;
    }

    if (splitIndex <= 0 || splitIndex >= chain.segments.length) {
      toast.error('Index de scission invalide');
      return;
    }

    await splitChain(splitChainId, splitIndex, splitTitle1, splitTitle2);
    setSplitDialogOpen(false);
    setSplitChainId('');
    setSplitIndex(1);
    setSplitTitle1('');
    setSplitTitle2('');
    setSelectedChain(null);
  };

  const handleApproveChain = async (chainId: string) => {
    try {
      const { error } = await supabase
        .from('value_chains')
        .update({ 
          approval_status: 'approved',
          approved_by: user?.id 
        })
        .eq('id', chainId);

      if (error) throw error;

      await refetch();
      toast.success('Chaîne de valeur approuvée');
    } catch (error: any) {
      console.error('Error approving chain:', error);
      toast.error("Impossible d'approuver la chaîne de valeur");
    }
  };

  const handleRejectChain = async (chainId: string) => {
    try {
      const { error } = await supabase
        .from('value_chains')
        .update({ 
          approval_status: 'rejected',
          approved_by: user?.id 
        })
        .eq('id', chainId);

      if (error) throw error;

      await refetch();
      toast.success('Chaîne de valeur rejetée');
    } catch (error: any) {
      console.error('Error rejecting chain:', error);
      toast.error('Impossible de rejeter la chaîne de valeur');
    }
  };

  const handleSegmentClick = (segment: ValueChainSegment) => {
    setSelectedSegment(segment);
    setDetailPanelOpen(true);
  };

  const handleAddSegment = () => {
    if (selectedChain) {
      handleEdit(selectedChain);
    }
  };

  // Separate pending chains for admin approval
  const pendingChains = chains.filter(c => c.approval_status === 'pending');
  const approvedChains = chains.filter(c => c.approval_status !== 'pending');

  return (
    <HubPageLayout
      title={t('nav.valueChains')}
      subtitle="Visualisez et organisez les processus opérationnels"
      loading={loading}
      fullWidth
    >
      <div className="flex h-[calc(100vh-12rem)] overflow-hidden relative -mx-4 md:-mx-6 lg:-mx-8 -mb-8">
        {/* Left Sidebar - Chain List */}
        {!isMobile && sidebarOpen && (
          <div className="w-72 flex-shrink-0 border-r border-border bg-card">
            <ChainSidebar
              chains={approvedChains}
              selectedChain={selectedChain}
              onSelectChain={handleSelectChain}
              onCreateChain={() => {
                setEditingChain(undefined);
                setFormOpen(true);
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="h-8 w-8"
                >
                  {sidebarOpen ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <PanelLeft className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedChain?.title || 'Sélectionner une chaîne'}
                  </h2>
                  <TutorialDialog
                    title="Comprendre les chaînes de valeur"
                    description="Les chaînes de valeur permettent de visualiser et organiser les processus opérationnels."
                    benefits={[
                      "Visualiser l'ensemble des processus",
                      "Identifier les acteurs impliqués",
                      "Optimiser les flux de travail",
                    ]}
                    steps={[
                      {
                        title: "Créer une chaîne",
                        description: "Définissez un nouveau processus opérationnel.",
                        tips: ["Choisissez un nom descriptif"]
                      },
                      {
                        title: "Ajouter des segments",
                        description: "Décomposez votre processus en étapes.",
                        tips: ["Ordonnez les segments logiquement"]
                      },
                    ]}
                  />
                </div>
                {selectedChain?.description && (
                  <p className="text-xs text-muted-foreground">
                    {selectedChain.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex items-center bg-muted rounded-md p-0.5">
                <Button
                  variant={viewMode === 'workflow' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setViewMode('workflow')}
                >
                  <Workflow className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => setViewMode('kanban')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>

              {isAdmin && selectedChain && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(selectedChain)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Modifier</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(selectedChain.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {isAdmin && (
                <div className="hidden md:flex gap-2 ml-2 pl-2 border-l border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMergeDialogOpen(true)}
                    disabled={approvedChains.length < 2}
                  >
                    <Combine className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSplitDialogOpen(true)}
                    disabled={approvedChains.length === 0}
                  >
                    <Split className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Pending Approvals Alert */}
          {isAdmin && pendingChains.length > 0 && (
            <div className="mx-4 mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-700 dark:text-orange-300">
                  {pendingChains.length} chaîne(s) en attente d'approbation
                </span>
              </div>
              <div className="space-y-2">
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
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 p-4 overflow-auto">
            {chains.length === 0 ? (
              <Card className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Combine className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Aucune chaîne de valeur créée
                </p>
                {(isAdmin || isSectionLeader) && (
                  <Button onClick={() => setFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer la première chaîne
                  </Button>
                )}
              </Card>
            ) : selectedChain ? (
              viewMode === 'workflow' ? (
                <WorkflowCanvas
                  ref={canvasRef}
                  chain={selectedChain}
                  onSegmentClick={handleSegmentClick}
                  onAddSegment={isAdmin ? handleAddSegment : undefined}
                  onSegmentsReorder={isAdmin ? (segmentIds) => reorderSegments(selectedChain.id, segmentIds) : undefined}
                  onSavePositions={isAdmin ? (positions, viewport) => saveSegmentPositions(positions, viewport, selectedChain.id) : undefined}
                  onPaneClick={() => {
                    setDetailPanelOpen(false);
                    setSelectedSegment(null);
                  }}
                />
              ) : (
                <KanbanChainDisplay
                  chain={selectedChain}
                  onSegmentClick={(segmentId) => {
                    const segment = selectedChain.segments?.find(s => s.id === segmentId);
                    if (segment) {
                      handleSegmentClick(segment);
                    }
                  }}
                />
              )
            ) : (
              <Card className="h-full flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">
                  Sélectionnez une chaîne dans le menu latéral
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Right Panel - Segment Details (Desktop) - Overlay */}
        {!isMobile && detailPanelOpen && (
          <div className="absolute right-0 top-0 h-full w-80 bg-card border-l border-border shadow-xl z-20">
            <SegmentDetailPanel
              segment={selectedSegment}
              onClose={() => {
                setDetailPanelOpen(false);
                setSelectedSegment(null);
              }}
            />
          </div>
        )}

        {/* Mobile Segment Details Sheet */}
        {isMobile && (
          <Sheet open={detailPanelOpen} onOpenChange={setDetailPanelOpen}>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>{selectedSegment?.function_name}</SheetTitle>
              </SheetHeader>
              <SegmentDetailPanel
                segment={selectedSegment}
                onClose={() => {
                  setDetailPanelOpen(false);
                  setSelectedSegment(null);
                }}
              />
            </SheetContent>
          </Sheet>
        )}

        {/* Mobile Chain Selector Sheet */}
        {isMobile && (
          <Sheet>
            <SheetContent side="left" className="w-[300px] p-0">
              <ChainSidebar
                chains={approvedChains}
                selectedChain={selectedChain}
                onSelectChain={handleSelectChain}
                onCreateChain={() => {
                  setEditingChain(undefined);
                  setFormOpen(true);
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isAdmin={isAdmin}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Value Chain Form */}
      <ValueChainForm
        open={formOpen}
        onOpenChange={setFormOpen}
        chain={editingChain}
        people={people}
        sections={sections}
        onSave={handleCreateOrUpdate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette chaîne ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les segments associés seront également supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fusionner deux chaînes</DialogTitle>
            <DialogDescription>
              Sélectionnez les chaînes à fusionner et donnez un nom à la nouvelle chaîne.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Première chaîne</Label>
              <Select value={mergeChainA} onValueChange={setMergeChainA}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {approvedChains.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deuxième chaîne</Label>
              <Select value={mergeChainB} onValueChange={setMergeChainB}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {approvedChains.filter(c => c.id !== mergeChainA).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nom de la nouvelle chaîne</Label>
              <Input
                value={mergeTitle}
                onChange={(e) => setMergeTitle(e.target.value)}
                placeholder="Ex: Processus complet"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleMerge}>Fusionner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Split Dialog */}
      <Dialog open={splitDialogOpen} onOpenChange={setSplitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scinder une chaîne</DialogTitle>
            <DialogDescription>
              Séparez une chaîne en deux à un point précis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Chaîne à scinder</Label>
              <Select value={splitChainId} onValueChange={setSplitChainId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {approvedChains.filter(c => c.segments && c.segments.length >= 2).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {splitChainId && (
              <div>
                <Label>Point de scission (après le segment n°)</Label>
                <Input
                  type="number"
                  min={1}
                  max={(chains.find(c => c.id === splitChainId)?.segments?.length || 2) - 1}
                  value={splitIndex}
                  onChange={(e) => setSplitIndex(parseInt(e.target.value) || 1)}
                />
              </div>
            )}
            <div>
              <Label>Nom de la première partie</Label>
              <Input
                value={splitTitle1}
                onChange={(e) => setSplitTitle1(e.target.value)}
                placeholder="Ex: Phase 1"
              />
            </div>
            <div>
              <Label>Nom de la seconde partie</Label>
              <Input
                value={splitTitle2}
                onChange={(e) => setSplitTitle2(e.target.value)}
                placeholder="Ex: Phase 2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSplitDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSplit}>Scinder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HubPageLayout>
  );
}
