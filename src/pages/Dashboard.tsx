import { useAuth } from '@/hooks/useAuth';
import { useAssociation } from '@/hooks/useAssociation';
import { HubDashboardLayout } from '@/components/hub/HubDashboardLayout';

const Dashboard = () => {
  const { loading: authLoading } = useAuth();
  const { currentAssociation, isLoading: assocLoading } = useAssociation();

  const loading = authLoading || assocLoading;

  return (
    <HubDashboardLayout
      loading={loading}
      orgName={currentAssociation?.name || "Mon Association"}
      orgLogo={currentAssociation?.logo_url || undefined}
      isLabeled={false}
    />
  );
};

export default Dashboard;
