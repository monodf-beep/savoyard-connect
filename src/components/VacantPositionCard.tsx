import React from 'react';
import { Button } from './ui/button';
import { UserPlus, Edit2 } from 'lucide-react';

interface VacantPosition {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
}

interface VacantPositionCardProps {
  position: VacantPosition;
  isAdmin: boolean;
  onEdit?: (position: VacantPosition) => void;
  onClick?: (position: VacantPosition) => void;
  compact?: boolean;
}

export const VacantPositionCard: React.FC<VacantPositionCardProps> = ({ 
  position, 
  isAdmin, 
  onEdit,
  onClick,
  compact = false 
}) => {
  const handleClick = () => {
    if (!isAdmin && onClick) {
      onClick(position);
    }
  };
  if (compact) {
    return (
      <div className="relative group">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-accent/20 to-primary/10 border border-dashed border-primary/40 rounded-md transition-all duration-200 hover:border-primary hover:shadow-sm hover:scale-[1.02] cursor-pointer h-[44px]" onClick={handleClick}>
          <UserPlus className="w-4 h-4 text-primary/70" />
          <span className="font-medium text-foreground/80 truncate whitespace-nowrap">
            {position.title}
          </span>
        </div>
        
        {isAdmin && onEdit && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(position);
            }}
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative group border-2 border-dashed border-primary/40 rounded-lg p-4 bg-gradient-to-br from-accent/10 to-primary/5 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer" onClick={handleClick}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10 border border-primary/20">
          <UserPlus className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-foreground">{position.title}</h3>
          {position.description && (
            <p className="text-xs text-muted-foreground mt-1">{position.description}</p>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-primary/70 mt-2 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
            Poste vacant
          </span>
        </div>
      </div>
      
      {isAdmin && onEdit && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(position);
          }}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};