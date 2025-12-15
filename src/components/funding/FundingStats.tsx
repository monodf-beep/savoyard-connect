import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Users, Trophy } from 'lucide-react';

interface FundingStatsProps {
  stats: {
    totalCollected: number;
    totalGoal: number;
    totalSupporters: number;
    fundedProjectsCount: number;
    totalProjects: number;
  };
}

export const FundingStats = ({ stats }: FundingStatsProps) => {
  const statsItems = [
    {
      title: 'Total Collecté',
      value: `${stats.totalCollected.toLocaleString('fr-FR')}€`,
      icon: TrendingUp,
      description: 'Tous projets confondus',
      color: 'text-green-600',
    },
    {
      title: 'Objectif Global',
      value: `${stats.totalGoal.toLocaleString('fr-FR')}€`,
      icon: Target,
      description: `${Math.round((stats.totalCollected / Math.max(stats.totalGoal, 1)) * 100)}% atteint`,
      color: 'text-primary',
    },
    {
      title: 'Soutiens',
      value: stats.totalSupporters.toString(),
      icon: Users,
      description: 'Donateurs uniques',
      color: 'text-blue-600',
    },
    {
      title: 'Projets Financés',
      value: `${stats.fundedProjectsCount}/${stats.totalProjects}`,
      icon: Trophy,
      description: 'Objectifs atteints',
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsItems.map((item) => (
        <Card key={item.title} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.color}`}>
              {item.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
