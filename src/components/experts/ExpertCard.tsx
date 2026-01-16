import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Laptop, Scale, Palette, Euro, Languages, ArrowRight } from 'lucide-react';
import { Expert } from '@/types/experts';

interface ExpertCardProps {
  expert: Expert;
  onViewProfile: (expert: Expert) => void;
}

const iconMap = {
  laptop: { icon: Laptop, color: 'text-blue-600 bg-blue-100' },
  scale: { icon: Scale, color: 'text-rose-700 bg-rose-100' },
  palette: { icon: Palette, color: 'text-violet-600 bg-violet-100' },
  euro: { icon: Euro, color: 'text-emerald-600 bg-emerald-100' },
  languages: { icon: Languages, color: 'text-orange-600 bg-orange-100' },
};

export const ExpertCard = ({ expert, onViewProfile }: ExpertCardProps) => {
  const { t } = useTranslation();
  const initials = expert.name.split(' ').map(n => n[0]).join('');
  const IconConfig = iconMap[expert.iconType];
  const IconComponent = IconConfig.icon;

  return (
    <Card className="group bg-white border border-border/50 hover:border-[#1e3a8a]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-[#1e3a8a]/20">
            <AvatarImage src={expert.avatarUrl} alt={expert.name} />
            <AvatarFallback className="bg-gradient-to-br from-[#1e3a8a] to-[#065f46] text-white font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground group-hover:text-[#1e3a8a] transition-colors truncate">
              {expert.name}
            </h3>
            <p className="text-sm text-muted-foreground">{expert.role}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1 pt-0">
        {/* Expertises with icon */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-lg ${IconConfig.color} flex-shrink-0`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {expert.mainExpertises.map((expertise, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs font-medium bg-muted/70"
              >
                {expertise}
              </Badge>
            ))}
          </div>
        </div>

        {/* Member discount badge */}
        <div className="mb-4">
          <Badge className="bg-[#065f46]/10 text-[#065f46] hover:bg-[#065f46]/20 text-xs">
            {t('experts.memberDiscount', { discount: expert.discount })}
          </Badge>
        </div>

        {/* CTA Button */}
        <div className="mt-auto">
          <Button 
            onClick={() => onViewProfile(expert)}
            className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white group/btn"
          >
            {t('experts.viewProfile')}
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
