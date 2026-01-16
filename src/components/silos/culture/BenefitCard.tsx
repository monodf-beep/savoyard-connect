import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const BenefitCard = ({ icon: Icon, title, description }: BenefitCardProps) => {
  return (
    <Card className="group bg-white border border-border/50 hover:border-[#d97706]/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-2">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#d97706] flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <CardTitle className="text-xl font-bold text-foreground group-hover:text-[#1e3a8a] transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
