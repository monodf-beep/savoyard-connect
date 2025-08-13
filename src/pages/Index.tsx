import { Organigramme } from '../components/Organigramme';
import { organigrammeData } from '../data/organigrammeData';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Organigramme 
        data={organigrammeData} 
        isAdminMode={false}
        onDataChange={(newData) => {
          // Ici vous pourriez sauvegarder les données via API WordPress
          console.log('Données mises à jour:', newData);
        }}
      />
    </div>
  );
};

export default Index;
