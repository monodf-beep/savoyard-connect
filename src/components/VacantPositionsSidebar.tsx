import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, UserPlus, MapPin, ExternalLink } from 'lucide-react';

interface VacantPosition {
  id: string;
  sectionId: string;
  sectionTitle: string;
  title: string;
  description?: string;
  externalLink?: string;
}

interface VacantPositionsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  positions: VacantPosition[];
  onPositionClick: (position: VacantPosition) => void;
}

export const VacantPositionsSidebar: React.FC<VacantPositionsSidebarProps> = ({ 
  isOpen, 
  onClose, 
  positions,
  onPositionClick 
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-lg font-bold">
                Postes Vacants
              </h2>
              <p className="text-sm text-muted-foreground">
                {positions.length} poste{positions.length > 1 ? 's' : ''} disponible{positions.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {positions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun poste vacant pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((position, index) => (
                <div
                  key={position.id}
                  onClick={() => position.externalLink ? window.open(position.externalLink, '_blank') : onPositionClick(position)}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <UserPlus className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{position.title}</h3>
                        {position.externalLink && (
                          <ExternalLink className="w-3 h-3 text-primary/70" />
                        )}
                      </div>
                      {position.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {position.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {position.sectionTitle}
                        </Badge>
                        {position.externalLink && (
                          <Badge variant="secondary" className="text-xs">
                            Postuler en ligne
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};