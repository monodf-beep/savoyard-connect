import { Navbar } from '@/components/Navbar';
import { OrganizationSettings } from '@/components/OrganizationSettings';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Settings = () => {
  const { isAdmin } = useAuth();

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
