import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, User, CheckCircle, Edit2, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { personSelfSchema } from '@/lib/validations';
import { z } from 'zod';
import { ImageEditor } from '@/components/ImageEditor';
import confetti from 'canvas-confetti';

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

const Onboarding = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
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
        navigate('/', { state: { highlightPersonId: data?.personId } });
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
    <div className="text-center mb-8">
      {orgSettings?.logo_url && (
        <img 
          src={orgSettings.logo_url} 
          alt={orgSettings?.name || 'Logo'} 
          className="h-16 mx-auto mb-4 object-contain"
        />
      )}
      <h1 className="text-2xl font-bold text-foreground">
        {orgSettings?.name || 'Organisation'}
      </h1>
    </div>
  );

  if (validating) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Header />
          <LoadingSteps />
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          <Header />
          <p className="text-destructive">{errorMessage}</p>
        </div>
      </main>
    );
  }

  if (completed) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Header />
          <div className="text-center py-12 bg-card rounded-lg border border-border shadow-lg">
            <div className="relative inline-block mb-6">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto animate-bounce" />
              <PartyPopper className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Bravo {formData.firstName} !
            </h2>
            <p className="text-xl text-muted-foreground mb-2">
              Vous faites maintenant partie de
            </p>
            <p className="text-2xl font-semibold text-primary mb-6">
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

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Header />
        
        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-2">Compléter mon profil</h2>
          <p className="text-muted-foreground mb-6">
            Veuillez remplir les informations ci-dessous pour compléter votre fiche dans l'organigramme.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo */}
            <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <Label className="text-center font-medium">Photo de profil *</Label>
              <div className="relative">
                <div 
                  className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors"
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
                        <Edit2 className="h-6 w-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                      <User className="h-12 w-12 text-muted-foreground" />
                      <Upload className="h-4 w-4 text-muted-foreground mt-1" />
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
                  {formData.photo ? 'Changer' : 'Choisir une photo'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Votre prénom"
                  className={errors.firstName ? 'border-destructive' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Votre nom"
                  className={errors.lastName ? 'border-destructive' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="votre@email.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role">Rôle / Fonction *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Ex: Bénévole, Trésorier, Responsable communication..."
                className={errors.role ? 'border-destructive' : ''}
              />
              {errors.role && (
                <p className="text-sm text-destructive mt-1">{errors.role}</p>
              )}
            </div>

            {/* City */}
            <div>
              <Label htmlFor="adresse">Ville *</Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleChange('adresse', e.target.value)}
                placeholder="Ex: Annecy, Chambéry..."
                className={errors.adresse ? 'border-destructive' : ''}
              />
              {errors.adresse && (
                <p className="text-sm text-destructive mt-1">{errors.adresse}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <Label htmlFor="linkedin">Profil LinkedIn</Label>
              <Input
                id="linkedin"
                value={formData.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/votre-profil"
                className={errors.linkedin ? 'border-destructive' : ''}
              />
              {errors.linkedin && (
                <p className="text-sm text-destructive mt-1">{errors.linkedin}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="description">Présentation</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Quelques mots sur vous, votre parcours, vos motivations..."
                rows={4}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={submitting} size="lg">
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
      </div>

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