import React, { useEffect, useState } from 'react';
import { Person } from '../types/organigramme';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { X, Linkedin, MapPin, Edit, Mail, Phone, Calendar, User, BookOpen, Briefcase, Star, Globe, Users, Send } from 'lucide-react';
import { Button } from './ui/button';
import { useOrganigramme } from '../hooks/useOrganigramme';
import { Sheet, SheetContent } from './ui/sheet';
import { Drawer, DrawerContent, DrawerClose } from './ui/drawer';
import { useIsMobile } from '../hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { Input } from './ui/input';

// Composant pour afficher les sections d'une personne
const PersonSections: React.FC<{ personId: string }> = ({ personId }) => {
  const { data } = useOrganigramme(false);
  
  const getPersonSections = () => {
    const sections: Array<{ title: string; role: string }> = [];
    
    const findPersonInSections = (sectionList: any[], parentTitle = '') => {
      sectionList.forEach(section => {
        const member = section.members?.find((m: any) => m.id === personId);
        if (member) {
          sections.push({
            title: section.title,
            role: member.role || 'Membre'
          });
        }
        if (section.subsections) {
          findPersonInSections(section.subsections, section.title);
        }
      });
    };
    
    findPersonInSections(data.sections);
    return sections;
  };

  const personSections = getPersonSections();

  if (personSections.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
        <Users className="w-4 h-4 text-primary" />
        Participe à
      </h3>
      <div className="flex flex-wrap gap-2">
        {personSections.map((section, index) => (
          <Badge key={index} variant="outline" className="text-xs bg-muted/50 border-border font-medium">
            {section.title}
            {section.role !== 'Membre' && ` (${section.role})`}
          </Badge>
        ))}
      </div>
    </div>
  );
};

interface PersonSidebarProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (person: Person) => void;
}

export const PersonSidebar: React.FC<PersonSidebarProps> = ({ 
  person, 
  isOpen, 
  onClose, 
  isAdmin = false,
  onEdit 
}) => {
  const isMobile = useIsMobile();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!person) return null;

  const sendInvite = async (emailToUse?: string) => {
    const email = (emailToUse || person.email || '').trim();
    const emailSchema = z.string().email();
    
    if (!emailSchema.safeParse(email).success) {
      toast.error('Veuillez saisir une adresse email valide');
      return;
    }

    setIsSending(true);
    
    try {
      // Si on a saisi un nouvel email, on met à jour d'abord la personne
      if (emailToUse && emailToUse !== person.email) {
        const { error: updateError } = await supabase
          .from('people')
          .update({ email: emailToUse })
          .eq('id', person.id);
        
        if (updateError) throw updateError;
      }

      // Ensuite on envoie l'invitation
      const { error } = await supabase.functions.invoke('send-invite', {
        body: { email, baseUrl: window.location.origin },
      });
      
      if (error) throw error;
      
      toast.success("Invitation envoyée à " + email);
      setIsEditingEmail(false);
      setEmailInput('');
    } catch (e) {
      if (import.meta.env.DEV) console.error(e);
      toast.error("Échec de l'envoi de l'invitation");
    } finally {
      setIsSending(false);
    }
  };

  const handleInviteClick = () => {
    if (!person.email) {
      setIsEditingEmail(true);
      setEmailInput('');
    } else {
      sendInvite();
    }
  };

  // Contenu commun pour desktop et mobile
  const content = (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={person.photo} alt={`${person.firstName} ${person.lastName}`} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-foreground font-semibold text-lg">
              {person.firstName.charAt(0)}{person.lastName?.charAt(0) || ''}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate">
              {person.firstName} {person.lastName}
            </h2>
            {person.role && (
              <p className="text-sm text-muted-foreground truncate">{person.role}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && onEdit && (
            <Button
              onClick={() => onEdit(person)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 1. Lieu */}
        {person.adresse && (
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Lieu
            </h3>
            <p className="text-muted-foreground text-sm">{person.adresse}</p>
          </div>
        )}

        {/* 2. Groupes et commissions */}
        <PersonSections personId={person.id} />

        {/* 3. À propos / Mission */}
        {person.description && (
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              À propos / Mission
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{person.description}</p>
          </div>
        )}

        {/* LinkedIn */}
        {person.linkedin && (
          <div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              asChild
            >
              <a
                href={person.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Linkedin className="w-4 h-4" />
                Voir le profil LinkedIn
              </a>
            </Button>
          </div>
        )}

        {/* Invitation (Admin only) */}
        {isAdmin && (
          <div className="space-y-2">
            {isEditingEmail ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@exemple.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && emailInput.trim()) {
                        sendInvite(emailInput);
                      }
                    }}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    onClick={() => sendInvite(emailInput)}
                    disabled={!emailInput.trim() || isSending}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEmailInput('');
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={async () => {
                    if (!emailInput.trim()) return;
                    
                    try {
                      const token = crypto.randomUUID().replace(/-/g, "");
                      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
                      
                      await supabase.from("invites").insert({
                        email: emailInput,
                        token,
                        expires_at: expiresAt,
                        status: "pending",
                        person_id: person.id,
                      });

                      const link = `${window.location.origin}/onboarding?token=${token}`;
                      await navigator.clipboard.writeText(link);
                      toast.success("Lien copié dans le presse-papier");
                    } catch (error) {
                      toast.error("Erreur lors de la création du lien");
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!emailInput.trim()}
                >
                  Copier le lien d'invitation
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleInviteClick}
                  disabled={isSending}
                  variant="default"
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Inviter à compléter son profil
                </Button>
                {person.email && (
                  <Button
                    onClick={async () => {
                      try {
                        const token = crypto.randomUUID().replace(/-/g, "");
                        const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
                        
                        await supabase.from("invites").insert({
                          email: person.email,
                          token,
                          expires_at: expiresAt,
                          status: "pending",
                          person_id: person.id,
                        });

                        const link = `${window.location.origin}/onboarding?token=${token}`;
                        await navigator.clipboard.writeText(link);
                        toast.success("Lien copié dans le presse-papier");
                      } catch (error) {
                        toast.error("Erreur lors de la création du lien");
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Copier le lien d'invitation
                  </Button>
                )}
              </>
            )}
            {!person.email && !isEditingEmail && (
              <p className="text-xs text-muted-foreground text-center">
                ⚠️ Email manquant - cliquez pour ajouter
              </p>
            )}
          </div>
        )}

        {/* 4. Compétences */}
        {person.competences && person.competences.length > 0 && (
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Compétences
            </h3>
            <div className="flex flex-wrap gap-2">
              {person.competences.map((competence, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-muted/50 border-border font-medium">
                  {competence}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 5. Membre depuis */}
        {person.dateEntree && (
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Membre depuis
            </h3>
            <p className="text-muted-foreground text-sm">
              {new Date(person.dateEntree).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </div>
    </>
  );

  // Mobile: Drawer (bottom sheet)
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[85vh]">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Sheet (sidebar)
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {content}
      </SheetContent>
    </Sheet>
  );
};