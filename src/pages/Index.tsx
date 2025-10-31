import { useState } from 'react';
import { Organigramme } from '../components/Organigramme';
import { MembersGrid } from '../components/MembersGrid';
import { Navbar } from '../components/Navbar';
import { useOrganigramme } from '../hooks/useOrganigramme';
import { Button } from '../components/ui/button';
import { LayoutGrid, Network } from 'lucide-react';

const Index = () => {
  const [viewMode, setViewMode] = useState<'organigramme' | 'grid'>('organigramme');
  const { data, loading } = useOrganigramme(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Toggle entre les vues */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={viewMode === 'organigramme' ? 'default' : 'outline'}
            onClick={() => setViewMode('organigramme')}
            className="gap-2"
          >
            <Network className="w-4 h-4" />
            Organigramme
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Vue membres
          </Button>
        </div>

        {/* Contenu selon la vue */}
        {viewMode === 'organigramme' ? (
          <Organigramme isAdminMode={false} />
        ) : (
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Chargement...
              </div>
            ) : (
              <MembersGrid 
                sections={data.sections} 
                people={data.people}
                isAdmin={false}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
