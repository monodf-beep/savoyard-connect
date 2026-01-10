import React, { useState } from 'react';
import { JobPosting } from '../types/organigramme';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { X, Plus, Trash2, Loader2, Link as LinkIcon } from 'lucide-react';
import { Badge } from './ui/badge';
import { jobPostingSchema } from '../lib/validations';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface JobPostingFormProps {
  jobPosting?: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobPosting: JobPosting) => void;
  onDelete?: (jobPostingId: string) => void;
}

export const JobPostingForm: React.FC<JobPostingFormProps> = ({
  jobPosting,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<JobPosting>>({
    id: jobPosting?.id || '',
    title: jobPosting?.title || '',
    department: jobPosting?.department || '',
    description: jobPosting?.description || '',
    requirements: jobPosting?.requirements || [],
    location: jobPosting?.location || '',
    type: jobPosting?.type || 'CDI',
    applicationUrl: jobPosting?.applicationUrl || '',
    publishedDate: jobPosting?.publishedDate || new Date().toISOString().split('T')[0],
    isActive: jobPosting?.isActive ?? true
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [jeVeuxAiderUrl, setJeVeuxAiderUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const importFromJeVeuxAider = async () => {
    if (!jeVeuxAiderUrl.includes('jeveuxaider.gouv.fr')) {
      toast.error('URL JeVeuxAider invalide');
      return;
    }
    
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-jeveuxaider', {
        body: { url: jeVeuxAiderUrl },
      });
      
      if (error) throw error;
      
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          title: data.data.title || prev.title,
          description: data.data.description || prev.description,
          department: data.data.department || prev.department,
          location: data.data.location || prev.location,
          type: 'Bénévolat' as const,
          applicationUrl: jeVeuxAiderUrl,
          requirements: data.data.requirements?.length ? data.data.requirements : prev.requirements,
        }));
        toast.success('Mission importée ! Vérifiez et ajustez les champs.');
      } else {
        toast.error(data.error || 'Impossible d\'importer la mission');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erreur lors de l\'import');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = jobPostingSchema.safeParse({
      title: formData.title,
      department: formData.department,
      description: formData.description,
      requirements: formData.requirements,
      location: formData.location,
      type: formData.type,
      applicationUrl: formData.applicationUrl,
    });
    
    if (!result.success) {
      const errors = result.error.errors.map(err => err.message);
      toast.error(errors.join(', '));
      return;
    }
    
    const jobPostingToSave: JobPosting = {
      id: formData.id || '',
      title: formData.title || '',
      department: formData.department || '',
      description: formData.description || '',
      requirements: formData.requirements || [],
      location: formData.location || '',
      type: formData.type || 'CDI',
      applicationUrl: formData.applicationUrl || '',
      publishedDate: formData.publishedDate || new Date().toISOString().split('T')[0],
      isActive: formData.isActive ?? true
    };
    
    onSave(jobPostingToSave);
    onClose();
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...(prev.requirements || []), newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: (prev.requirements || []).filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {jobPosting ? 'Modifier la mission' : 'Nouvelle mission bénévole'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* JeVeuxAider Import */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Importer depuis JeVeuxAider.gouv.fr
            </Label>
            <div className="flex gap-2">
              <Input
                value={jeVeuxAiderUrl}
                onChange={(e) => setJeVeuxAiderUrl(e.target.value)}
                placeholder="https://www.jeveuxaider.gouv.fr/admin/missions/..."
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="secondary" 
                onClick={importFromJeVeuxAider}
                disabled={isImporting || !jeVeuxAiderUrl}
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Importer'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Titre de la mission *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Accompagnateur bénévole"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Domaine *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Ex: Éducation, Culture..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lieu *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Paris, À distance..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'CDI' | 'CDD' | 'Stage' | 'Freelance' | 'Bénévolat' | 'Alternance') => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type de mission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bénévolat">Bénévolat</SelectItem>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                  <SelectItem value="Alternance">Alternance</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationUrl">Lien de candidature</Label>
              <Input
                id="applicationUrl"
                type="url"
                value={formData.applicationUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, applicationUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez la mission, les objectifs, le contexte..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Compétences / Prérequis</Label>
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Ajouter une compétence..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRequirement();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addRequirement}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.requirements?.map((req, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {req}
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Mission active (visible publiquement)</Label>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <div>
              {jobPosting && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (jobPosting.id && window.confirm('Supprimer cette mission ?')) {
                      onDelete(jobPosting.id);
                      onClose();
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit">
                {jobPosting ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
