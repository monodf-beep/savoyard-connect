import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
  club: string;
  quote: string;
  metric: string;
  avatarUrl?: string;
}

export const TestimonialCard = ({ club, quote, metric, avatarUrl }: TestimonialCardProps) => {
  const initials = club.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card className="bg-white border border-border/50 shadow-lg">
      <CardContent className="p-6 md:p-8">
        <Quote className="w-10 h-10 text-[#0066FF]/20 mb-4" />
        
        <blockquote className="text-lg md:text-xl text-foreground mb-6 italic leading-relaxed">
          "{quote}"
        </blockquote>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-[#00D084]">
              <AvatarImage src={avatarUrl} alt={club} />
              <AvatarFallback className="bg-gradient-to-br from-[#0066FF] to-[#00D084] text-white font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-foreground">{club}</p>
            </div>
          </div>

          <Badge className="bg-[#00D084] text-white hover:bg-[#00D084]/90 px-3 py-1">
            {metric}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
