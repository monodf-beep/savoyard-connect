import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, User, CheckCircle, Edit2, PartyPopper, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { personSelfSchema } from '@/lib/validations';
import { z } from 'zod';
import { ImageEditor } from '@/components/ImageEditor';
import confetti from 'canvas-confetti';
import { useIsMobile } from '@/hooks/use-mobile';

// Animated loading steps component
const LoadingSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { text: 'Connexion au serveur...', done: false },
    { text: 'Vérification de votre invitation...', done: false },
    { text: 'Constitution des équipes...', done: false },
    { text: 'Création des groupes...', done: false },
    { text: 'Préparation du formulaire...', done: false },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isDone = index < currentStep;
          const isCurrent = index === currentStep;
          return (
            <div 
              key={index}
              className={`flex items-center gap-3 transition-all duration-300 ${
                index > currentStep ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {isDone ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
              )}
              <span className={`text-sm ${isDone ? 'text-green-600' : isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {step.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface InviteData {
  id: string;
  email: string;
  person_id: string | null;
  status: string;
  expires_at: string;
}

interface PersonData {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  bio: string | null;
  linkedin: string | null;
  adresse: string | null;
  avatar_url: string | null;
}

interface OrgSettings {
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  description: string;
  linkedin: string;
  adresse: string;
  photo: string;
}

interface OrgSection {
  id: string;
  title: string;
  members: Array<{
    id: string;
    first_name: string;
    last_name: string;
    title: string | null;
    avatar_url: string | null;
  }>;
  subsections?: OrgSection[];
  isExpanded?: boolean;
}

// Mini organigramme read-only component
const MiniOrganigramme = ({ sections }: { sections: OrgSection[] }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const renderSection = (section: OrgSection, depth: number = 0) => {
    const isExpanded = expandedSections.has(section.id);
    const hasSubsections = section.subsections && section.subsections.length > 0;

    return (
      <div key={section.id} className={`${depth > 0 ? 'ml-3 border-l border-border pl-3' : ''}`}>
        <button
          onClick={() => toggleSection(section.id)}
          className="flex items-center gap-2 w-full text-left py-2 px-2 rounded hover:bg-muted/50 transition-colors"
        >
          {hasSubsections ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )
          ) : (
            <div className="w-4" />
          )}
          <span className="font-medium text-sm text-foreground">{section.title}</span>
          <span className="text-xs text-muted-foreground">({section.members.length})</span>
        </button>

        {isExpanded && (
          <div className="ml-6 space-y-1 pb-2">
            {section.members.map(member => (
              <div key={member.id} className="flex items-center gap-2 py-1 px-2">
                <div className="w-6 h-6 rounded-full bg-muted overflow-hidden flex-shrink-0">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {member.first_name} {member.last_name}
                  </p>
                  {member.title && (
                    <p className="text-xs text-muted-foreground truncate">{member.title}</p>
                  )}
                </div>
              </div>
            ))}
            {hasSubsections && section.subsections!.map(sub => renderSection(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <Users className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-sm">L'équipe se construit...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-1">
        {sections.map(section => renderSection(section))}
      </div>
    </ScrollArea>
  );
};

const Onboarding = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const isMobile = useIsMobile();
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [person, setPerson] = useState<PersonData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orgSettings, setOrgSettings] = useState<OrgSettings | null>(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [personId, setPersonId] = useState<string | null>(null);
  const [orgSections, setOrgSections] = useState<OrgSection[]>([]);
  const [showTeamSheet, setShowTeamSheet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    description: '',
    linkedin: '',
    adresse: '',
    photo: ''
  });

  // Fetch organization settings
  useEffect(() => {
    const fetchOrgSettings = async () => {
      const { data } = await supabase
        .from('organization_settings')
        .select('name, logo_url, primary_color, secondary_color')
        .single();
      
      if (data) {
        setOrgSettings(data);
        // Apply colors
        const root = document.documentElement;
        root.style.setProperty('--primary', data.primary_color);
        root.style.setProperty('--secondary', data.secondary_color);
      }
    };
    fetchOrgSettings();
  }, []);

  // Fetch organigramme data
  useEffect(() => {
    const fetchOrganigramme = async () => {
      try {
        // Fetch sections
        const { data: sectionsData } = await supabase
          .from('sections')
          .select('id, title, parent_id, display_order')
          .order('display_order', { ascending: true });

        // Fetch section members with people info
        const { data: membersData } = await supabase
          .from('section_members')
          .select(`
            section_id,
            person_id,
            people:person_id (
              id,
              first_name,
              last_name,
              title,
              avatar_url
            )
          `);

        if (sectionsData) {
          // Build hierarchy
          const sectionMap = new Map<string, OrgSection>();
          sectionsData.forEach((s: any) => {
            sectionMap.set(s.id, {
              id: s.id,
              title: s.title,
              members: [],
              subsections: []
            });
          });

          // Add members to sections
          membersData?.forEach((m: any) => {
            if (m.people && sectionMap.has(m.section_id)) {
              sectionMap.get(m.section_id)!.members.push(m.people);
            }
          });

          // Build hierarchy
          const rootSections: OrgSection[] = [];
          sectionsData.forEach((s: any) => {
            const section = sectionMap.get(s.id)!;
            if (s.parent_id && sectionMap.has(s.parent_id)) {
              sectionMap.get(s.parent_id)!.subsections!.push(section);
            } else {
              rootSections.push(section);
            }
          });

          setOrgSections(rootSections);
        }
      } catch (error) {
        console.error('Error fetching organigramme:', error);
      }
    };

    fetchOrganigramme();
  }, []);

  useEffect(() => {
    document.title = orgSettings ? `Compléter mon profil | ${orgSettings.name}` : 'Compléter mon profil';
  }, [orgSettings]);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrorMessage('Lien invalide ou manquant.');
        setValidating(false);
        return;
      }

      try {
        const { data: inviteData, error } = await supabase
          .from('invites')
          .select('id, email, person_id, status, expires_at')
          .eq('token', token)
          .maybeSingle();

        if (error || !inviteData) {
          setErrorMessage('Ce lien d\'invitation n\'est pas valide.');
          setValidating(false);
          return;
        }

        if (inviteData.status !== 'pending') {
          setErrorMessage('Ce lien d\'invitation a déjà été utilisé.');
          setValidating(false);
          return;
        }

        const expiresAt = new Date(inviteData.expires_at);
        if (expiresAt < new Date()) {
          setErrorMessage('Ce lien d\'invitation a expiré.');
          setValidating(false);
          return;
        }

        setInvite(inviteData);

        // If there's a linked person, fetch their data to pre-fill the form
        if (inviteData.person_id) {
          const { data: personData } = await supabase
            .from('people')
            .select('id, first_name, last_name, email, phone, title, bio, linkedin, adresse, avatar_url')
            .eq('id', inviteData.person_id)
            .maybeSingle();

          if (personData) {
            setPerson(personData);
            setFormData({
              firstName: personData.first_name || '',
              lastName: personData.last_name || '',
              email: personData.email || inviteData.email || '',
              phone: personData.phone || '',
              role: personData.title || '',
              description: personData.bio || '',
              linkedin: personData.linkedin || '',
              adresse: personData.adresse || '',
              photo: personData.avatar_url || ''
            });
          }
        } else {
          // Pre-fill email from invite
          setFormData(prev => ({ ...prev, email: inviteData.email }));
        }

        setIsValid(true);
      } catch (err) {
        setErrorMessage('Erreur lors de la validation du lien.');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setFormData(prev => ({ ...prev, photo: result }));
      // Open image editor for cropping
      setShowImageEditor(true);
      if (errors.photo) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.photo;
          return newErrors;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageEditorSave = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, photo: imageUrl }));
    setShowImageEditor(false);
    if (errors.photo) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      personSelfSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const triggerCelebration = () => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    if (!token) return;

    setSubmitting(true);

    try {
      // Use edge function to bypass RLS
      const { data, error } = await supabase.functions.invoke('complete-profile', {
        body: {
          token,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          description: formData.description,
          linkedin: formData.linkedin,
          adresse: formData.adresse,
          photo: formData.photo
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setPersonId(data?.personId || null);
      setCompleted(true);
      triggerCelebration();
      toast.success('Profil complété avec succès !');

      // Redirect to organigramme after 4 seconds
      setTimeout(() => {
        navigate('/organigramme', { state: { highlightPersonId: data?.personId } });
      }, 4000);
    } catch (err: any) {
      console.error('Error submitting profile:', err);
      toast.error(err.message || 'Erreur lors de la sauvegarde du profil');
    } finally {
      setSubmitting(false);
    }
  };

  // Header with org logo and name
  const Header = () => (
    <div className="text-center mb-6">
      {orgSettings?.logo_url && (
        <img 
          src={orgSettings.logo_url} 
          alt={orgSettings?.name || 'Logo'} 
          className="h-12 md:h-16 mx-auto mb-3 object-contain"
        />
      )}
      <h1 className="text-xl md:text-2xl font-bold text-foreground">
        {orgSettings?.name || 'Organisation'}
      </h1>
    </div>
  );

  // Team viewer for mobile
  const TeamViewerMobile = () => (
    <Sheet open={showTeamSheet} onOpenChange={setShowTeamSheet}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full mb-4">
          <Users className="h-4 w-4 mr-2" />
          Voir l'équipe
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle>L'équipe</SheetTitle>
        </SheetHeader>
        <MiniOrganigramme sections={orgSections} />
      </SheetContent>
    </Sheet>
  );

  if (validating) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6">
        <div className="max-w-md w-full">
          <Header />
          <LoadingSteps />
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6">
        <div className="max-w-md w-full text-center">
          <Header />
          <p className="text-destructive">{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (completed) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6">
        <div className="max-w-md w-full">
          <Header />
          <div className="text-center py-8 md:py-12 bg-card rounded-lg border border-border shadow-lg px-4">
            <div className="relative inline-block mb-4 md:mb-6">
              <CheckCircle className="h-16 w-16 md:h-20 md:w-20 text-green-500 mx-auto animate-bounce" />
              <PartyPopper className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-foreground">
              Bravo {formData.firstName} !
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-2">
              Vous faites maintenant partie de
            </p>
            <p className="text-xl md:text-2xl font-semibold text-primary mb-4 md:mb-6">
              {orgSettings?.name || 'l\'organisation'}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirection vers l'organigramme...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!isValid) return null;

  // Form component
  const FormSection = () => (
    <div className="bg-card rounded-lg border border-border shadow-sm p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-2">Compléter mon profil</h2>
      <p className="text-sm text-muted-foreground mb-4 md:mb-6">
        Veuillez remplir les informations ci-dessous pour compléter votre fiche.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Photo */}
        <div className="flex flex-col items-center gap-3 p-3 md:p-4 border rounded-lg bg-muted/30">
          <Label className="text-center font-medium text-sm">Photo de profil *</Label>
          <div className="relative">
            <div 
              className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors"
              onClick={() => formData.photo ? setShowImageEditor(true) : fileInputRef.current?.click()}
            >
              {formData.photo ? (
                <>
                  <img 
                    src={formData.photo} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                  <User className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground" />
                  <Upload className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground mt-1" />
                </div>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {formData.photo ? 'Changer' : 'Choisir'}
            </Button>
            {formData.photo && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowImageEditor(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
          {errors.photo && (
            <p className="text-sm text-destructive">{errors.photo}</p>
          )}
        </div>

        {/* Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <Label htmlFor="firstName" className="text-sm">Prénom *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Votre prénom"
              className={`mt-1 ${errors.firstName ? 'border-destructive' : ''}`}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm">Nom *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Votre nom"
              className={`mt-1 ${errors.lastName ? 'border-destructive' : ''}`}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <Label htmlFor="email" className="text-sm">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="votre@email.com"
              className={`mt-1 ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className={`mt-1 ${errors.phone ? 'border-destructive' : ''}`}
            />
            {errors.phone && (
              <p className="text-xs text-destructive mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Role */}
        <div>
          <Label htmlFor="role" className="text-sm">Rôle / Fonction *</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            placeholder="Ex: Bénévole, Trésorier..."
            className={`mt-1 ${errors.role ? 'border-destructive' : ''}`}
          />
          {errors.role && (
            <p className="text-xs text-destructive mt-1">{errors.role}</p>
          )}
        </div>

        {/* City */}
        <div>
          <Label htmlFor="adresse" className="text-sm">Ville *</Label>
          <Input
            id="adresse"
            value={formData.adresse}
            onChange={(e) => handleChange('adresse', e.target.value)}
            placeholder="Ex: Annecy, Chambéry..."
            className={`mt-1 ${errors.adresse ? 'border-destructive' : ''}`}
          />
          {errors.adresse && (
            <p className="text-xs text-destructive mt-1">{errors.adresse}</p>
          )}
        </div>

        {/* LinkedIn */}
        <div>
          <Label htmlFor="linkedin" className="text-sm">Profil LinkedIn</Label>
          <Input
            id="linkedin"
            value={formData.linkedin}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className={`mt-1 ${errors.linkedin ? 'border-destructive' : ''}`}
          />
          {errors.linkedin && (
            <p className="text-xs text-destructive mt-1">{errors.linkedin}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="description" className="text-sm">Présentation</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Quelques mots sur vous..."
            rows={3}
            className={`mt-1 ${errors.description ? 'border-destructive' : ''}`}
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">{errors.description}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2 md:pt-4">
          <Button type="submit" disabled={submitting} size="default" className="w-full md:w-auto">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer mon profil'
            )}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Desktop: Split layout */}
      {!isMobile ? (
        <div className="flex h-screen">
          {/* Left: Organigramme */}
          <div className="w-1/3 min-w-[280px] max-w-[400px] border-r border-border bg-muted/20 flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5" />
                L'équipe
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Découvrez vos futurs collègues
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <MiniOrganigramme sections={orgSections} />
            </div>
          </div>

          {/* Right: Form */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-xl mx-auto py-6 md:py-8 px-4 md:px-6">
              <Header />
              <FormSection />
            </div>
          </div>
        </div>
      ) : (
        /* Mobile: Stacked layout */
        <div className="py-6 px-4">
          <Header />
          <TeamViewerMobile />
          <FormSection />
        </div>
      )}

      {/* Image Editor */}
      <ImageEditor
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        onSave={handleImageEditorSave}
        initialImageUrl={formData.photo}
      />
    </main>
  );
};

export default Onboarding;
