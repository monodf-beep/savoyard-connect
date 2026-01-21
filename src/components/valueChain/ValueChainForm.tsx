import React, { useState, useEffect } from 'react';
import { ValueChain, ValueChainSegment } from '@/types/valueChain';
import { Person, Section } from '@/types/organigramme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2, ChevronUp, ChevronDown, X, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SegmentFormData {
  function_name: string;
  actorIds: string[];
  sectionIds: string[];
}

interface ValueChainFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chain?: ValueChain;
  people: Person[];
  sections: Section[];
  onSave: (title: string, description: string, segments: SegmentFormData[]) => Promise<void>;
}

export const ValueChainForm: React.FC<ValueChainFormProps> = ({
  open,
  onOpenChange,
  chain,
  people,
  sections,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [segments, setSegments] = useState<SegmentFormData[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialiser ou réinitialiser le formulaire quand la chaîne change
  useEffect(() => {
    if (open) {
      setTitle(chain?.title || '');
      setDescription(chain?.description || '');
      setSegments(
        chain?.segments?.map((s) => ({
          function_name: s.function_name,
          actorIds: s.actors?.map((a) => a.id) || [],
          sectionIds: s.sections?.map((sec) => sec.id) || [],
        })) || []
      );
    }
  }, [open, chain]);

  const addSegment = () => {
    setSegments([...segments, { function_name: '', actorIds: [], sectionIds: [] }]);
  };

  const removeSegment = (index: number) => {
    setSegments(segments.filter((_, i) => i !== index));
  };

  const updateSegment = (index: number, field: keyof SegmentFormData, value: any) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], [field]: value };
    setSegments(updated);
  };

  const addActorToSegment = (segmentIndex: number, actorId: string) => {
    const segment = segments[segmentIndex];
    if (!segment.actorIds.includes(actorId)) {
      updateSegment(segmentIndex, 'actorIds', [...segment.actorIds, actorId]);
    }
  };

  const removeActorFromSegment = (segmentIndex: number, actorId: string) => {
    const segment = segments[segmentIndex];
    updateSegment(
      segmentIndex,
      'actorIds',
      segment.actorIds.filter((id) => id !== actorId)
    );
  };

  const addSectionToSegment = (segmentIndex: number, sectionId: string) => {
    const segment = segments[segmentIndex];
    if (!segment.sectionIds.includes(sectionId)) {
      updateSegment(segmentIndex, 'sectionIds', [...segment.sectionIds, sectionId]);
    }
  };

  const removeSectionFromSegment = (segmentIndex: number, sectionId: string) => {
    const segment = segments[segmentIndex];
    updateSegment(
      segmentIndex,
      'sectionIds',
      segment.sectionIds.filter((id) => id !== sectionId)
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(title, description, segments);
      onOpenChange(false);
      setTitle('');
      setDescription('');
      setSegments([]);
    } catch (error) {
      console.error('Error saving chain:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveSegment = (index: number, direction: 'up' | 'down') => {
    const newSegments = [...segments];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < segments.length) {
      [newSegments[index], newSegments[targetIndex]] = [
        newSegments[targetIndex],
        newSegments[index],
      ];
      setSegments(newSegments);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {chain ? 'Modifier la chaîne de valeur' : 'Créer une chaîne de valeur'}
          </DialogTitle>
          <DialogDescription>
            Définissez les segments de la chaîne et assignez les acteurs de l'organigramme
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de la chaîne</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Édition"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la chaîne de valeur"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Segments</Label>
              <Button size="sm" variant="outline" onClick={addSegment}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter un segment
              </Button>
            </div>

            <div className="space-y-4">
              {segments.map((segment, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-0.5 pt-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 md:h-6 md:w-6"
                          onClick={() => moveSegment(index, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 md:h-6 md:w-6"
                          onClick={() => moveSegment(index, 'down')}
                          disabled={index === segments.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={segment.function_name}
                            onChange={(e) =>
                              updateSegment(index, 'function_name', e.target.value)
                            }
                            placeholder="Nom de la fonction"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSegment(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Acteurs & Sections assignés</Label>
                          <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-border rounded-md">
                            {/* Display people actors */}
                            {segment.actorIds.map((actorId) => {
                              const actor = people.find((p) => p.id === actorId);
                              if (!actor) return null;
                              return (
                                <Badge
                                  key={actorId}
                                  variant="outline"
                                  className="flex items-center gap-1 pr-1 bg-muted/50 border-border font-medium"
                                >
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={actor.photo} />
                                    <AvatarFallback className="text-[8px]">
                                      {actor.firstName?.[0]}
                                      {actor.lastName?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs">
                                    {actor.firstName} {actor.lastName}
                                  </span>
                                  <X
                                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                                    onClick={() => removeActorFromSegment(index, actorId)}
                                  />
                                </Badge>
                              );
                            })}
                            {/* Display section actors */}
                            {segment.sectionIds.map((sectionId) => {
                              const section = sections.find((s) => s.id === sectionId);
                              if (!section) return null;
                              return (
                                <Badge
                                  key={sectionId}
                                  variant="outline"
                                  className="flex items-center gap-1 pr-1"
                                >
                                  <Building2 className="h-3 w-3" />
                                  <span className="text-xs">{section.title}</span>
                                  <X
                                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                                    onClick={() => removeSectionFromSegment(index, sectionId)}
                                  />
                                </Badge>
                              );
                            })}
                          </div>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full">
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter un acteur ou section
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[340px] p-0" align="start">
                              <Tabs defaultValue="people" className="w-full">
                                <TabsList className="w-full grid grid-cols-2">
                                  <TabsTrigger value="people">Personnes</TabsTrigger>
                                  <TabsTrigger value="sections">Sections</TabsTrigger>
                                </TabsList>
                                <TabsContent value="people" className="m-0">
                                  <Command>
                                    <CommandInput placeholder="Rechercher une personne..." />
                                    <CommandList>
                                      <CommandEmpty>Aucune personne trouvée</CommandEmpty>
                                      <CommandGroup>
                                        {people
                                          .filter((p) => !segment.actorIds.includes(p.id))
                                          .filter((p, index, self) => 
                                            index === self.findIndex((t) => t.id === p.id)
                                          )
                                          .map((person) => (
                                            <CommandItem
                                              key={person.id}
                                              onSelect={() => addActorToSegment(index, person.id)}
                                            >
                                              <Avatar className="h-6 w-6 mr-2">
                                                <AvatarImage src={person.photo} />
                                                <AvatarFallback className="text-xs">
                                                  {person.firstName?.[0]}
                                                  {person.lastName?.[0]}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="flex-1">
                                                <div className="text-sm font-medium">
                                                  {person.firstName} {person.lastName}
                                                </div>
                                                {person.role && (
                                                  <div className="text-xs text-muted-foreground">
                                                    {person.role}
                                                  </div>
                                                )}
                                              </div>
                                            </CommandItem>
                                          ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </TabsContent>
                                <TabsContent value="sections" className="m-0">
                                  <Command>
                                    <CommandInput placeholder="Rechercher une section..." />
                                    <CommandList>
                                      <CommandEmpty>Aucune section trouvée</CommandEmpty>
                                      <CommandGroup>
                                        {sections
                                          .filter((s) => !segment.sectionIds.includes(s.id))
                                          .map((section) => (
                                            <CommandItem
                                              key={section.id}
                                              onSelect={() => addSectionToSegment(index, section.id)}
                                            >
                                              <Building2 className="h-4 w-4 mr-2" />
                                              <span className="text-sm">{section.title}</span>
                                            </CommandItem>
                                          ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </TabsContent>
                              </Tabs>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={loading || !title.trim()}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
