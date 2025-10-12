import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { MapPin, Calendar, Clock, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SectionReassurance {
  id: string;
  section_id: string;
  on_site_required: boolean;
  flexible_commitment: boolean;
  flexible_hours: boolean;
  custom_info: string | null;
  location: string;
  commitment_details: string | null;
  availability_details: string | null;
}

interface SectionReassuranceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionTitle: string;
  onApply: () => void;
}

export const SectionReassuranceDialog: React.FC<SectionReassuranceDialogProps> = ({
  open,
  onOpenChange,
  sectionId,
  sectionTitle,
  onApply,
}) => {
  const [reassurance, setReassurance] = useState<SectionReassurance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadReassurance();
    }
  }, [open, sectionId]);

  const loadReassurance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('section_reassurance')
      .select('*')
      .eq('section_id', sectionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading reassurance:', error);
    }
    
    setReassurance(data || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Rejoignez {sectionTitle}</DialogTitle>
          <DialogDescription>
            Découvrez les modalités de collaboration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm mb-1">Lieu</h4>
              <p className="text-sm text-muted-foreground">
                {reassurance?.on_site_required 
                  ? "Présence sur site requise" 
                  : "Travail à distance possible"}
              </p>
            </div>
          </div>

          {/* Flexible commitment */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm mb-1">Engagement</h4>
              <p className="text-sm text-muted-foreground">
                {reassurance?.commitment_details || 
                  (reassurance?.flexible_commitment 
                    ? "L'engagement est flexible selon vos disponibilités" 
                    : "Variable selon poste")}
              </p>
            </div>
          </div>

          {/* Flexible hours */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm mb-1">Disponibilité</h4>
              <p className="text-sm text-muted-foreground">
                {reassurance?.availability_details || 
                  (reassurance?.flexible_hours 
                    ? "Le nombre d'heures par semaine est flexible" 
                    : "À discuter")}
              </p>
            </div>
          </div>

          {/* Custom info */}
          {reassurance?.custom_info && (
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">Informations complémentaires</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {reassurance.custom_info}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Retour
          </Button>
          <Button onClick={onApply}>
            Postuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
