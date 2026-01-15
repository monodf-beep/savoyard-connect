import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CTABanner = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0066FF] to-[#00D084]" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full" />
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-white rotate-45" />
        <div className="absolute bottom-10 left-1/4 w-16 h-16 border-2 border-white" />
        <div className="absolute bottom-20 right-1/3 w-24 h-24 border-2 border-white rounded-full" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          {t('siloSport.cta.title')}
        </h2>

        <Button
          size="lg"
          onClick={() => navigate('/signup')}
          className="bg-white text-[#0066FF] hover:bg-white/90 font-bold text-lg px-10 py-6 min-h-[56px] mb-4 group"
        >
          {t('siloSport.cta.button')}
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <p className="text-white/80 text-sm">
          {t('siloSport.cta.subtext')}
        </p>
      </div>
    </section>
  );
};
