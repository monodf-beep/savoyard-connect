import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { HubPageLayout } from '@/components/hub/HubPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Trophy } from 'lucide-react';

interface HelloAssoMember {
  id: string;
  first_name: string | null;
  last_name: string | null;
  membership_date: string | null;
  is_hidden: boolean | null;
}

interface HelloAssoDonor {
  id: string;
  first_name: string | null;
  last_name: string | null;
  total_donated: number | null;
  donation_count: number | null;
  is_hidden: boolean | null;
}

export default function Contributors() {
  const { t } = useTranslation();
  const [yearFilter, setYearFilter] = useState<string>('all');

  const { data: helloassoMembers = [], isLoading } = useQuery({
    queryKey: ['helloasso-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helloasso_members')
        .select('id, first_name, last_name, membership_date, is_hidden')
        .order('membership_date', { ascending: false });
      if (error) throw error;
      return data as HelloAssoMember[];
    },
  });

  const { data: helloassoDonors = [] } = useQuery({
    queryKey: ['helloasso-donors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('helloasso_donors')
        .select('id, first_name, last_name, total_donated, donation_count, is_hidden')
        .order('total_donated', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as HelloAssoDonor[];
    },
  });

  const visibleMembers = helloassoMembers.filter(m => !m.is_hidden);
  const years = [...new Set(
    visibleMembers.map(m => m.membership_date ? new Date(m.membership_date).getFullYear() : null).filter(Boolean)
  )].sort((a, b) => (b || 0) - (a || 0));

  const filteredMembers = yearFilter === 'all'
    ? visibleMembers
    : visibleMembers.filter(m => m.membership_date && new Date(m.membership_date).getFullYear().toString() === yearFilter);

  const visibleDonors = helloassoDonors.filter(d => !d.is_hidden);

  return (
    <HubPageLayout
      title={t('nav.contributors')}
      subtitle={`${filteredMembers.length} contributeurs${yearFilter !== 'all' ? ` en ${yearFilter}` : ''}`}
      loading={isLoading}
    >
      <div className="space-y-6">
        {/* Community Grid */}
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
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {filteredMembers.slice(0, 20).map((member) => (
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
                  ))}
                </div>
                {filteredMembers.length > 20 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    +{filteredMembers.length - 20} autres contributeurs
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Synchronisez HelloAsso depuis la page Membres pour voir les contributeurs
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Donors */}
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
                      <p className="text-sm font-medium truncate">
                        {donor.first_name} {donor.last_name?.[0]}.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {donor.donation_count} don{(donor.donation_count || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {donor.total_donated}€
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucun donateur visible
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HubPageLayout>
  );
}
