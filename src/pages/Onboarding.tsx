import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Onboarding = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    document.title = 'Compléter mon profil | Institut';
  }, []);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrorMessage('Lien invalide ou manquant.');
        setValidating(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('invites')
          .select('status, expires_at')
          .eq('token', token)
          .single();

        if (error || !data) {
          setErrorMessage('Ce lien d\'invitation n\'est pas valide.');
          setValidating(false);
          return;
        }

        if (data.status !== 'pending') {
          setErrorMessage('Ce lien d\'invitation a déjà été utilisé.');
          setValidating(false);
          return;
        }

        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
          setErrorMessage('Ce lien d\'invitation a expiré.');
          setValidating(false);
          return;
        }

        setIsValid(true);
      } catch (err) {
        setErrorMessage('Erreur lors de la validation du lien.');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Compléter mon profil</h1>
      {validating ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p>Vérification du lien...</p>
        </div>
      ) : errorMessage ? (
        <p className="text-destructive">{errorMessage}</p>
      ) : isValid ? (
        <p className="text-muted-foreground mb-4">
          Merci d'avoir accepté l'invitation. Ce formulaire sera bientôt disponible pour compléter vos informations.
        </p>
      ) : null}
    </main>
  );
};

export default Onboarding;
