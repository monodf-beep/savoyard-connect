import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProblemCardProps {
  icon: string;
  title: string;
  description: string;
}

export const ProblemCard = ({ icon, title, description }: ProblemCardProps) => {
  return (
    <Card className="group bg-white border border-border/50 hover:border-[#0066FF]/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-2">
        <div className="text-4xl mb-4">{icon}</div>
        <CardTitle className="text-xl font-bold text-foreground group-hover:text-[#0066FF] transition-colors">
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
