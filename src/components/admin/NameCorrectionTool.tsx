import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { nameCorrections, emailCorrections } from '@/scripts/correctNames';

interface PersonRecord {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

export const NameCorrectionTool = () => {
  const [people, setPeople] = useState<PersonRecord[]>([]);
  const [corrections, setCorrections] = useState<Array<{
    person: PersonRecord;
    correction: { firstName?: string; lastName?: string; email?: string; phone?: string };
    status: 'pending' | 'success' | 'error';
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('people')
        .select('id, first_name, last_name, email, phone')
        .order('last_name', { ascending: true });

      if (error) throw error;

      setPeople(data || []);
      analyzeCorrections(data || []);
    } catch (error) {
      console.error('Error loading people:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les personnes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCorrections = (peopleList: PersonRecord[]) => {
    const needsCorrection: typeof corrections = [];

    peopleList.forEach(person => {
      // Vérifier les corrections de nom
      const nameCorrection = nameCorrections.find(nc => {
        if (nc.search.firstName && nc.search.lastName) {
          return person.first_name === nc.search.firstName && 
                 person.last_name === nc.search.lastName;
        }
        return person.first_name === nc.search.firstName;
      });

      // Vérifier les corrections d'email
      const emailCorrection = emailCorrections.find(ec => 
        person.first_name === ec.firstName && 
        (!person.last_name || person.last_name === ec.lastName)
      );

      const updates: any = {};
      
      if (nameCorrection) {
        if (nameCorrection.correct.firstName !== person.first_name) {
          updates.firstName = nameCorrection.correct.firstName;
        }
        if (nameCorrection.correct.lastName !== person.last_name) {
          updates.lastName = nameCorrection.correct.lastName;
        }
      }

      if (emailCorrection) {
        if (!person.email && emailCorrection.email) {
          updates.email = emailCorrection.email;
        }
        if (!person.phone && emailCorrection.phone) {
          updates.phone = emailCorrection.phone;
        }
      }

      if (Object.keys(updates).length > 0) {
        needsCorrection.push({
          person,
          correction: updates,
          status: 'pending'
        });
      }
    });

    setCorrections(needsCorrection);
  };

  const applyCorrections = async () => {
    setIsApplying(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < corrections.length; i++) {
      const item = corrections[i];
      
      try {
        const updateData: any = {};
        if (item.correction.firstName) updateData.first_name = item.correction.firstName;
        if (item.correction.lastName) updateData.last_name = item.correction.lastName;
        if (item.correction.email) updateData.email = item.correction.email;
        if (item.correction.phone) updateData.phone = item.correction.phone;

        const { error } = await supabase
          .from('people')
          .update(updateData)
          .eq('id', item.person.id);

        if (error) throw error;

        setCorrections(prev => {
          const newCorrections = [...prev];
          newCorrections[i] = { ...newCorrections[i], status: 'success' };
          return newCorrections;
        });
        successCount++;
      } catch (error) {
        console.error(`Error updating ${item.person.first_name}:`, error);
        setCorrections(prev => {
          const newCorrections = [...prev];
          newCorrections[i] = { ...newCorrections[i], status: 'error' };
          return newCorrections;
        });
        errorCount++;
      }
    }

    setIsApplying(false);
    toast({
      title: "Corrections appliquées",
      description: `${successCount} réussies, ${errorCount} erreurs`
    });

    // Recharger les données
    setTimeout(() => loadPeople(), 1000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Vérification des noms et prénoms
        </CardTitle>
        <CardDescription>
          Corrections basées sur le fichier Liste_des_bénévoles.ods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {corrections.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-muted-foreground">Tous les noms sont corrects !</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {corrections.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {item.person.first_name} {item.person.last_name || '(pas de nom)'}
                        </span>
                        {item.status === 'success' && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {item.status === 'error' && (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        {item.status === 'pending' && (
                          <Badge variant="outline">À corriger</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm space-y-1">
                        {item.correction.firstName && (
                          <div className="text-muted-foreground">
                            Prénom: <span className="line-through">{item.person.first_name}</span> → 
                            <span className="text-green-600 font-medium ml-1">{item.correction.firstName}</span>
                          </div>
                        )}
                        {item.correction.lastName && (
                          <div className="text-muted-foreground">
                            Nom: <span className="line-through">{item.person.last_name || '(vide)'}</span> → 
                            <span className="text-green-600 font-medium ml-1">{item.correction.lastName}</span>
                          </div>
                        )}
                        {item.correction.email && (
                          <div className="text-muted-foreground">
                            Email: <span className="text-green-600 font-medium">{item.correction.email}</span>
                          </div>
                        )}
                        {item.correction.phone && (
                          <div className="text-muted-foreground">
                            Tél: <span className="text-green-600 font-medium">{item.correction.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                onClick={loadPeople}
                variant="outline"
                disabled={isApplying}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
              <Button
                onClick={applyCorrections}
                disabled={isApplying || corrections.every(c => c.status !== 'pending')}
              >
                {isApplying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Application...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Appliquer {corrections.filter(c => c.status === 'pending').length} corrections
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
