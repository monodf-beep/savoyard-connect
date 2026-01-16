import { useTranslation } from 'react-i18next';
import { HubPageLayout } from '@/components/hub/HubPageLayout';
import { OrganizationSettings } from '@/components/OrganizationSettings';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Settings = () => {
  const { t } = useTranslation();
  const { isAdmin, loading } = useAuth();

  // Show nothing while loading to prevent flash of redirect
  if (loading) {
    return null;
  }

  // Only admins can access settings
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <HubPageLayout
      title={t('nav.settings')}
      subtitle="Personnalisez votre association"
    >
      <OrganizationSettings />
    </HubPageLayout>
  );
};

export default Settings;
