import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Target, TrendingUp, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { FundingProject } from '@/hooks/useFundingProjects';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FundingProjectCardProps {
  project: FundingProject;
  isAdmin: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const FundingProjectCard = ({ 
  project, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onSync,
  isSyncing 
}: FundingProjectCardProps) => {
  const progress = project.funding_goal > 0 
    ? Math.min(100, (project.funded_amount / project.funding_goal) * 100) 
    : 0;
  
  const isFunded = project.funding_goal > 0 && project.funded_amount >= project.funding_goal;
  
  const daysRemaining = project.funding_deadline 
    ? differenceInDays(new Date(project.funding_deadline), new Date())
    : null;

  const isUrgent = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${isFunded ? 'border-green-500/50' : ''}`}>
      {/* Cover Image */}
      {project.cover_image_url && (
        <div className="h-40 bg-muted overflow-hidden">
          <img 
            src={project.cover_image_url} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl line-clamp-2">{project.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              {isFunded && (
                <Badge className="bg-green-500 text-white">
                  ✓ Financé !
                </Badge>
              )}
              {isUrgent && !isFunded && (
                <Badge variant="destructive" className="animate-pulse">
                  ⏰ Plus que {daysRemaining}j
                </Badge>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-1">
              {onSync && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onSync}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        {project.description && (
          <CardDescription className="mt-2 line-clamp-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Funding Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-lg">
              {project.funded_amount.toLocaleString('fr-FR')}€
            </span>
            <span className="text-muted-foreground">
              sur {project.funding_goal.toLocaleString('fr-FR')}€
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}% atteint</span>
            {project.funding_deadline && (
              <span>
                Jusqu'au {format(new Date(project.funding_deadline), 'dd MMM yyyy', { locale: fr })}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{project.supporter_count} soutiens</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span>
              {project.ha_net_total > 0 && `HA: ${project.ha_net_total}€`}
              {project.ha_net_total > 0 && project.manual_cash_total > 0 && ' + '}
              {project.manual_cash_total > 0 && `Manuel: ${project.manual_cash_total}€`}
              {project.ha_net_total === 0 && project.manual_cash_total === 0 && 'Pas encore de dons'}
            </span>
          </div>
        </div>

        {/* Action button */}
        <Button className="w-full" variant={isFunded ? 'outline' : 'default'}>
          {isFunded ? 'Voir les détails' : 'Soutenir ce projet'}
        </Button>
      </CardContent>
    </Card>
  );
};
