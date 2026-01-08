import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  FileText, 
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Transparence financière</h1>
            <p className="text-muted-foreground">
              Consultez les comptes de l'Institut de la Langue Savoyarde en toute transparence
            </p>
          </div>
          {isAdmin && (
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
          )}
        </div>

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
                      <p className="text-sm text-muted-foreground">Résultat attendu</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="details" className="space-y-6">
            {currentReport && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Charges Detail */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Charges ({currentReport.year})</CardTitle>
                    <CardDescription>{currentReport.report_name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Achats', value: currentReport.achats, icon: Building },
                      { label: 'Services extérieurs', value: currentReport.services_exterieurs, icon: FileText },
                      { label: 'Autres services extérieurs', value: currentReport.autres_services, icon: FileText },
                      { label: 'Charges de personnel', value: currentReport.charges_personnel, icon: Users },
                      { label: 'Charges financières', value: currentReport.charges_financieres, icon: Euro },
                      { label: 'Dotations aux amortissements', value: currentReport.dotations_amortissements, icon: TrendingDown },
                    ].filter(item => item.value > 0).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span>{item.label}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-4 border-t-2 font-bold">
                      <span>TOTAL CHARGES</span>
                      <span className="text-red-600">{formatCurrency(currentReport.total_charges)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Produits Detail */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Produits ({currentReport.year})</CardTitle>
                    <CardDescription>{currentReport.report_name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'Ventes & Prestations', value: currentReport.ventes_prestations, icon: TrendingUp },
                      { label: 'Subventions', value: currentReport.subventions, icon: Building },
                      { label: 'Dons & Cotisations', value: currentReport.dons_cotisations, icon: HandHeart },
                      { label: 'Produits financiers', value: currentReport.produits_financiers, icon: Euro },
                    ].filter(item => item.value > 0).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span>{item.label}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-4 border-t-2 font-bold">
                      <span>TOTAL PRODUITS</span>
                      <span className="text-green-600">{formatCurrency(currentReport.total_produits)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Bilan */}
                {(currentReport.total_actif > 0 || currentReport.reserves > 0) && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Bilan simplifié ({currentReport.year})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold mb-4 text-lg">Actif</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total actif</span>
                              <span className="font-medium">{formatCurrency(currentReport.total_actif)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>dont trésorerie</span>
                              <span>{formatCurrency(currentReport.tresorerie)}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-4 text-lg">Passif</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Dettes</span>
                              <span className="font-medium">{formatCurrency(currentReport.total_passif)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Réserves (fonds propres)</span>
                              <span className="font-medium text-green-600">{formatCurrency(currentReport.reserves)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <FinancialDocuments 
              isAdmin={isAdmin} 
              years={reports?.map(r => r.year) || [2023, 2024, 2025, 2026]} 
            />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fundingProjects.length === 0 ? (
                <Card className="md:col-span-2 lg:col-span-3">
                  <CardContent className="py-12 text-center">
                    <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun projet de financement actif</p>
                  </CardContent>
                </Card>
              ) : (
                fundingProjects.map(project => {
                  const progress = project.funding_goal > 0 
                    ? (project.funded_amount / project.funding_goal) * 100 
                    : 0;
                  return (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        {project.description && (
                          <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{formatCurrency(project.funded_amount)}</span>
                            <span className="text-muted-foreground">sur {formatCurrency(project.funding_goal)}</span>
                          </div>
                          <Progress value={Math.min(progress, 100)} />
                          <p className="text-sm text-muted-foreground text-center">
                            {progress.toFixed(0)}% financé • {project.supporter_count} soutiens
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
            
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link to="/">
                  Voir le tableau de bord complet
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total collecté</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalCollected)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Nombre de soutiens</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.totalSupporters}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Projets financés</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.fundedProjectsCount} / {stats.totalProjects}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HandHeart className="h-5 w-5" />
                  Comment nous soutenir ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  L'Institut de la Langue Savoyarde est une association loi 1901. Vos dons sont déductibles des impôts à hauteur de 66%.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <a href="https://www.helloasso.com/associations/institut-de-la-langue-savoyarde" target="_blank" rel="noopener noreferrer">
                      Faire un don sur HelloAsso
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/contributors">
                      Devenir adhérent
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Finance;
