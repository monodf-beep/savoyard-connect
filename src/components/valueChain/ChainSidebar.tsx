import React from 'react';
import { ValueChain } from '@/types/valueChain';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  GitBranch,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChainSidebarProps {
  chains: ValueChain[];
  selectedChain: ValueChain | null;
  onSelectChain: (chain: ValueChain) => void;
  onCreateChain?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAdmin?: boolean;
}

export const ChainSidebar: React.FC<ChainSidebarProps> = ({
  chains,
  selectedChain,
  onSelectChain,
  onCreateChain,
  searchQuery,
  onSearchChange,
  isAdmin,
}) => {
  const filteredChains = chains.filter(chain =>
    chain.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chain.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Workflows</h2>
          </div>
          {isAdmin && onCreateChain && (
            <Button size="sm" variant="ghost" onClick={onCreateChain} className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/50">
        {filteredChains.length} résultat{filteredChains.length !== 1 ? 's' : ''}
      </div>

      {/* Chains List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredChains.map((chain) => (
            <button
              key={chain.id}
              onClick={() => onSelectChain(chain)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-200 group",
                selectedChain?.id === chain.id
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-muted/50 border border-transparent"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className={cn(
                      "h-4 w-4 flex-shrink-0",
                      selectedChain?.id === chain.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium text-sm truncate",
                      selectedChain?.id === chain.id ? "text-primary" : "text-foreground"
                    )}>
                      {chain.title}
                    </span>
                  </div>
                  {chain.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 ml-6">
                      {chain.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 ml-6">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {chain.segments?.length || 0} étapes
                    </Badge>
                    {chain.approval_status === 'pending' && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-500/50 text-orange-600">
                        En attente
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 flex-shrink-0 transition-transform",
                  selectedChain?.id === chain.id ? "text-primary" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                )} />
              </div>
            </button>
          ))}

          {filteredChains.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucune chaîne trouvée</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Create Button */}
      {isAdmin && onCreateChain && (
        <div className="p-3 border-t border-border">
          <Button onClick={onCreateChain} className="w-full" variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle chaîne
          </Button>
        </div>
      )}
    </div>
  );
};
