import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useValueChains } from '@/hooks/useValueChains';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MinimalChainDisplay } from '@/components/valueChain/MinimalChainDisplay';
import { ValueChainForm } from '@/components/valueChain/ValueChainForm';
import { TutorialDialog } from '@/components/TutorialDialog';
import { ApprovalBadge } from '@/components/ApprovalBadge';
import { ApprovalActions } from '@/components/ApprovalActions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Plus,
  Edit,
  Trash2,
  Combine,
  Split,
  Loader2,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ValueChain } from '@/types/valueChain';
import { toast } from 'sonner';

export default function ValueChains() {
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
    mergeChains,
    splitChain,
    refetch,
  } = useValueChains();

  const [selectedChain, setSelectedChain] = useState<ValueChain | null>(null);

  // Sélectionner automatiquement la première chaîne
  useEffect(() => {
    if (chains.length > 0 && !selectedChain) {
      setSelectedChain(chains[0]);
    }
  }, [chains, selectedChain]);
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

  // Separate pending chains for admin approval
  const pendingChains = chains.filter(c => c.approval_status === 'pending');
  const approvedChains = chains.filter(c => c.approval_status !== 'pending');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
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

      <main className="flex-1 container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-foreground">Chaînes de valeur</h1>
                <p className="text-xs md:text-base text-muted-foreground mt-0.5 md:mt-1">
                  Gestion des processus et flux
                </p>
              </div>
              <TutorialDialog
                title="Comprendre les chaînes de valeur"
                description="Les chaînes de valeur permettent de visualiser et organiser les processus opérationnels de votre organisation."
                benefits={[
                  "Visualiser l'ensemble des processus et leur enchaînement",
                  "Identifier les acteurs impliqués dans chaque étape",
                  "Optimiser les flux de travail en détectant les goulots d'étranglement",
                  "Faciliter la communication entre les différentes fonctions",
                  "Assurer la traçabilité et la cohérence des processus"
                ]}
                steps={[
                  {
                    title: "Créer une nouvelle chaîne",
                    description: "Cliquez sur 'Créer une chaîne' pour définir un nouveau processus opérationnel. Donnez-lui un nom et une description claire.",
                    tips: ["Choisissez un nom descriptif qui reflète le processus global"]
                  },
                  {
                    title: "Ajouter des segments fonctionnels",
                    description: "Décomposez votre processus en étapes (segments). Chaque segment représente une fonction ou activité clé.",
                    tips: [
                      "Ordonnez les segments de manière logique selon le flux",
                      "Un segment = une fonction précise (ex: Accueil, Traitement, Validation)"
                    ]
                  },
                  {
                    title: "Assigner des acteurs",
                    description: "Pour chaque segment, sélectionnez les personnes de l'organigramme qui interviennent dans cette étape.",
                    tips: [
                      "Les acteurs doivent déjà exister dans l'organigramme",
                      "Un acteur peut apparaître dans plusieurs segments",
                      "Respectez la règle : un acteur par chaîne maximum"
                    ]
                  },
                  {
                    title: "Fusionner des chaînes",
                    description: "Combinez deux chaînes existantes pour créer un processus plus complexe. Les segments sont concaténés.",
                    tips: ["Utile pour regrouper des processus complémentaires"]
                  },
                  {
                    title: "Scinder une chaîne",
                    description: "Divisez une chaîne longue en deux parties distinctes pour mieux organiser vos processus.",
                    tips: ["Permet de séparer des sous-processus indépendants"]
                  }
                ]}
              />
            </div>
            {isAdmin && (
              <div className="flex gap-1.5 md:gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMergeDialogOpen(true)}
                  disabled={approvedChains.length < 2}
                  className="text-xs md:text-sm"
                >
                  <Combine className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Fusionner</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSplitDialogOpen(true)}
                  disabled={approvedChains.length === 0}
                  className="text-xs md:text-sm"
                >
                  <Split className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Scinder</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingChain(undefined);
                    setFormOpen(true);
                  }}
                  className="text-xs md:text-sm"
                >
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden xs:inline">Créer</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {chains.length === 0 ? (
          <Card className="p-6 md:p-12 text-center">
            <p className="text-sm md:text-base text-muted-foreground mb-4">Aucune chaîne de valeur créée</p>
            {(isAdmin || isSectionLeader) && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer la première chaîne
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pending approvals section (Admin only) */}
            {isAdmin && pendingChains.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-orange-700 dark:text-orange-300">
                  Chaînes en attente d'approbation ({pendingChains.length})
                </h2>
                <div className="grid gap-4">
                  {pendingChains.map((chain) => (
                    <Card key={chain.id} className="p-6 border-orange-500/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {chain.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <ApprovalBadge status="pending" />
                          </div>
                          {chain.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {chain.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(chain)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(chain.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <ApprovalActions 
                          onApprove={() => handleApproveChain(chain.id)}
                          onReject={() => handleRejectChain(chain.id)}
                          itemType="chaîne de valeur"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Approved chains selector */}
            {approvedChains.length > 0 && (
              <>
                <div className="flex flex-wrap gap-2">
                  {approvedChains.map((chain) => (
                    <Button
                      key={chain.id}
                      variant={selectedChain?.id === chain.id ? 'default' : 'outline'}
                      onClick={() => setSelectedChain(chain)}
                    >
                      {chain.title}
                      {chain.approval_status === 'approved' && isAdmin && (
                        <span className="ml-2 text-xs">✓</span>
                      )}
                    </Button>
                  ))}
                </div>

                {/* Selected chain diagram */}
                {selectedChain && approvedChains.find(c => c.id === selectedChain.id) && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">
                          {selectedChain.title}
                        </h2>
                        {selectedChain.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedChain.description}
                          </p>
                        )}
                        {selectedChain.approval_status && (
                          <div className="mt-2">
                            <ApprovalBadge status={selectedChain.approval_status} />
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(selectedChain)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(selectedChain.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                    </div>

                    <MinimalChainDisplay chain={selectedChain} />
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </main>

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

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la chaîne ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les segments et assignations seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fusionner deux chaînes</DialogTitle>
            <DialogDescription>
              Sélectionnez deux chaînes à fusionner et donnez un nom à la nouvelle chaîne
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Première chaîne</Label>
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
              <Label>Deuxième chaîne</Label>
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
              <Label>Titre de la nouvelle chaîne</Label>
              <Input
                value={mergeTitle}
                onChange={(e) => setMergeTitle(e.target.value)}
                placeholder="Ex: Chaîne fusionnée"
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
              Divisez une chaîne en deux nouvelles chaînes à partir d'un segment
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
                  {approvedChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      {chain.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {splitChainId && (
              <>
                <div className="space-y-2">
                  <Label>Scinder après le segment n°</Label>
                  <Input
                    type="number"
                    min="1"
                    max={(approvedChains.find((c) => c.id === splitChainId)?.segments?.length || 1) - 1}
                    value={splitIndex}
                    onChange={(e) => setSplitIndex(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Titre de la première chaîne</Label>
                  <Input
                    value={splitTitle1}
                    onChange={(e) => setSplitTitle1(e.target.value)}
                    placeholder="Ex: Partie 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Titre de la deuxième chaîne</Label>
                  <Input
                    value={splitTitle2}
                    onChange={(e) => setSplitTitle2(e.target.value)}
                    placeholder="Ex: Partie 2"
                  />
                </div>
              </>
            )}
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
