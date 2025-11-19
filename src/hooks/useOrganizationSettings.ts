import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OrganizationSettings {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  created_at: string;
  updated_at: string;
}

export const useOrganizationSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['organization-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as OrganizationSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<OrganizationSettings>) => {
      if (!settings?.id) throw new Error('No settings found');

      const { data, error } = await supabase
        .from('organization_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] });
      toast.success('Paramètres mis à jour');
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });

  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath);

      return publicUrl;
    },
    onSuccess: (publicUrl) => {
      updateSettings.mutate({ logo_url: publicUrl });
    },
    onError: (error) => {
      console.error('Error uploading logo:', error);
      toast.error('Erreur lors du téléchargement du logo');
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutate,
    uploadLogo: uploadLogo.mutate,
    isUpdating: updateSettings.isPending || uploadLogo.isPending,
  };
};
