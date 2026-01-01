import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Check, Trophy, MapPin, Settings, ExternalLink, Target, Flag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ContributorSettingsDialog from '@/components/contributors/ContributorSettingsDialog';
import MembersMap from '@/components/contributors/MembersMap';

interface HelloAssoMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  membership_date: string | null;
  membership_type: string | null;
  is_hidden: boolean;
}

interface HelloAssoDonor {
  id: string;
  first_name: string | null;
  last_name: string | null;
  total_donated: number;
  donation_count: number;
  is_hidden: boolean;
  city?: string | null;
}

interface Learner {
  id: string;
  first_name: string;
  last_name: string;
  adresse?: string | null;
  formation?: string | null;
}

interface Milestone {
  id: string;
  title: string;
  target: number;
  description: string;
  display_order: number;
}

interface MembershipOption {
  id: string;
  title: string;
  price: number;
  benefits: string[];
  helloasso_link: string | null;
  is_featured: boolean;
}

export default function Contributors() {
  const { isAdmin } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>('all');

  // Fetch milestones from database
  const { data: milestones = [] } = useQuery({
    queryKey: ['community-milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_milestones')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as Milestone[];
    },
  });

  // Fetch membership options
  const { data: membershipOptions = [] } = useQuery({
    queryKey: ['membership-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_options')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as MembershipOption[];
    },
  });

  // Fetch community settings
  const { data: communitySettings } = useQuery({
    queryKey: ['community-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_settings')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Fetch Mapbox token from edge function
  const { data: mapboxData } = useQuery({
    queryKey: ['mapbox-token'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      return data;
    },
  });

  // Fetch HelloAsso members
  const { data: helloassoMembers = [] } = useQuery({
    queryKey: ['helloasso-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helloasso_members')
        .select('*')
        .order('membership_date', { ascending: false });
      if (error) throw error;
      return data as HelloAssoMember[];
    },
  });

  // Fetch HelloAsso donors
  const { data: helloassoDonors = [] } = useQuery({
    queryKey: ['helloasso-donors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helloasso_donors')
        .select('*')
        .order('total_donated', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as HelloAssoDonor[];
    },
  });

  // Fetch learners (people with formation)
  const { data: learners = [] } = useQuery({
    queryKey: ['learners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('id, first_name, last_name, adresse, formation')
        .not('formation', 'is', null);
      if (error) throw error;
      return data as Learner[];
    },
  });

  // Get settings values
  const memberSettings = communitySettings?.find(s => s.key === 'current_members');
  const settingsValue = memberSettings?.value as { count?: number; manual_addition?: number } | null;
  const helloassoCount = settingsValue?.count || helloassoMembers.length;
  const manualAddition = settingsValue?.manual_addition || 0;
  const mapboxToken = mapboxData?.token || '';

  const memberCount = helloassoCount + manualAddition;
  const maxMilestone = milestones.length > 0 ? milestones[milestones.length - 1].target : 100;
  const progressPercent = Math.min((memberCount / maxMilestone) * 100, 100);

  // Filter members by year
  const years = [...new Set(helloassoMembers.map(m => m.membership_date ? new Date(m.membership_date).getFullYear() : null).filter(Boolean))].sort((a, b) => (b || 0) - (a || 0));
  
  const filteredMembers = yearFilter === 'all' 
    ? helloassoMembers.filter(m => !m.is_hidden)
    : helloassoMembers.filter(m => !m.is_hidden && m.membership_date && new Date(m.membership_date).getFullYear().toString() === yearFilter);

  // Get visible donors
  const visibleDonors = helloassoDonors.filter(d => !d.is_hidden);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Tableau de Bord Communautaire
              </h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                Suivez la croissance de notre communauté
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
          )}
        </div>

        {/* Force Collective - Progress */}
        <Card className="border-border overflow-hidden">
          <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Notre Force Collective
              </CardTitle>
              <Badge variant="secondary" className="text-sm font-bold">
                {memberCount} membres
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            {/* Progress bar */}
            <div className="relative mb-6">
              <Progress value={progressPercent} className="h-3" />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background shadow-lg"
                style={{ left: `calc(${progressPercent}% - 8px)` }}
              />
            </div>
            
            {/* Milestones as horizontal list */}
            {milestones.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {milestones.map((milestone, index) => {
                  const isReached = memberCount >= milestone.target;
                  const isLast = index === milestones.length - 1;
                  
                  return (
                    <div 
                      key={milestone.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isReached 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-muted/30 border-border'
                      } ${isLast ? 'ring-2 ring-amber-400/50' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {isLast ? (
                          <Flag className="w-4 h-4 text-amber-500" />
                        ) : isReached ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Target className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className={`text-lg font-bold ${isReached ? 'text-primary' : 'text-muted-foreground'}`}>
                          {milestone.target}
                        </span>
                      </div>
                      <p className={`text-xs font-medium ${isReached ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notre Communauté */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Notre Communauté
                </CardTitle>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="Année" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredMembers.length > 0 ? (
                <>
                  <div className="grid grid-cols-5 gap-2">
                    {filteredMembers.slice(0, 15).map((member) => {
                      const year = member.membership_date ? new Date(member.membership_date).getFullYear() : null;
                      
                      return (
                        <div key={member.id} className="flex flex-col items-center text-center">
                          <Avatar className="w-10 h-10 border-2 border-border">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                              {member.first_name?.[0]}{member.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] font-medium text-foreground mt-1 truncate w-full">
                            {member.first_name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {filteredMembers.length > 15 && (
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      +{filteredMembers.length - 15} autres membres
                    </p>
                  )}
                  {manualAddition > 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      +{manualAddition} membres (hors ligne)
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Synchronisez HelloAsso pour voir les membres
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Devenir Membre */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Devenir Membre
              </CardTitle>
            </CardHeader>
            <CardContent>
              {membershipOptions.length > 0 ? (
                <div className="space-y-3">
                  {membershipOptions.slice(0, 3).map((option) => (
                    <div 
                      key={option.id}
                      className={`rounded-lg border p-3 relative ${
                        option.is_featured 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      {option.is_featured && (
                        <Badge className="absolute -top-2 right-2 text-[10px] bg-primary text-primary-foreground">
                          Populaire
                        </Badge>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">{option.title}</span>
                        <span className="text-lg font-bold text-primary">{option.price}€</span>
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                        {option.benefits.slice(0, 2).map((benefit, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      {option.helloasso_link ? (
                        <Button 
                          size="sm" 
                          variant={option.is_featured ? 'default' : 'outline'}
                          className="w-full text-xs h-8"
                          asChild
                        >
                          <a href={option.helloasso_link} target="_blank" rel="noopener noreferrer">
                            Rejoindre <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full text-xs h-8"
                          disabled
                        >
                          Bientôt disponible
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Check className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Configurez les options d'adhésion
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Classements */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Top Donateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visibleDonors.length > 0 ? (
                <div className="space-y-2">
                  {visibleDonors.slice(0, 5).map((donor, index) => (
                    <div key={donor.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-amber-400 text-amber-950' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </span>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {donor.first_name?.[0]}{donor.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {donor.first_name} {donor.last_name?.[0]}.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {donor.donation_count} don{donor.donation_count > 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary">{donor.total_donated}€</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Synchronisez HelloAsso pour voir les donateurs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Members Map */}
        <MembersMap 
          members={helloassoMembers.filter(m => !m.is_hidden)} 
          donors={helloassoDonors.filter(d => !d.is_hidden)}
          learners={learners}
          mapboxToken={mapboxToken} 
        />

        {/* Settings Dialog */}
        <ContributorSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
        </div>
      </div>
    </div>
  );
}
