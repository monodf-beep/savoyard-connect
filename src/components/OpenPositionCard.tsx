import React from 'react';
import { Sparkles } from 'lucide-react';

interface OpenPositionCardProps {
  onClick: () => void;
}

export const OpenPositionCard: React.FC<OpenPositionCardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="min-w-[160px] h-[44px] flex flex-row items-center gap-2.5 px-3 py-2 cursor-pointer border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 hover:shadow-sm transition-all rounded-lg"
    >
      <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/30 flex-shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="text-left flex-1 min-w-0">
        <p className="font-semibold text-xs text-foreground truncate">Rejoignez l'équipe</p>
        <p className="text-[10px] text-muted-foreground truncate">En savoir plus</p>
      </div>
    </div>
  );
};
