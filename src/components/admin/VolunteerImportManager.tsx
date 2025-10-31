import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, UserPlus, RefreshCw } from 'lucide-react';
import type { Section } from '@/types/organigramme';

interface VolunteerData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  department?: string;
  dateEngagement?: string;
  commissions?: string;
  timeAvailable?: string;
  competence1?: string;
  competence2?: string;
  mission?: string;
  interests?: string[];
  contactNeeds?: string;
}

interface VolunteerImportManagerProps {
  sections: Section[];
  onImportComplete: () => void;
}

const volunteersData: VolunteerData[] = [
  {
    firstName: 'Théo',
    lastName: 'BECCU',
    phone: '0638851950',
    email: 'theo@patoue.fr',
    department: 'Bellecombe Bauges (73)',
    dateEngagement: '2025',
    commissions: 'Web/Marketing',
    timeAvailable: '1h à ½ journée',
    competence1: 'Informatique-Réseau-Programmation',
    competence2: 'Marketing',
    mission: 'Web',
    interests: ['Patrimoine savoyard', 'Cours de patois', 'Culture savoyarde']
  },
  {
    firstName: 'Minh',
    lastName: 'DOAN',
    phone: '0661397949',
    email: 'minh@alveo3D.com',
    department: 'Le Bourget du Lac (73)',
    dateEngagement: '2024',
    commissions: 'Marketing-Développement commercial',
    timeAvailable: '½ h/semaine',
    competence1: 'Marketing digital',
    competence2: 'Impression 3D',
    mission: 'Booster le site WEB',
    interests: ['Langues latines', 'Culture savoyarde']
  },
  {
    firstName: 'Alain',
    lastName: 'FAVRE',
    commissions: 'Bureau - Vice-président Pédagogie'
  },
  {
    firstName: 'Arno',
    lastName: 'FRASSE',
    commissions: 'Toponymie'
  },
  {
    firstName: 'Charlotte',
    lastName: 'GENTY',
    phone: '0662368291',
    email: 'charlotte.gty80@gmail.com',
    department: 'Dublin (Irlande)',
    dateEngagement: '2025-06-01',
    commissions: 'Partenariat externe',
    timeAvailable: '1 h/semaine',
    competence1: 'Diplôme de droit',
    competence2: 'Droit',
    mission: 'Développer les partenariats avec les universités',
    interests: ['Culture savoyarde', 'Langues', 'Histoire art', 'Patrimoine culturel']
  },
  {
    firstName: 'Benjamin',
    lastName: 'HONEGGER',
    phone: '0619470465',
    email: 'benjamin.honegger@langue-savoyarde.com',
    commissions: 'Trésorerie',
    timeAvailable: '1h',
    competence1: 'Compta-Tréso',
    competence2: 'Culture générale',
    mission: 'Trésorier',
    interests: ['Intérêt pour la culture', 'Rendre service'],
    contactNeeds: 'Visio tous les 2 mois et AG'
  },
  {
    firstName: 'Serena',
    lastName: 'LOSORBO',
    phone: '0743284881',
    email: 'serenalosorbo@gmail.com',
    department: 'Cergy (73)',
    dateEngagement: '2025-09-01',
    commissions: 'Partenariat externe',
    competence1: 'Histoire et littérature',
    competence2: 'Langues',
    mission: 'Développer les partenariats avec les universités',
    interests: ['Autonomie', 'Organisation', 'Travail équipe', 'Compétences inter culturelles']
  },
  {
    firstName: 'Franck',
    lastName: 'MONOD',
    phone: '0631194249',
    email: 'franck.monod@langue-savoyarde.com',
    department: 'Italie',
    commissions: 'Secrétaire'
  },
  {
    firstName: 'Léotrim',
    lastName: 'RAMADANI',
    phone: '0749228852',
    email: 'leotrim@laposte.net',
    department: 'Nice (06) et St Julien (74)',
    dateEngagement: '2025-07-01',
    commissions: 'Toponymie',
    timeAvailable: '1 à 2h',
    competence1: 'Sciences du langage',
    competence2: 'Recherche',
    interests: ['Culture savoyarde', 'Rendre service']
  },
  {
    firstName: 'Sylvie',
    lastName: 'ROLLIN',
    phone: '0610707041',
    email: 'silvrollin@gmail.com',
    department: 'Aix les Bains (73)',
    dateEngagement: '2025-07-01',
    commissions: 'Gestion administrative',
    timeAvailable: '2h',
    competence1: 'RH',
    competence2: 'Contrôle Gestion',
    mission: 'Appui à Franck',
    interests: ['Curiosité', 'Rendre service'],
    contactNeeds: '1 visio/trimestre'
  },
  {
    firstName: 'Margot',
    lastName: 'SCORZA-DEL-BEN',
    dateEngagement: '2025-09-01'
  },
  {
    firstName: 'Anne-Sophie',
    lastName: 'AGUELMINE',
    commissions: 'Néologismes'
  },
  {
    firstName: 'Amandine',
    lastName: 'PINGET',
    phone: '0678895837',
    email: 'pingetamandine@yahoo.fr',
    department: 'Annecy (74)',
    dateEngagement: '2024-09-01',
    commissions: 'Gestion de données',
    timeAvailable: '1h-½ journée si besoin',
    competence1: 'Data scientist-Gestion de données',
    competence2: 'Eco-Gestion',
    mission: 'Appui à Franck pour FLORES',
    interests: ['Patrimoine savoyard', 'Rendre service'],
    contactNeeds: 'Connaître les travaux des autres-1 visio au trimestre'
  },
  {
    firstName: 'Tiffany',
    lastName: 'CLERC-BRUNSIDE',
    commissions: 'Pédagogie - Ingénierie'
  },
  {
    firstName: 'Paul',
    lastName: 'SXXX',
    commissions: 'Toponymie'
  },
  {
    firstName: 'Noé',
    lastName: '',
    commissions: 'Littérature et Néologisme'
  }
];

