import React from 'react';
import { Button } from './ui/button';
import { UserPlus, Edit2, ExternalLink } from 'lucide-react';

interface VacantPosition {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  externalLink?: string;
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
    if (isAdmin && onEdit) {
      onEdit(position);
    } else if (onClick) {
      onClick(position);
    }
  };
  if (compact) {
    return (
      <div className="relative group w-full">
        <div 
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-card hover:bg-muted/50 border border-dashed border-primary/50 rounded-lg transition-all h-[44px] w-full shadow-sm cursor-pointer" 
          onClick={handleClick}
        >
          <UserPlus className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="font-medium text-foreground truncate whitespace-nowrap">
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
    <div className="relative group border-2 border-dashed border-primary/50 rounded-lg p-4 bg-accent/10 hover:border-primary hover:bg-accent/20 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={handleClick}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base text-foreground">{position.title}</h3>
            {position.externalLink && (
              <ExternalLink className="w-4 h-4 text-primary" />
            )}
          </div>
          {position.description && (
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{position.description}</p>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm text-primary font-medium mt-2 bg-primary/10 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            {position.externalLink ? 'Postuler en ligne' : 'Poste vacant'}
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