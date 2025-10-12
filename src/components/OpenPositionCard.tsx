import React from 'react';
import { Sparkles } from 'lucide-react';

interface OpenPositionCardProps {
  onClick: () => void;
}

export const OpenPositionCard: React.FC<OpenPositionCardProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="person-card min-w-[140px] flex flex-col items-center justify-center gap-1 cursor-pointer border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 hover:border-primary/50 transition-all py-2"
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="text-center">
        <p className="font-medium text-xs text-primary">Rejoignez l'équipe</p>
        <p className="text-[10px] text-muted-foreground">En savoir plus</p>
      </div>
    </div>
  );
};
