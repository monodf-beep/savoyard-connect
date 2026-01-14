import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Calendar, MapPin, Euro, FileDown, TrendingUp } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAssociation } from '@/hooks/useAssociation';

interface Opportunity {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  deadline?: string;
  region?: string;
  category?: string;
  application_url?: string;
  source?: string;
}

export const OpportunitiesTable = () => {
  const { currentAssociation } = useAssociation();
  
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_active', true)
        .order('deadline', { ascending: true });
      if (error) throw error;
      return data as Opportunity[];
    },
  });

  const generatePDF = (opportunity: Opportunity) => {
    // Generate pre-filled PDF (simplified version)
    const content = `
CANDIDATURE - ${opportunity.title}

Association: ${currentAssociation?.name || 'Votre Association'}
Date: ${format(new Date(), 'PPP', { locale: fr })}

OBJET: Demande de subvention "${opportunity.title}"

Madame, Monsieur,

L'association ${currentAssociation?.name || '[Nom de l\'association]'} a l'honneur de solliciter 
votre soutien dans le cadre de l'appel à projets "${opportunity.title}".

Montant demandé: ${opportunity.amount ? opportunity.amount.toLocaleString('fr-FR') + ' €' : 'À préciser'}

[Complétez avec la description de votre projet]

Dans l'attente de votre réponse, nous vous prions d'agréer, Madame, Monsieur, 
l'expression de nos salutations distinguées.

---
Document généré automatiquement - associacion.eu
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidature-${opportunity.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Appels à projets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Appels à projets & Subventions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {opportunities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun appel à projets disponible pour le moment
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date limite</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map(opp => {
                  const daysLeft = opp.deadline ? differenceInDays(new Date(opp.deadline), new Date()) : null;
                  return (
                    <TableRow key={opp.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{opp.title}</div>
                          {opp.category && (
                            <Badge variant="outline" className="mt-1 text-xs">{opp.category}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {opp.amount ? (
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold">{opp.amount.toLocaleString('fr-FR')} €</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Variable</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {opp.deadline ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{format(new Date(opp.deadline), 'dd MMM yyyy', { locale: fr })}</span>
                            {daysLeft !== null && (
                              <Badge variant={daysLeft < 14 ? 'destructive' : daysLeft < 30 ? 'default' : 'secondary'} className="text-xs">
                                {daysLeft < 0 ? 'Expiré' : `${daysLeft}j`}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {opp.region ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{opp.region}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">National</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{opp.source || '-'}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePDF(opp)}
                          >
                            <FileDown className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                          {opp.application_url && (
                            <Button
                              size="sm"
                              onClick={() => window.open(opp.application_url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Candidater
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
