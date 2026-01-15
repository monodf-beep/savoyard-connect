import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mountain, Users, Globe, Euro } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const HeroSport = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { icon: Users, label: t('siloSport.hero.stats.clubs'), value: '150+' },
    { icon: Globe, label: t('siloSport.hero.stats.countries'), value: '4' },
    { icon: Euro, label: t('siloSport.hero.stats.savings'), value: '50k€' },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF] via-[#0066FF]/90 to-[#00D084]" />
      
      {/* Mountain illustration with parallax */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <svg
          viewBox="0 0 1440 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Abstract mountain shapes */}
          <path
            d="M0,600 L200,300 L400,450 L600,200 L800,350 L1000,150 L1200,300 L1440,100 L1440,600 Z"
            fill="white"
            opacity="0.3"
          />
          <path
            d="M0,600 L300,350 L500,500 L700,280 L900,420 L1100,220 L1300,380 L1440,200 L1440,600 Z"
            fill="white"
            opacity="0.2"
          />
          <path
            d="M0,600 L150,450 L350,550 L550,380 L750,480 L950,300 L1150,450 L1350,280 L1440,350 L1440,600 Z"
            fill="white"
            opacity="0.15"
          />
          {/* Snow caps */}
          <circle cx="600" cy="200" r="20" fill="white" opacity="0.4" />
          <circle cx="1000" cy="150" r="25" fill="white" opacity="0.4" />
          <circle cx="200" cy="300" r="15" fill="white" opacity="0.4" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
          {t('siloSport.hero.title')}
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
          {t('siloSport.hero.subtitle')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-white text-[#0066FF] hover:bg-white/90 font-semibold text-lg px-8 py-6 min-h-[56px]"
          >
            {t('siloSport.hero.cta.join')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToServices}
            className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 min-h-[56px]"
          >
            {t('siloSport.hero.cta.discover')}
          </Button>
        </div>

        {/* Stats badges */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <Badge
              key={index}
              className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm md:text-base hover:bg-white/30 transition-colors"
            >
              <stat.icon className="w-4 h-4 mr-2" />
              <span className="font-bold mr-1">{stat.value}</span>
              {stat.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/70 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
