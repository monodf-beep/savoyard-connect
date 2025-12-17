import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Check, Trophy, MapPin } from 'lucide-react';

interface ContributorPerson {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  date_entree: string | null;
  created_at: string | null;
}

const MILESTONES = [
  { value: 19, label: 'Jalon test', description: 'oui oui' },
  { value: 50, label: 'Ancrage Local', description: 'Reconnaissance auprès des associations culturelles locales.' },
  { value: 100, label: 'Rayonnement Régional', description: 'Collaboration avec des festivals et MJC.' },
  { value: 500, label: 'Poids Académique', description: 'Dialogue avec le rectorat de Grenoble.' },
  { value: 1000, label: 'Influence Institutionnelle', description: 'Intégration dans des organismes consultatifs.' },
  { value: 2500, label: 'Reconnaissance Nationale', description: 'Lancement de campagnes d\'envergure.' },
];

const MEMBERSHIP_OPTIONS = [
  {
    title: 'Adhésion Individuelle',
    price: 15,
    features: ['Adhésion Local', 'Adhésion Individuelle', 'Jalon test : oui oui'],
    highlighted: false,
  },
  {
    title: 'Pack Famille',
    price: 40,
    features: ['17 memberships', 'Reconnaissance auprès des associations culturelles locales.', 'Rayonnement Régional', 'Poids Académique'],
    highlighted: true,
    badge: 'Meilleure offre',
  },
  {
    title: 'Carnet Ambassadeur',
    price: 150,
    features: ['10 memberships (al oui.)', '5 tickets bonus'],
    highlighted: false,
  },
];

export default function Contributors() {
  const { data: people = [] } = useQuery({
    queryKey: ['contributors-people'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_people_detailed');
      if (error) throw error;
      return (data || []) as ContributorPerson[];
    },
  });

  const { data: topDonors = [] } = useQuery({
    queryKey: ['top-donors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manual_funds')
        .select('donor_name, amount')
        .eq('is_public', true)
        .order('amount', { ascending: false })
        .limit(10);
      if (error) throw error;
      
      // Aggregate by donor name
      const aggregated = (data || []).reduce((acc, item) => {
        if (!item.donor_name) return acc;
        const existing = acc.find(d => d.name === item.donor_name);
        if (existing) {
          existing.total += Number(item.amount);
        } else {
          acc.push({ name: item.donor_name, total: Number(item.amount) });
        }
        return acc;
      }, [] as { name: string; total: number }[]);
      
      return aggregated.sort((a, b) => b.total - a.total).slice(0, 7);
    },
  });

  const memberCount = people.length;
  const maxMilestone = MILESTONES[MILESTONES.length - 1].value;
  const progressPercent = Math.min((memberCount / maxMilestone) * 100, 100);

  // Get current milestone
  const currentMilestone = MILESTONES.reduce((prev, curr) => 
    memberCount >= curr.value ? curr : prev
  , MILESTONES[0]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Tableau de Bord Communautaire
          </h1>
        </div>

        {/* Force Collective - Progress */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Notre Force Collective <span className="text-muted-foreground font-normal">({memberCount} membres)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="relative">
              <Progress value={progressPercent} className="h-4 bg-muted" />
              
              {/* Milestone markers */}
              <div className="relative mt-2">
                <div className="flex justify-between items-start">
                  {MILESTONES.map((milestone, index) => {
                    const position = (milestone.value / maxMilestone) * 100;
                    const isReached = memberCount >= milestone.value;
                    const isLast = index === MILESTONES.length - 1;
                    
                    return (
                      <div 
                        key={milestone.value}
                        className="flex flex-col items-center text-center"
                        style={{ 
                          position: 'absolute', 
                          left: `${position}%`,
                          transform: 'translateX(-50%)',
                          width: isLast ? '100px' : '80px'
                        }}
                      >
                        {isLast && (
                          <div className="mb-1">
                            <MapPin className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                          </div>
                        )}
                        <span className={`text-xs font-bold ${isReached ? 'text-primary' : 'text-muted-foreground'}`}>
                          {milestone.value}
                        </span>
                        <span className={`text-[10px] font-medium ${isReached ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {milestone.label}
                        </span>
                        <span className="text-[9px] text-muted-foreground hidden md:block max-w-[70px]">
                          {milestone.description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Spacer for milestone labels */}
            <div className="h-16 md:h-24" />
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notre Communauté */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Notre Communauté</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
              {people.slice(0, 20).map((person) => {
                  const year = person.date_entree 
                    ? new Date(person.date_entree).getFullYear() 
                    : new Date(person.created_at || '').getFullYear();
                  
                  return (
                    <div key={person.id} className="flex flex-col items-center text-center">
                      <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-border">
                        <AvatarImage src={person.avatar_url || ''} alt={person.first_name} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {person.first_name?.[0]}{person.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] md:text-xs font-medium text-foreground mt-1 truncate w-full">
                        {person.first_name}
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        ({year || '2024'})
                      </span>
                    </div>
                  );
                })}
              </div>
              {people.length > 20 && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  +{people.length - 20} autres membres
                </p>
              )}
            </CardContent>
          </Card>

          {/* Devenir Membre */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Devenir Membre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-center">
                {MEMBERSHIP_OPTIONS.map((option) => (
                  <div 
                    key={option.title}
                    className={`flex-1 max-w-[140px] rounded-lg border p-3 text-center relative ${
                      option.highlighted 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-border bg-background'
                    }`}
                  >
                    {option.badge && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-primary text-primary-foreground">
                        {option.badge}
                      </Badge>
                    )}
                    <p className="text-2xl font-bold text-foreground mt-2">{option.price}€</p>
                    <p className="text-xs font-medium text-foreground mb-2">{option.title}</p>
                    <ul className="text-[9px] text-muted-foreground space-y-1 text-left mb-3">
                      {option.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      size="sm" 
                      variant={option.highlighted ? 'default' : 'outline'}
                      className="w-full text-xs h-7"
                    >
                      Rejoindre
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Classements */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Classements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-medium text-muted-foreground mb-3">Top Donateurs</p>
              <div className="space-y-2">
                {topDonors.length > 0 ? (
                  topDonors.map((donor, index) => (
                    <div key={donor.name} className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-yellow-950' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-amber-600 text-amber-950' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                          {donor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground flex-1 truncate">{donor.name}</span>
                      <span className="text-xs text-muted-foreground">({donor.total})</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Aucun donateur pour le moment
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
