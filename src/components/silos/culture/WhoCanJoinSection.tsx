import { useTranslation } from 'react-i18next';
import { 
  Music, 
  BookOpen, 
  Film, 
  Theater, 
  Palette, 
  Building2, 
  Mic2, 
  Library,
  Sparkles,
  Users
} from 'lucide-react';

const categories = [
  { icon: Music, key: 'festivals' },
  { icon: BookOpen, key: 'literary' },
  { icon: Mic2, key: 'music' },
  { icon: Film, key: 'cinema' },
  { icon: Theater, key: 'theater' },
  { icon: Palette, key: 'galleries' },
  { icon: Building2, key: 'museums' },
  { icon: Sparkles, key: 'urbanCulture' },
  { icon: Library, key: 'libraries' },
  { icon: Users, key: 'other' },
];

export const WhoCanJoinSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
          {t('siloCulture.whoCanJoin.title')}
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          {t('siloCulture.whoCanJoin.subtitle')}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group flex flex-col items-center p-4 md:p-6 bg-white rounded-xl border border-border/50 hover:border-[#d97706]/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#1e3a8a]/10 to-[#d97706]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <category.icon className="w-6 h-6 md:w-7 md:h-7 text-[#1e3a8a]" />
              </div>
              <p className="text-sm md:text-base font-medium text-foreground text-center leading-tight">
                {t(`siloCulture.whoCanJoin.categories.${category.key}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
