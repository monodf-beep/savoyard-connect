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
  compact?: boolean;
}

export const VacantPositionCard: React.FC<VacantPositionCardProps> = ({ 
  position, 
  isAdmin, 
  onEdit,
  compact = false 
}) => {
  if (compact) {
    return (
      <div className="relative group">
        <div className="flex items-center justify-center p-3 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/20 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer min-h-[48px]">
          <div className="text-center">
            <UserPlus className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              {position.title}
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
            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative group border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 bg-muted/20 hover:border-primary/50 hover:bg-primary/5 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-muted">
          <UserPlus className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm">{position.title}</h3>
          {position.description && (
            <p className="text-xs text-muted-foreground mt-1">{position.description}</p>
          )}
          <span className="text-xs text-muted-foreground/70 mt-2 block">Poste vacant</span>
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