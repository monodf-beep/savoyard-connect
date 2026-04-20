import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Organigramme } from '@/components/Organigramme';

interface AssoLite {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  primary_color?: string | null;
}

const PublicOrganigramme = () => {
  const { id } = useParams<{ id: string }>();
  const [asso, setAsso] = useState<AssoLite | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('associations')
        .select('id, name, logo_url, description, is_public')
        .eq('id', id)
        .maybeSingle();
      if (error || !data || !data.is_public) {
        setNotFound(true);
        return;
      }
      setAsso(data as AssoLite);
    })();
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Organigramme introuvable</h1>
          <p className="text-muted-foreground">Cette association n'existe pas ou n'est pas publique.</p>
        </div>
      </div>
    );
  }

  if (!asso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          {asso.logo_url && (
            <img
              src={asso.logo_url}
              alt={`Logo ${asso.name}`}
              className="h-10 w-10 rounded object-contain"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold truncate">{asso.name}</h1>
            <p className="text-xs text-muted-foreground">Organigramme — vue publique</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <Organigramme publicMode />
      </main>

      <footer className="border-t mt-8 py-4 text-center text-xs text-muted-foreground">
        Vue publique en lecture seule
      </footer>
    </div>
  );
};

export default PublicOrganigramme;
