import React from 'react';
import { ValueChain } from '@/types/valueChain';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanChainDisplayProps {
  chain: ValueChain;
  onSegmentClick?: (segmentId: string) => void;
}

export const KanbanChainDisplay: React.FC<KanbanChainDisplayProps> = ({ 
  chain,
  onSegmentClick 
}) => {
  if (!chain.segments || chain.segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Aucun segment dans cette chaîne
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="flex gap-4 p-4 pb-8 min-h-full overflow-x-auto">
          {chain.segments.map((segment, index) => {
            const actorCount = (segment.actors?.length || 0) + (segment.sections?.length || 0);
            
            return (
              <Card 
                key={segment.id} 
                className="flex-shrink-0 w-64 md:w-72 bg-muted/30 border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onSegmentClick?.(segment.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      Étape {index + 1}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {actorCount}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold line-clamp-2 mt-2">
                    {segment.function_name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  {/* People Actors */}
                  {segment.actors && segment.actors.length > 0 && (
                    <div className="space-y-1.5">
                      {segment.actors.map((actor) => (
                        <div
                          key={actor.id}
                          className="flex items-center gap-2 p-2 rounded-md bg-card border border-border/50"
                        >
                          <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarImage src={actor.photo} />
                            <AvatarFallback className="text-[10px] bg-primary/10">
                              {actor.firstName?.[0]}{actor.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">
                              {actor.firstName} {actor.lastName}
                            </p>
                            {actor.role && (
                              <p className="text-[10px] text-muted-foreground truncate">
                                {actor.role}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Section Actors */}
                  {segment.sections && segment.sections.length > 0 && (
                    <div className="space-y-1.5">
                      {segment.sections.map((section) => (
                        <div
                          key={section.id}
                          className="flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20"
                        >
                          <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-xs font-medium truncate">
                            {section.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {(!segment.actors || segment.actors.length === 0) && 
                   (!segment.sections || segment.sections.length === 0) && (
                    <div className="py-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        Aucun acteur assigné
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
