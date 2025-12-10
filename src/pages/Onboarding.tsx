import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { personSelfSchema } from '@/lib/validations';
import { z } from 'zod';

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
  const token = params.get('token');
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [person, setPerson] = useState<PersonData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  useEffect(() => {
    document.title = 'Compléter mon profil | Institut';
  }, []);

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

      setCompleted(true);
      toast.success('Profil complété avec succès !');
    } catch (err: any) {
      console.error('Error submitting profile:', err);
      toast.error(err.message || 'Erreur lors de la sauvegarde du profil');
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Compléter mon profil</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p>Vérification du lien...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Compléter mon profil</h1>
        <p className="text-destructive">{errorMessage}</p>
      </main>
    );
  }

  if (completed) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Merci !</h1>
          <p className="text-muted-foreground">
            Votre profil a été complété avec succès. Vous pouvez maintenant fermer cette page.
          </p>
        </div>
      </main>
    );
  }

  if (!isValid) return null;

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Compléter mon profil</h1>
      <p className="text-muted-foreground mb-6">
        Veuillez remplir les informations ci-dessous pour compléter votre fiche dans l'organigramme.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-muted/30">
          <Label className="text-center font-medium">Photo de profil *</Label>
          <div 
            className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.photo ? (
              <img 
                src={formData.photo} 
                alt="Photo de profil" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
                <User className="h-12 w-12 text-muted-foreground" />
                <Upload className="h-4 w-4 text-muted-foreground mt-1" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choisir une photo
          </Button>
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
    </main>
  );
};

export default Onboarding;
