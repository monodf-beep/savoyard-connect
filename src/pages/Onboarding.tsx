import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const Onboarding = () => {
  const [params] = useSearchParams();
  const token = params.get('token');

  useEffect(() => {
    document.title = 'Compléter mon profil | Institut';
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Compléter mon profil</h1>
      {!token ? (
        <p className="text-muted-foreground">Lien invalide ou manquant.</p>
      ) : (
        <>
          <p className="text-muted-foreground mb-4">
            Merci d'avoir accepté l'invitation. Ce formulaire sera bientôt disponible pour compléter vos informations.
          </p>
          <p className="text-sm">Token reçu: <code className="px-2 py-1 bg-muted rounded">{token}</code></p>
        </>
      )}
    </main>
  );
};

export default Onboarding;
