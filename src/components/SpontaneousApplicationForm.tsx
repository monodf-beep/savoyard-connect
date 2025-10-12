import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

const applicationSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis').max(100),
  lastName: z.string().min(2, 'Nom requis').max(100),
  email: z.string().email('Email invalide').max(255),
  phone: z.string().optional(),
  linkedin: z.string().url('URL LinkedIn invalide').or(z.literal('')).optional(),
  message: z.string().max(2000).optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface SpontaneousApplicationFormProps {
  sectionId: string;
  sectionTitle: string;
  onClose: () => void;
}

export const SpontaneousApplicationForm: React.FC<SpontaneousApplicationFormProps> = ({
  sectionId,
  sectionTitle,
  onClose,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('spontaneous_applications').insert({
        section_id: sectionId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || null,
        linkedin: data.linkedin || null,
        message: data.message || null,
        location: 'Annecy',
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'Candidature envoyée !',
        description: 'Nous avons bien reçu votre candidature spontanée.',
      });
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi de votre candidature.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Candidature spontanée</h2>
            <p className="text-sm text-muted-foreground">{sectionTitle}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Informations sur le poste */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-medium text-sm">Conditions de participation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <strong className="text-foreground">Lieu :</strong> Annecy
              </div>
              <div>
                <strong className="text-foreground">Engagement :</strong> Variable selon poste
              </div>
              <div>
                <strong className="text-foreground">Disponibilité :</strong> À discuter
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                placeholder="Votre prénom"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                placeholder="Votre nom"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="votre.email@exemple.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+33 6 12 34 56 78"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              {...register('linkedin')}
              placeholder="https://linkedin.com/in/votre-profil"
            />
            {errors.linkedin && (
              <p className="text-sm text-destructive">{errors.linkedin.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message de motivation</Label>
            <Textarea
              id="message"
              {...register('message')}
              placeholder="Expliquez brièvement pourquoi vous souhaitez rejoindre cette section..."
              rows={5}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer ma candidature'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};