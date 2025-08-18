import { Organigramme } from '../components/Organigramme';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Organigramme 
        isAdminMode={false}
      />
    </div>
  );
};

export default Index;
