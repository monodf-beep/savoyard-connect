import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FinancialReport } from '@/hooks/useFinancialReports';

interface TreasuryCashflowChartProps {
  reports: FinancialReport[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(value);
};

// Generate monthly data based on annual reports (simulated monthly distribution)
const generateMonthlyData = (reports: FinancialReport[]) => {
  const sortedReports = [...reports]
    .filter(r => !r.is_provisional)
    .sort((a, b) => a.year - b.year);

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const data: Array<{
    month: string;
    year: number;
    entrees: number;
    sorties: number;
    solde: number;
  }> = [];

  sortedReports.forEach((report) => {
    // Distribute annual amounts across months (simplified model)
    const monthlyProduits = report.total_produits / 12;
    const monthlyCharges = report.total_charges / 12;
    
    // Apply seasonal variations for more realistic data
    const seasonalFactors = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 0.8, 0.6, 1.3, 1.1, 1.0, 1.4];
    
    let runningBalance = report.tresorerie - report.resultat; // Estimate starting balance
    
    months.forEach((month, idx) => {
      const factor = seasonalFactors[idx];
      const entrees = Math.round(monthlyProduits * factor);
      const sorties = Math.round(monthlyCharges * factor);
      runningBalance += entrees - sorties;
      
      data.push({
        month: `${month} ${report.year}`,
        year: report.year,
        entrees,
        sorties,
        solde: Math.max(0, runningBalance),
      });
    });
  });

  // Return only last 24 months for readability
  return data.slice(-24);
};

export const TreasuryCashflowChart: React.FC<TreasuryCashflowChartProps> = ({ reports }) => {
  const monthlyData = generateMonthlyData(reports);
  
  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Évolution mensuelle de la trésorerie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Ajoutez des rapports financiers pour voir l'évolution
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals for the legend
  const totalEntrees = monthlyData.reduce((sum, d) => sum + d.entrees, 0);
  const totalSorties = monthlyData.reduce((sum, d) => sum + d.sorties, 0);
  const latestSolde = monthlyData[monthlyData.length - 1]?.solde || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Évolution mensuelle de la trésorerie
        </CardTitle>
        <CardDescription>
          Mouvements entrants et sortants sur les 24 derniers mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm font-medium">Entrées</span>
            </div>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {formatCurrency(totalEntrees)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ArrowDownRight className="h-4 w-4" />
              <span className="text-sm font-medium">Sorties</span>
            </div>
            <p className="text-lg font-bold text-red-700 dark:text-red-300">
              {formatCurrency(totalSorties)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Solde actuel</span>
            </div>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(latestSolde)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEntrees" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSorties" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSolde" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 10 }} 
              interval={2}
              className="text-muted-foreground"
            />
            <YAxis 
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10 }}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              labelClassName="font-semibold"
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="entrees" 
              name="Entrées"
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorEntrees)" 
            />
            <Area 
              type="monotone" 
              dataKey="sorties" 
              name="Sorties"
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#colorSorties)" 
            />
            <Area 
              type="monotone" 
              dataKey="solde" 
              name="Solde"
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorSolde)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          * Données mensuelles estimées à partir des rapports annuels
        </p>
      </CardContent>
    </Card>
  );
};
