import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FinancialReport } from '@/hooks/useFinancialReports';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FinancialReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: FinancialReport | null;
}

type FormData = {
  year: number;
  report_name: string;
  total_charges: number;
  total_produits: number;
  resultat: number;
  achats: number;
  services_exterieurs: number;
  autres_services: number;
  charges_personnel: number;
  charges_financieres: number;
  dotations_amortissements: number;
  ventes_prestations: number;
  subventions: number;
  dons_cotisations: number;
  produits_financiers: number;
  autres_produits: number;
  total_actif: number;
  total_passif: number;
  reserves: number;
  tresorerie: number;
  notes: string;
  is_provisional: boolean;
  is_published: boolean;
};

export const FinancialReportForm = ({ open, onOpenChange, report }: FinancialReportFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!report;

  const form = useForm<FormData>({
    defaultValues: {
      year: report?.year || new Date().getFullYear(),
      report_name: report?.report_name || 'Rapport annuel',
      total_charges: report?.total_charges || 0,
      total_produits: report?.total_produits || 0,
      resultat: report?.resultat || 0,
      achats: report?.achats || 0,
      services_exterieurs: report?.services_exterieurs || 0,
      autres_services: report?.autres_services || 0,
      charges_personnel: report?.charges_personnel || 0,
      charges_financieres: report?.charges_financieres || 0,
      dotations_amortissements: report?.dotations_amortissements || 0,
      ventes_prestations: report?.ventes_prestations || 0,
      subventions: report?.subventions || 0,
      dons_cotisations: report?.dons_cotisations || 0,
      produits_financiers: report?.produits_financiers || 0,
      autres_produits: report?.autres_produits || 0,
      total_actif: report?.total_actif || 0,
      total_passif: report?.total_passif || 0,
      reserves: report?.reserves || 0,
      tresorerie: report?.tresorerie || 0,
      notes: report?.notes || '',
      is_provisional: report?.is_provisional || false,
      is_published: report?.is_published ?? true,
    },
  });

  // Auto-calculate totals
  const watchCharges = form.watch(['achats', 'services_exterieurs', 'autres_services', 'charges_personnel', 'charges_financieres', 'dotations_amortissements']);
  const watchProduits = form.watch(['ventes_prestations', 'subventions', 'dons_cotisations', 'produits_financiers', 'autres_produits']);

  const calculateTotalCharges = () => {
    const values = form.getValues();
    return (
      Number(values.achats) +
      Number(values.services_exterieurs) +
      Number(values.autres_services) +
      Number(values.charges_personnel) +
      Number(values.charges_financieres) +
      Number(values.dotations_amortissements)
    );
  };

  const calculateTotalProduits = () => {
    const values = form.getValues();
    return (
      Number(values.ventes_prestations) +
      Number(values.subventions) +
      Number(values.dons_cotisations) +
      Number(values.produits_financiers) +
      Number(values.autres_produits)
    );
  };

  const recalculateTotals = () => {
    const totalCharges = calculateTotalCharges();
    const totalProduits = calculateTotalProduits();
    form.setValue('total_charges', totalCharges);
    form.setValue('total_produits', totalProduits);
    form.setValue('resultat', totalProduits - totalCharges);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        notes: data.notes || null,
      };

      if (isEditing && report) {
        const { error } = await supabase
          .from('financial_reports')
          .update(payload)
          .eq('id', report.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('financial_reports')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-reports'] });
      toast.success(isEditing ? 'Rapport mis à jour' : 'Rapport créé');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!report) return;
      const { error } = await supabase
        .from('financial_reports')
        .delete()
        .eq('id', report.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-reports'] });
      toast.success('Rapport supprimé');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  const onSubmit = (data: FormData) => {
    saveMutation.mutate(data);
  };

  const NumberInput = ({ name, label }: { name: keyof FormData; label: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              step="0.01"
              value={typeof field.value === 'number' ? field.value : 0}
              onChange={(e) => {
                field.onChange(parseFloat(e.target.value) || 0);
              }}
              onBlur={() => recalculateTotals()}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Modifier le rapport ${report.year}` : 'Nouveau rapport financier'}
          </DialogTitle>
          <DialogDescription>
            Saisissez les données financières de l'association
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="report_name"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Nom du rapport</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Rapport annuel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="is_provisional"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Prévisionnel</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_published"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Publié</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Tabs defaultValue="charges" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="charges">Charges</TabsTrigger>
                <TabsTrigger value="produits">Produits</TabsTrigger>
                <TabsTrigger value="bilan">Bilan</TabsTrigger>
              </TabsList>

              <TabsContent value="charges" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Détail des charges</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <NumberInput name="achats" label="Achats" />
                    <NumberInput name="services_exterieurs" label="Services extérieurs" />
                    <NumberInput name="autres_services" label="Autres services extérieurs" />
                    <NumberInput name="charges_personnel" label="Charges de personnel" />
                    <NumberInput name="charges_financieres" label="Charges financières" />
                    <NumberInput name="dotations_amortissements" label="Dotations aux amortissements" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total des charges</span>
                      <span className="text-red-600">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(form.watch('total_charges'))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="produits" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Détail des produits</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <NumberInput name="ventes_prestations" label="Ventes & Prestations" />
                    <NumberInput name="subventions" label="Subventions" />
                    <NumberInput name="dons_cotisations" label="Dons & Cotisations" />
                    <NumberInput name="produits_financiers" label="Produits financiers" />
                    <NumberInput name="autres_produits" label="Autres produits" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total des produits</span>
                      <span className="text-green-600">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(form.watch('total_produits'))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bilan" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Éléments de bilan</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <NumberInput name="total_actif" label="Total Actif" />
                    <NumberInput name="total_passif" label="Total Passif" />
                    <NumberInput name="reserves" label="Réserves" />
                    <NumberInput name="tresorerie" label="Trésorerie" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Result */}
            <Card className={form.watch('resultat') >= 0 ? 'border-green-500' : 'border-red-500'}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Résultat</span>
                  <span className={form.watch('resultat') >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(form.watch('resultat'))}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Commentaires sur ce rapport..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-between gap-4">
              {isEditing && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce rapport ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Le rapport {report.year} sera définitivement supprimé.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
