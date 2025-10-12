import React from 'react';
import { Sparkles } from 'lucide-react';

interface OpenPositionCardProps {
  onClick: () => void;
}

export const OpenPositionCard: React.FC<OpenPositionCardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="person-card min-w-[140px] h-[44px] flex flex-row items-center justify-center gap-2 px-3 cursor-pointer border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 hover:border-primary/50 transition-all"
    >
      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
        <Sparkles className="w-3 h-3 text-primary" />
      </div>
      <div className="text-left flex-1 min-w-0">
        <p className="font-medium text-xs text-primary truncate">Rejoignez l'équipe</p>
        <p className="text-[10px] text-muted-foreground truncate">En savoir plus</p>
      </div>
    </div>
  );
};
