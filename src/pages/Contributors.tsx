import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Check, Trophy, MapPin, Settings, ExternalLink, EyeOff } from 'lucide-react';
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

  // Get settings values
  const memberSettings = communitySettings?.find(s => s.key === 'current_members');
  const mapboxSettings = communitySettings?.find(s => s.key === 'mapbox_token');
  const settingsValue = memberSettings?.value as { count?: number; manual_addition?: number } | null;
  const helloassoCount = settingsValue?.count || helloassoMembers.length;
  const manualAddition = settingsValue?.manual_addition || 0;
  const mapboxToken = typeof mapboxSettings?.value === 'string' ? mapboxSettings.value.replace(/"/g, '') : '';

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
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Tableau de Bord Communautaire
            </h1>
          </div>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
          )}
        </div>

        {/* Force Collective - Progress */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Notre Force Collective <span className="text-muted-foreground font-normal">({memberCount} membres)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Progress value={progressPercent} className="h-4 bg-muted" />
              
              {milestones.length > 0 && (
                <div className="relative mt-2">
                  <div className="flex justify-between items-start">
                    {milestones.map((milestone, index) => {
                      const position = (milestone.target / maxMilestone) * 100;
                      const isReached = memberCount >= milestone.target;
                      const isLast = index === milestones.length - 1;
                      
                      return (
                        <div 
                          key={milestone.id}
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
                            {milestone.target}
                          </span>
                          <span className={`text-[10px] font-medium ${isReached ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {milestone.title}
                          </span>
                          <span className="text-[9px] text-muted-foreground hidden md:block max-w-[70px]">
                            {milestone.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="h-16 md:h-24" />
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notre Communauté */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Notre Communauté</CardTitle>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
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
                  <div className="grid grid-cols-5 gap-3">
                    {filteredMembers.slice(0, 20).map((member) => {
                      const year = member.membership_date ? new Date(member.membership_date).getFullYear() : null;
                      
                      return (
                        <div key={member.id} className="flex flex-col items-center text-center relative group">
                          <Avatar className="w-10 h-10 md:w-12 md:h-12 border-2 border-border">
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {member.first_name?.[0]}{member.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] md:text-xs font-medium text-foreground mt-1 truncate w-full">
                            {member.first_name}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            ({year || '2024'})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {filteredMembers.length > 20 && (
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      +{filteredMembers.length - 20} autres membres
                    </p>
                  )}
                  {manualAddition > 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      +{manualAddition} membres (hors ligne)
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Synchronisez HelloAsso pour voir les membres
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
              <div className="flex gap-3 justify-center flex-wrap">
                {membershipOptions.map((option) => (
                  <div 
                    key={option.id}
                    className={`flex-1 min-w-[120px] max-w-[140px] rounded-lg border p-3 text-center relative ${
                      option.is_featured 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-border bg-background'
                    }`}
                  >
                    {option.is_featured && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-primary text-primary-foreground">
                        Meilleure offre
                      </Badge>
                    )}
                    <p className="text-2xl font-bold text-foreground mt-2">{option.price}€</p>
                    <p className="text-xs font-medium text-foreground mb-2">{option.title}</p>
                    <ul className="text-[9px] text-muted-foreground space-y-1 text-left mb-3">
                      {option.benefits.slice(0, 3).map((benefit, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    {option.helloasso_link ? (
                      <Button 
                        size="sm" 
                        variant={option.is_featured ? 'default' : 'outline'}
                        className="w-full text-xs h-7"
                        asChild
                      >
                        <a href={option.helloasso_link} target="_blank" rel="noopener noreferrer">
                          Rejoindre <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant={option.is_featured ? 'default' : 'outline'}
                        className="w-full text-xs h-7"
                        disabled
                      >
                        Rejoindre
                      </Button>
                    )}
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
                {visibleDonors.length > 0 ? (
                  visibleDonors.map((donor, index) => (
                    <div key={donor.id} className="flex items-center gap-2">
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
                          {donor.first_name?.[0]}{donor.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground flex-1 truncate">
                        {donor.first_name} {donor.last_name?.[0]}.
                      </span>
                      <span className="text-xs text-muted-foreground">({donor.total_donated}€)</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Synchronisez HelloAsso pour voir les donateurs
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Members Map */}
        <MembersMap 
          members={helloassoMembers.filter(m => !m.is_hidden)} 
          mapboxToken={mapboxToken} 
        />

        {/* Settings Dialog */}
        <ContributorSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </div>
  );
}
