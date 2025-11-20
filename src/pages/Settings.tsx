import { Navbar } from '@/components/Navbar';
import { OrganizationSettings } from '@/components/OrganizationSettings';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import adminHero from '@/assets/admin-dashboard-hero.jpg';

const Settings = () => {
  const { isAdmin, loading } = useAuth();

  // Show nothing while loading to prevent flash of redirect
  if (loading) {
    return null;
  }

  // Only admins can access settings
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/20">
        <img 
          src={adminHero} 
          alt="Tableau de bord admin" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Tableau de bord admin</h1>
          <p className="text-lg text-muted-foreground">Accédez à tous les outils de gestion en un seul endroit</p>
        </div>
      </div>
      <OrganizationSettings />
    </div>
  );
};

export default Settings;
