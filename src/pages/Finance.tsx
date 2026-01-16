import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HubPageLayout } from '@/components/hub/HubPageLayout';
import { useFinancialReports, FinancialReport } from '@/hooks/useFinancialReports';
import { useFundingProjects } from '@/hooks/useFundingProjects';
import { useAuth } from '@/hooks/useAuth';
import { FinancialDocuments } from '@/components/finance/FinancialDocuments';
import { FinancialReportForm } from '@/components/finance/FinancialReportForm';
import { FinanceImportExport } from '@/components/finance/FinanceImportExport';
import { TreasuryCashflowChart } from '@/components/finance/TreasuryCashflowChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Euro, 
  Users,
  Target,
  Building,
  HandHeart,
  ChevronRight,
  ExternalLink,
  Plus,
  Pencil
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const Finance = () => {
  const { t } = useTranslation();
  const { data: reports, isLoading: reportsLoading } = useFinancialReports();
  const { fundingProjects, stats, loading: projectsLoading } = useFundingProjects();
  const { isAdmin } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<FinancialReport | null>(null);
  const queryClient = useQueryClient();

  // Mutation to create report from imported data
  const createReportMutation = useMutation({
    mutationFn: async (data: Partial<FinancialReport>) => {
      const { error } = await supabase
        .from('financial_reports')
        .insert({
          year: data.year!,
          report_name: data.report_name || 'Rapport importé',
          achats: data.achats || 0,
          services_exterieurs: data.services_exterieurs || 0,
          autres_services: data.autres_services || 0,
          charges_personnel: data.charges_personnel || 0,
          charges_financieres: data.charges_financieres || 0,
          dotations_amortissements: data.dotations_amortissements || 0,
          total_charges: data.total_charges || 0,
          ventes_prestations: data.ventes_prestations || 0,
          subventions: data.subventions || 0,
          dons_cotisations: data.dons_cotisations || 0,
          produits_financiers: data.produits_financiers || 0,
          autres_produits: data.autres_produits || 0,
          total_produits: data.total_produits || 0,
          resultat: data.resultat || 0,
          total_actif: data.total_actif || 0,
          total_passif: data.total_passif || 0,
          reserves: data.reserves || 0,
          tresorerie: data.tresorerie || 0,
          notes: data.notes || null,
          is_provisional: data.is_provisional || false,
          is_published: true,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-reports'] });
      toast.success('Rapport créé depuis l\'import');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la création');
    },
  });

  const loading = reportsLoading || projectsLoading;

  // Get latest report or selected year
  const currentReport = reports?.find(r => 
    selectedYear ? r.year === selectedYear : !r.is_provisional
  ) || reports?.[0];

  const provisionalReport = reports?.find(r => r.is_provisional);

  // Prepare chart data for expenses
  const chargesData = currentReport ? [
    { name: 'Achats', value: currentReport.achats },
    { name: 'Services extérieurs', value: currentReport.services_exterieurs },
    { name: 'Autres services', value: currentReport.autres_services },
    { name: 'Charges financières', value: currentReport.charges_financieres },
    { name: 'Amortissements', value: currentReport.dotations_amortissements },
  ].filter(d => d.value > 0) : [];

  // Prepare chart data for income
  const produitsData = currentReport ? [
    { name: 'Ventes/Prestations', value: currentReport.ventes_prestations },
    { name: 'Subventions', value: currentReport.subventions },
    { name: 'Dons/Cotisations', value: currentReport.dons_cotisations },
    { name: 'Produits financiers', value: currentReport.produits_financiers },
  ].filter(d => d.value > 0) : [];

  // Comparison data across years - sorted chronologically (oldest to newest, left to right)
  const comparisonData = reports?.filter(r => !r.is_provisional).map(r => ({
    year: r.year.toString(),
    Charges: r.total_charges,
    Produits: r.total_produits,
    Résultat: r.resultat,
  })).sort((a, b) => parseInt(a.year) - parseInt(b.year)) || [];

  const headerActions = isAdmin ? (
    <div className="flex gap-2">
      {currentReport && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingReport(currentReport);
            setFormOpen(true);
          }}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Modifier {currentReport.year}
        </Button>
      )}
      <Button
        size="sm"
        onClick={() => {
          setEditingReport(null);
          setFormOpen(true);
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Nouveau rapport
      </Button>
    </div>
  ) : null;

  return (
    <HubPageLayout
      title={t('nav.finance')}
      subtitle="Consultez les comptes en toute transparence"
      loading={loading}
      headerActions={headerActions}
    >
      {/* Financial Report Form Dialog */}
      <FinancialReportForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingReport(null);
        }}
        report={editingReport}
      />

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Budget {currentReport?.year || 'N/A'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currentReport ? formatCurrency(currentReport.total_produits) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Produits totaux</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              {currentReport && currentReport.resultat >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              Résultat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${currentReport && currentReport.resultat >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentReport ? formatCurrency(currentReport.resultat) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentReport && currentReport.resultat >= 0 ? 'Excédent' : 'Déficit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Réserves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currentReport ? formatCurrency(currentReport.reserves) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Fonds propres</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Trésorerie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {currentReport ? formatCurrency(currentReport.tresorerie) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Disponibilités</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="details">Compte de résultat</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="projects">Projets financés</TabsTrigger>
          <TabsTrigger value="donations">Collectes & Dons</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Year selector - sorted chronologically (oldest left, newest right) */}
          {reports && reports.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {[...reports].sort((a, b) => a.year - b.year).map(r => (
                <Badge 
                  key={r.id}
                  variant={selectedYear === r.year || (!selectedYear && r === currentReport) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedYear(r.year)}
                >
                  {r.year} {r.is_provisional && '(prév.)'}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Répartition des charges
                </CardTitle>
                <CardDescription>
                  {currentReport?.report_name} - Total: {currentReport ? formatCurrency(currentReport.total_charges) : '—'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chargesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chargesData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {chargesData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">Pas de données</p>
                )}
              </CardContent>
            </Card>

            {/* Income Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Sources de revenus
                </CardTitle>
                <CardDescription>
                  {currentReport?.report_name} - Total: {currentReport ? formatCurrency(currentReport.total_produits) : '—'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {produitsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={produitsData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {produitsData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">Pas de données</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Historical Comparison */}
          {comparisonData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Évolution sur plusieurs années</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Produits" fill="#10b981" />
                    <Bar dataKey="Charges" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Treasury Cashflow Chart */}
          {reports && reports.length > 0 && (
            <TreasuryCashflowChart reports={reports} />
          )}

          {/* Import/Export Section */}
          <FinanceImportExport 
            reports={reports || []} 
            onImport={(data) => createReportMutation.mutate(data)} 
            isAdmin={isAdmin} 
          />

          {/* Provisional Budget */}
          {provisionalReport && (
            <Card className="border-dashed border-2 border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Budget prévisionnel {provisionalReport.year}
                    </CardTitle>
                    <CardDescription>Projections pour l'année à venir</CardDescription>
                  </div>
                  <Badge variant="secondary">Prévisionnel</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(provisionalReport.total_produits)}</p>
                    <p className="text-sm text-muted-foreground">Produits prévus</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(provisionalReport.total_charges)}</p>
                    <p className="text-sm text-muted-foreground">Charges prévues</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${provisionalReport.resultat >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(provisionalReport.resultat)}
                    </p>
                    <p className="text-sm text-muted-foreground">Résultat prévu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Details Tab - Income Statement */}
        <TabsContent value="details" className="space-y-6">
          {currentReport ? (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Charges */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Charges
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span>Achats</span>
                    <span className="font-medium">{formatCurrency(currentReport.achats)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Services extérieurs</span>
                    <span className="font-medium">{formatCurrency(currentReport.services_exterieurs)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Autres services</span>
                    <span className="font-medium">{formatCurrency(currentReport.autres_services)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Charges de personnel</span>
                    <span className="font-medium">{formatCurrency(currentReport.charges_personnel)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Charges financières</span>
                    <span className="font-medium">{formatCurrency(currentReport.charges_financieres)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Dotations aux amortissements</span>
                    <span className="font-medium">{formatCurrency(currentReport.dotations_amortissements)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-lg">
                    <span>Total Charges</span>
                    <span className="text-red-600">{formatCurrency(currentReport.total_charges)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Produits */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Produits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span>Ventes / Prestations</span>
                    <span className="font-medium">{formatCurrency(currentReport.ventes_prestations)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Subventions</span>
                    <span className="font-medium">{formatCurrency(currentReport.subventions)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Dons / Cotisations</span>
                    <span className="font-medium">{formatCurrency(currentReport.dons_cotisations)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Produits financiers</span>
                    <span className="font-medium">{formatCurrency(currentReport.produits_financiers)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>Autres produits</span>
                    <span className="font-medium">{formatCurrency(currentReport.autres_produits)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-lg">
                    <span>Total Produits</span>
                    <span className="text-green-600">{formatCurrency(currentReport.total_produits)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Result */}
              <Card className="md:col-span-2">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Résultat Net</span>
                    <span className={`text-3xl font-bold ${currentReport.resultat >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(currentReport.resultat)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Aucun rapport financier disponible
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <FinancialDocuments />
        </TabsContent>

        {/* Funding Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {fundingProjects.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Projets actifs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stats.activeProjects}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      Total collecté
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalFunded)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Contributeurs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stats.totalSupporters}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {fundingProjects.map(project => (
                  <Card key={project.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progression</span>
                          <span className="font-medium">
                            {formatCurrency(project.funded_amount || 0)} / {formatCurrency(project.funding_goal || 0)}
                          </span>
                        </div>
                        <Progress 
                          value={((project.funded_amount || 0) / (project.funding_goal || 1)) * 100} 
                          className="h-2"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{project.supporter_count || 0} contributeurs</span>
                        <Link 
                          to={`/projects`}
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          Voir le projet <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <HandHeart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Aucun projet de financement actif</p>
                <Link to="/projects">
                  <Button variant="outline">
                    Créer un projet de financement
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Donations Tab */}
        <TabsContent value="donations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HandHeart className="h-5 w-5" />
                Faire un don
              </CardTitle>
              <CardDescription>
                Soutenez nos actions en faisant un don via HelloAsso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a 
                  href="https://www.helloasso.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Faire un don <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </HubPageLayout>
  );
};

export default Finance;
