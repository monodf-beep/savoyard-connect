import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useValueChains } from '@/hooks/useValueChains';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowCanvas } from '@/components/valueChain/WorkflowCanvas';
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
} from 'lucide-react';
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
    refetch,
  } = useValueChains();

  const [selectedChain, setSelectedChain] = useState<ValueChain | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<ValueChainSegment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

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

  // Auto-select first chain
  useEffect(() => {
    if (chains.length > 0 && !selectedChain) {
      const approvedChains = chains.filter(c => c.approval_status !== 'pending');
      if (approvedChains.length > 0) {
        setSelectedChain(approvedChains[0]);
      }
    }
  }, [chains, selectedChain]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Chain List */}
        {!isMobile && sidebarOpen && (
          <div className="w-72 flex-shrink-0 border-r border-border">
            <ChainSidebar
              chains={approvedChains}
              selectedChain={selectedChain}
              onSelectChain={setSelectedChain}
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
                  <h1 className="text-lg font-semibold text-foreground">
                    {selectedChain?.title || 'Chaînes de valeur'}
                  </h1>
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
              <WorkflowCanvas
                chain={selectedChain}
                onSegmentClick={handleSegmentClick}
                onAddSegment={isAdmin ? handleAddSegment : undefined}
                onSegmentsReorder={isAdmin ? (segmentIds) => reorderSegments(selectedChain.id, segmentIds) : undefined}
              />
            ) : (
              <Card className="h-full flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground">
                  Sélectionnez une chaîne dans le menu latéral
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Right Panel - Segment Details (Desktop) */}
        {!isMobile && detailPanelOpen && (
          <div className="w-80 flex-shrink-0 border-l border-border">
            <SegmentDetailPanel
              segment={selectedSegment}
              onClose={() => {
                setDetailPanelOpen(false);
                setSelectedSegment(null);
              }}
              onEdit={() => selectedChain && handleEdit(selectedChain)}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* Right Panel - Segment Details (Mobile Sheet) */}
        {isMobile && (
          <Sheet open={detailPanelOpen} onOpenChange={setDetailPanelOpen}>
            <SheetContent side="right" className="p-0 w-full sm:max-w-md">
              <SegmentDetailPanel
                segment={selectedSegment}
                onClose={() => {
                  setDetailPanelOpen(false);
                  setSelectedSegment(null);
                }}
                onEdit={() => selectedChain && handleEdit(selectedChain)}
                isAdmin={isAdmin}
              />
            </SheetContent>
          </Sheet>
        )}
      </main>

      {/* Mobile bottom bar for chain selection */}
      {isMobile && (
        <div className="border-t border-border bg-card p-2">
          <Select
            value={selectedChain?.id || ''}
            onValueChange={(id) => {
              const chain = approvedChains.find(c => c.id === id);
              if (chain) setSelectedChain(chain);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une chaîne" />
            </SelectTrigger>
            <SelectContent>
              {approvedChains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id}>
                  {chain.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isAdmin || isSectionLeader) && (
        <ValueChainForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingChain(undefined);
          }}
          chain={editingChain}
          people={people}
          sections={sections}
          onSave={handleCreateOrUpdate}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la chaîne de valeur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette chaîne de valeur ? Cette action est irréversible.
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
              Les segments de la chaîne B seront ajoutés à la fin de la chaîne A.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Chaîne A (première)</Label>
              <Select value={mergeChainA} onValueChange={setMergeChainA}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {approvedChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      {chain.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chaîne B (seconde)</Label>
              <Select value={mergeChainB} onValueChange={setMergeChainB}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {approvedChains
                    .filter((c) => c.id !== mergeChainA)
                    .map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        {chain.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nom de la nouvelle chaîne</Label>
              <Input
                value={mergeTitle}
                onChange={(e) => setMergeTitle(e.target.value)}
                placeholder="Entrez le nom..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeDialogOpen(false)}>
              Annuler
            </Button>
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
              Divisez une chaîne en deux parties distinctes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Chaîne à scinder</Label>
              <Select value={splitChainId} onValueChange={setSplitChainId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {approvedChains
                    .filter((c) => c.segments && c.segments.length >= 2)
                    .map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        {chain.title} ({chain.segments?.length} segments)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {splitChainId && (
              <div className="space-y-2">
                <Label>Scinder après le segment n°</Label>
                <Select
                  value={splitIndex.toString()}
                  onValueChange={(v) => setSplitIndex(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chains
                      .find((c) => c.id === splitChainId)
                      ?.segments?.slice(0, -1)
                      .map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Après segment {i + 1}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Nom de la première chaîne</Label>
              <Input
                value={splitTitle1}
                onChange={(e) => setSplitTitle1(e.target.value)}
                placeholder="Première partie..."
              />
            </div>
            <div className="space-y-2">
              <Label>Nom de la seconde chaîne</Label>
              <Input
                value={splitTitle2}
                onChange={(e) => setSplitTitle2(e.target.value)}
                placeholder="Seconde partie..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSplitDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSplit}>Scinder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
