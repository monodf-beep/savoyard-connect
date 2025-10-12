import React from 'react';
import { Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface OpenPositionCardProps {
  onClick: () => void;
}

export const OpenPositionCard: React.FC<OpenPositionCardProps> = ({ onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div
            onClick={onClick}
            className="person-card min-w-[140px] flex flex-col items-center justify-center gap-1 cursor-pointer border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 hover:border-primary/50 transition-all py-2"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-xs text-primary">Rejoignez l'équipe</p>
              <p className="text-[10px] text-muted-foreground">Candidature spontanée</p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium text-sm">Postulez spontanément</p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <div><strong>Lieu :</strong> Annecy</div>
              <div><strong>Engagement :</strong> Variable selon poste</div>
              <div><strong>Disponibilité :</strong> À discuter</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};