import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Palette, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export const HeroCulture = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBenefits = () => {
    document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { icon: Users, label: t('siloCulture.hero.stats.associations'), value: '200+' },
    { icon: Palette, label: t('siloCulture.hero.stats.disciplines'), value: '15+' },
    { icon: Heart, label: t('siloCulture.hero.stats.projects'), value: '50+' },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient - Culture palette */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#1e3a8a]/90 to-[#d97706]" />
      
      {/* Abstract art shapes with parallax */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <svg
          viewBox="0 0 1440 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Abstract artistic shapes - waves and curves */}
          <path
            d="M0,400 Q200,300 400,350 T800,300 T1200,350 T1440,300 L1440,600 L0,600 Z"
            fill="white"
            opacity="0.3"
          />
          <path
            d="M0,450 Q300,380 600,420 T1200,380 L1440,400 L1440,600 L0,600 Z"
            fill="white"
            opacity="0.2"
          />
          <ellipse cx="200" cy="200" rx="80" ry="80" fill="white" opacity="0.1" />
          <ellipse cx="1200" cy="150" rx="100" ry="60" fill="white" opacity="0.1" />
          <rect x="600" y="100" width="60" height="60" fill="white" opacity="0.15" transform="rotate(45 630 130)" />
          <polygon points="900,250 950,150 1000,250" fill="white" opacity="0.1" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
          {t('siloCulture.hero.title')}
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
          {t('siloCulture.hero.subtitle')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="bg-[#d97706] text-white hover:bg-[#d97706]/90 font-semibold text-lg px-8 py-6 min-h-[56px]"
          >
            {t('siloCulture.hero.cta.join')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToBenefits}
            className="border-2 border-white text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 min-h-[56px]"
          >
            {t('siloCulture.hero.cta.discover')}
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
