import { X, Users, Calendar, Target } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Project {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  funding_goal?: number;
  funded_amount?: number;
  ha_net_total?: number;
  manual_cash_total?: number;
  supporter_count?: number;
  funding_deadline?: string;
  is_funding_project?: boolean;
  status: string;
}

interface ProjectDetailDrawerProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectDetailDrawer = ({ project, open, onOpenChange }: ProjectDetailDrawerProps) => {
  if (!project) return null;

  const totalFunded = (project.ha_net_total || 0) + (project.manual_cash_total || 0);
  const fundingGoal = project.funding_goal || 0;
  const progress = fundingGoal > 0 ? Math.min((totalFunded / fundingGoal) * 100, 100) : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-bold pr-8">{project.title}</SheetTitle>
        </SheetHeader>

        {/* Cover Image */}
        {project.cover_image_url && (
          <div className="rounded-xl overflow-hidden mb-4">
            <img 
              src={project.cover_image_url} 
              alt={project.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Supporters count */}
        {project.is_funding_project && (project.supporter_count || 0) > 0 && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
            <Users className="h-4 w-4" />
            <span>
              Rejoint par <strong className="text-foreground">{project.supporter_count}</strong> supporters !
            </span>
          </div>
        )}

        {/* Content Cards */}
        <div className="grid gap-4">
          {/* Description */}
          {project.description && (
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>
          )}

          {/* Funding Info */}
          {project.is_funding_project && fundingGoal > 0 && (
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <h3 className="font-semibold mb-3">Financement</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Objectif</span>
                  <span className="font-bold">{fundingGoal.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Collecté</span>
                  <span className="font-bold text-primary">{totalFunded.toLocaleString('fr-FR')} €</span>
                </div>
                {project.funding_deadline && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Deadline</span>
                    <span className="font-medium">
                      {format(new Date(project.funding_deadline), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>
                )}
                <Progress value={progress} className="h-2 mt-2" />
                <p className="text-xs text-center text-muted-foreground">{Math.round(progress)}% de l'objectif</p>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <h3 className="font-semibold mb-2">Statut</h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
              <Target className="h-3 w-3" />
              {project.status === 'planned' && 'Planifié'}
              {project.status === 'in_progress' && 'En cours'}
              {project.status === 'completed' && 'Terminé'}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
