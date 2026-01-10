import React from 'react';
import { ValueChainSegment } from '@/types/valueChain';
import { Person, Section } from '@/types/organigramme';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2, 
  User, 
  X, 
  Edit2, 
  Users,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SegmentDetailPanelProps {
  segment: ValueChainSegment | null;
  onClose: () => void;
  onEdit?: () => void;
  isAdmin?: boolean;
}

export const SegmentDetailPanel: React.FC<SegmentDetailPanelProps> = ({
  segment,
  onClose,
  onEdit,
  isAdmin,
}) => {
  if (!segment) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ArrowRight className="h-8 w-8" />
        </div>
        <p className="text-sm">
          Cliquez sur un segment pour voir les détails
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Segment
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Segment Name */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              {segment.function_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Étape du processus
            </p>
          </div>

          {/* Actors Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm text-foreground">
                Acteurs assignés
              </h4>
              <Badge variant="secondary" className="text-xs">
                {(segment.actors?.length || 0) + (segment.sections?.length || 0)}
              </Badge>
            </div>

            <div className="space-y-2">
              {/* People */}
              {segment.actors?.map((actor) => (
                <div
                  key={actor.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarImage src={actor.photo} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {actor.firstName?.[0]}{actor.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {actor.firstName} {actor.lastName}
                    </p>
                    {actor.role && (
                      <p className="text-xs text-muted-foreground truncate">
                        {actor.role}
                      </p>
                    )}
                  </div>
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}

              {/* Sections */}
              {segment.sections?.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {section.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Section
                    </p>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {(!segment.actors?.length && !segment.sections?.length) && (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Aucun acteur assigné</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      {isAdmin && onEdit && (
        <div className="p-4 border-t border-border">
          <Button onClick={onEdit} className="w-full" size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            Modifier ce segment
          </Button>
        </div>
      )}
    </div>
  );
};
