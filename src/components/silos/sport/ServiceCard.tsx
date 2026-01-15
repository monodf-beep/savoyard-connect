import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  example: string;
  link: string;
}

export const ServiceCard = ({ icon, title, description, example, link }: ServiceCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="group bg-white border border-border/50 hover:border-[#00D084]/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">{icon}</div>
          <CardTitle className="text-xl font-bold text-foreground group-hover:text-[#00D084] transition-colors">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {description}
        </p>
        
        <div className="bg-muted/50 rounded-lg p-3 mb-4 border border-border/30">
          <p className="text-sm text-muted-foreground italic">
            {example}
          </p>
        </div>

        <div className="mt-auto">
          <Button
            variant="ghost"
            className="text-[#00D084] hover:text-[#00D084]/80 hover:bg-[#00D084]/10 p-0 h-auto font-semibold group/btn"
            onClick={() => navigate(link)}
          >
            En savoir plus
            <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
