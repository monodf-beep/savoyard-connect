import { Organigramme } from '../components/Organigramme';
import { Navbar } from '../components/Navbar';
import { AIAssistant } from '../components/AIAssistant';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { isAdmin } = useAuth();
  
  const handleAddPerson = () => {
    const event = new CustomEvent('openPersonForm');
    window.dispatchEvent(event);
  };

  const handleAddSection = () => {
    const event = new CustomEvent('openSectionForm');
    window.dispatchEvent(event);
  };

  const handleAddVacantPosition = () => {
    const event = new CustomEvent('openVacantPositionForm');
    window.dispatchEvent(event);
  };

  const handleImport = () => {
    const event = new CustomEvent('openImportDialog');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onAddPerson={handleAddPerson}
        onAddSection={handleAddSection}
        onAddVacantPosition={handleAddVacantPosition}
        onImport={handleImport}
      />
      <Organigramme isAdminMode={false} />
      {isAdmin && <AIAssistant />}
    </div>
  );
};

export default Index;
