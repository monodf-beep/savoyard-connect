import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, FileText, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Project } from '@/pages/Projects';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProjectCardProps {
  project: Project;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const statusLabels = {
  planned: 'Planifié',
  in_progress: 'En cours',
  completed: 'Terminé',
};

const statusColors = {
  planned: 'bg-muted text-muted-foreground border border-border',
  in_progress: 'bg-primary/10 text-primary border border-primary/20',
  completed: 'bg-muted/70 text-foreground border border-border font-medium',
};

export const ProjectCard = ({ project, isAdmin, onEdit, onDelete }: ProjectCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
            <Badge className={statusColors[project.status]}>
              {statusLabels[project.status]}
            </Badge>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {project.description && (
          <CardDescription className="mt-2">{project.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dates */}
        {(project.start_date || project.end_date) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {project.start_date && format(new Date(project.start_date), 'dd MMM yyyy', { locale: fr })}
              {project.start_date && project.end_date && ' - '}
              {project.end_date && format(new Date(project.end_date), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
        )}

        {/* Roadmap */}
        {project.roadmap && (
          <div>
            <h4 className="text-sm font-medium mb-2">Feuille de route</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {project.roadmap}
            </p>
          </div>
        )}

        {/* Documents */}
        {project.documents && project.documents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </h4>
            <div className="space-y-1">
              {project.documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {doc.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
