import { Progress } from '@/components/ui/progress';

interface Project {
  id: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  funding_goal?: number;
  funded_amount?: number;
  ha_net_total?: number;
  manual_cash_total?: number;
  is_funding_project?: boolean;
}

interface ProjectGridCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectGridCard = ({ project, onClick }: ProjectGridCardProps) => {
  const totalFunded = (project.ha_net_total || 0) + (project.manual_cash_total || 0);
  const fundingGoal = project.funding_goal || 0;
  const progress = fundingGoal > 0 ? Math.min((totalFunded / fundingGoal) * 100, 100) : 0;

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30"
    >
      {/* Cover Image */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {project.cover_image_url ? (
          <img 
            src={project.cover_image_url} 
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-4xl opacity-50">📋</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Funding Progress */}
        {project.is_funding_project && fundingGoal > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-lg font-bold text-primary">
                {totalFunded.toLocaleString('fr-FR')} €
              </span>
              <span className="text-sm text-muted-foreground">
                / {fundingGoal.toLocaleString('fr-FR')} €
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </div>
    </div>
  );
};
