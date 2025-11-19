import { Organigramme } from '../components/Organigramme';
import { Navbar } from '../components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Organigramme isAdminMode={false} />
    </div>
  );
};

export default Index;
