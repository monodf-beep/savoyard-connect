import React from 'react';
import { ValueChain } from '@/types/valueChain';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, ArrowRight, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface MinimalChainDisplayProps {
  chain: ValueChain;
}

export const MinimalChainDisplay: React.FC<MinimalChainDisplayProps> = ({ chain }) => {
  const isMobile = useIsMobile();

  if (!chain.segments || chain.segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 md:h-64 text-muted-foreground text-sm">
        Aucun segment dans cette chaîne
      </div>
    );
  }

  return (
    <div className="w-full py-4 md:py-12 px-2 md:px-4 overflow-x-auto">
      <div className={`flex items-center justify-start md:justify-center gap-3 md:gap-8 ${isMobile ? 'flex-col' : 'flex-row flex-wrap'}`}>
        {chain.segments.map((segment, index) => (
          <React.Fragment key={segment.id}>
            {/* Segment Card */}
            <div className="flex flex-col items-center gap-2 md:gap-3 animate-fade-in w-full md:w-auto" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Segment Title */}
              <div className="text-center">
                <h3 className="text-sm md:text-lg font-semibold text-foreground mb-1">
                  {segment.function_name}
                </h3>
                <div className="h-0.5 md:h-1 w-12 md:w-16 bg-primary/20 rounded-full mx-auto" />
              </div>

              {/* Actors Container */}
              <div className="flex flex-col gap-1.5 md:gap-2 min-w-0 md:min-w-[180px] w-full md:w-auto px-2 md:px-0">
                {/* People Actors */}
                {segment.actors && segment.actors.length > 0 && segment.actors.map((actor) => (
                  <div
                    key={actor.id}
                    className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-all"
                  >
                    <Avatar className="h-6 w-6 md:h-7 md:w-7 flex-shrink-0">
                      <AvatarImage src={actor.photo} />
                      <AvatarFallback className="text-xs bg-primary/10">
                        {actor.firstName?.[0]}{actor.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs md:text-sm text-foreground truncate">
                      {actor.firstName} {actor.lastName}
                    </span>
                  </div>
                ))}

                {/* Section Actors */}
                {segment.sections && segment.sections.length > 0 && segment.sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all"
                  >
                    <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
                    <span className="text-xs md:text-sm text-foreground truncate">
                      {section.title}
                    </span>
                  </div>
                ))}

                {/* Empty state */}
                {(!segment.actors || segment.actors.length === 0) && 
                 (!segment.sections || segment.sections.length === 0) && (
                  <div className="px-2 md:px-3 py-1.5 md:py-2 text-center">
                    <Badge variant="outline" className="text-xs">
                      Aucun acteur
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow between segments */}
            {index < chain.segments.length - 1 && (
              <div className="flex items-center justify-center animate-fade-in py-1 md:py-0" style={{ animationDelay: `${index * 100 + 50}ms` }}>
                {isMobile ? (
                  <ArrowDown className="h-5 w-5 text-primary/40" strokeWidth={2.5} />
                ) : (
                  <ArrowRight className="h-6 w-6 md:h-8 md:w-8 text-primary/40" strokeWidth={2.5} />
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
