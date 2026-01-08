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
          type: 'Bénévolat',
          applicationUrl: jeVeuxAiderUrl,
          requirements: data.data.requirements?.length ? data.data.requirements : prev.requirements,
        }));
        toast.success('Mission importée ! Vérifiez et ajustez les champs.');
      } else {
        toast.error(data.error || 'Impossible d\'importer la mission');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'import');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      jobPostingSchema.parse({
        title: formData.title,
        department: formData.department,
        description: formData.description,
        location: formData.location,
        applicationUrl: formData.applicationUrl,
        type: formData.type
      });
    } catch (error: any) {
      const firstError = error.errors?.[0];
      toast.error(firstError?.message || 'Erreur de validation');
      return;
    }

    const jobPostingData: JobPosting = {
      id: formData.id || formData.title.toLowerCase().replace(/\s+/g, '-'),
      title: formData.title,
      department: formData.department,
      description: formData.description || '',
      requirements: formData.requirements || [],
      location: formData.location || '',
      type: formData.type as JobPosting['type'],
      applicationUrl: formData.applicationUrl,
      publishedDate: formData.publishedDate || new Date().toISOString().split('T')[0],
      isActive: formData.isActive ?? true
    };

    onSave(jobPostingData);
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
      requirements: prev.requirements?.filter((_, i) => i !== index) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {jobPosting ? 'Modifier la mission' : 'Ajouter une mission de bénévolat'}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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

          <div>
            <Label htmlFor="title">Titre du poste *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Paris, Remote, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type de contrat</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as JobPosting['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="publishedDate">Date de publication</Label>
              <Input
                id="publishedDate"
                type="date"
                value={formData.publishedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, publishedDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description du poste</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Décrivez le poste, les responsabilités..."
            />
          </div>

          <div>
            <Label htmlFor="applicationUrl">URL de candidature *</Label>
            <Input
              id="applicationUrl"
              value={formData.applicationUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, applicationUrl: e.target.value }))}
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <Label>Compétences requises</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Ajouter une compétence..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements?.map((req, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1 bg-muted/50 border-border font-medium">
                    {req}
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Poste actif</Label>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {jobPosting && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce poste ?')) {
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
                {jobPosting ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};