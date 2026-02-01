import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PublicNavbar } from '@/components/PublicNavbar';
import { ExpertCard } from '@/components/experts/ExpertCard';
import { ExpertModal } from '@/components/experts/ExpertModal';
import { PublicFooter } from '@/components/PublicFooter';
import { expertsData } from '@/data/expertsData';
import { Expert } from '@/types/experts';
import { useAuth } from '@/hooks/useAuth';

const Experts = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewProfile = (expert: Expert) => {
    setSelectedExpert(expert);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Unified Navbar */}
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-[#1e3a8a]/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-[#065f46]/10 text-[#065f46] hover:bg-[#065f46]/20">
            {t('experts.hero.badge')}
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('experts.hero.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('experts.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">{t('nav.home')}</Link>
          <span className="mx-2">›</span>
          <span className="text-foreground">{t('experts.navTitle')}</span>
        </nav>
      </div>

      {/* Experts Grid */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertsData.map((expert) => (
              <ExpertCard 
                key={expert.id} 
                expert={expert} 
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section for non-logged users */}
      {!user && (
        <section className="py-16 bg-gradient-to-r from-[#1e3a8a] to-[#065f46]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t('experts.cta.title')}
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              {t('experts.cta.subtitle')}
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/signup')}
              className="bg-white text-[#1e3a8a] hover:bg-white/90 font-semibold"
            >
              {t('experts.cta.button')}
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <PublicFooter />

      {/* Expert Modal */}
      <ExpertModal 
        expert={selectedExpert}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Experts;