export const VolunteerImportManager: React.FC<VolunteerImportManagerProps> = ({ sections, onImportComplete }) => {
  const [selectedVolunteers, setSelectedVolunteers] = useState<Record<string, boolean>>({});
  const [sectionMapping, setSectionMapping] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const allSections = getAllSections(sections);

  const toggleVolunteer = (index: number) => {
    setSelectedVolunteers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSectionChange = (volunteerIndex: number, sectionId: string) => {
    setSectionMapping(prev => ({
      ...prev,
      [volunteerIndex]: sectionId
    }));
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const volunteersToImport = volunteersData
        .map((v, i) => ({ ...v, index: i }))
        .filter(v => selectedVolunteers[v.index] && sectionMapping[v.index]);

      if (volunteersToImport.length === 0) {
        toast({
          title: "Aucun bénévole sélectionné",
          description: "Veuillez sélectionner au moins un bénévole et lui assigner une section.",
          variant: "destructive"
        });
        return;
      }

      for (const volunteer of volunteersToImport) {
        // Insert person
        const { data: person, error: personError } = await supabase
          .from('people')
          .insert({
            first_name: volunteer.firstName,
            last_name: volunteer.lastName,
            email: volunteer.email,
            phone: volunteer.phone,
            adresse: volunteer.department,
            date_entree: volunteer.dateEngagement || null,
            competences: [volunteer.competence1, volunteer.competence2].filter(Boolean),
            bio: volunteer.mission,
            title: volunteer.commissions
          })
          .select()
          .single();

        if (personError) throw personError;

        // Link to section
        const { error: linkError } = await supabase
          .from('section_members')
          .insert({
            person_id: person.id,
            section_id: sectionMapping[volunteer.index],
            role: volunteer.commissions || 'Membre'
          });

        if (linkError) throw linkError;
      }

      toast({
        title: "Import réussi",
        description: `${volunteersToImport.length} bénévole(s) importé(s) avec succès.`
      });

      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erreur d'import",
        description: "Une erreur s'est produite lors de l'import des bénévoles.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import des bénévoles
        </CardTitle>
        <CardDescription>
          Sélectionnez les bénévoles à importer et assignez-les aux sections appropriées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {volunteersData.map((volunteer, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-4">
                <Checkbox
                  id={`volunteer-${index}`}
                  checked={selectedVolunteers[index] || false}
                  onCheckedChange={() => toggleVolunteer(index)}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`volunteer-${index}`} className="text-base font-semibold cursor-pointer">
                      {volunteer.firstName} {volunteer.lastName}
                    </Label>
                    {volunteer.commissions && (
                      <Badge variant="secondary">{volunteer.commissions}</Badge>
                    )}
                  </div>
                  
                  {(volunteer.email || volunteer.phone) && (
                    <div className="text-sm text-muted-foreground">
                      {volunteer.email && <div>{volunteer.email}</div>}
                      {volunteer.phone && <div>{volunteer.phone}</div>}
                    </div>
                  )}

                  {(volunteer.competence1 || volunteer.competence2) && (
                    <div className="flex gap-2 flex-wrap">
                      {volunteer.competence1 && <Badge variant="outline">{volunteer.competence1}</Badge>}
                      {volunteer.competence2 && <Badge variant="outline">{volunteer.competence2}</Badge>}
                    </div>
                  )}

                  {selectedVolunteers[index] && (
                    <Select
                      value={sectionMapping[index]}
                      onValueChange={(value) => handleSectionChange(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une section..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allSections.map(section => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            onClick={handleImport}
            disabled={isImporting || Object.keys(selectedVolunteers).filter(k => selectedVolunteers[k]).length === 0}
          >
            {isImporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Importer {Object.keys(selectedVolunteers).filter(k => selectedVolunteers[k]).length} bénévole(s)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

function getAllSections(sections: Section[], parentTitle = ''): Array<{ id: string; title: string }> {
  const result: Array<{ id: string; title: string }> = [];
  
  for (const section of sections) {
    const fullTitle = parentTitle ? `${parentTitle} > ${section.title}` : section.title;
    result.push({ id: section.id, title: fullTitle });
    
    if (section.subsections) {
      result.push(...getAllSections(section.subsections, fullTitle));
    }
  }
  
  return result;
}
