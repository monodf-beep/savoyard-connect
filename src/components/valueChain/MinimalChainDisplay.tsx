import React from 'react';
import { ValueChain } from '@/types/valueChain';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MinimalChainDisplayProps {
  chain: ValueChain;
}

export const MinimalChainDisplay: React.FC<MinimalChainDisplayProps> = ({ chain }) => {
  if (!chain.segments || chain.segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Aucun segment dans cette chaîne
      </div>
    );
  }

  return (
    <div className="w-full py-12 px-4">
      <div className="flex items-center justify-center gap-8 flex-wrap">
        {chain.segments.map((segment, index) => (
          <React.Fragment key={segment.id}>
            {/* Segment Card */}
            <div className="flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Segment Title */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {segment.function_name}
                </h3>
                <div className="h-1 w-16 bg-primary/20 rounded-full mx-auto" />
              </div>

              {/* Actors Container */}
              <div className="flex flex-col gap-2 min-w-[180px]">
                {/* People Actors */}
                {segment.actors && segment.actors.length > 0 && segment.actors.map((actor) => (
                  <div
                    key={actor.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-all hover-scale"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={actor.photo} />
                      <AvatarFallback className="text-xs bg-primary/10">
                        {actor.firstName?.[0]}{actor.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground truncate">
                      {actor.firstName} {actor.lastName}
                    </span>
                  </div>
                ))}

                {/* Section Actors */}
                {segment.sections && segment.sections.length > 0 && segment.sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all hover-scale"
                  >
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground truncate">
                      {section.title}
                    </span>
                  </div>
                ))}

                {/* Empty state */}
                {(!segment.actors || segment.actors.length === 0) && 
                 (!segment.sections || segment.sections.length === 0) && (
                  <div className="px-3 py-2 text-center">
                    <Badge variant="outline" className="text-xs">
                      Aucun acteur
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow between segments */}
            {index < chain.segments.length - 1 && (
              <div className="flex items-center animate-fade-in" style={{ animationDelay: `${index * 100 + 50}ms` }}>
                <ArrowRight className="h-8 w-8 text-primary/40" strokeWidth={2.5} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
