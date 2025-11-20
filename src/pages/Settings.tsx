import { Navbar } from '@/components/Navbar';
import { OrganizationSettings } from '@/components/OrganizationSettings';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

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
      <OrganizationSettings />
    </div>
  );
};

export default Settings;
