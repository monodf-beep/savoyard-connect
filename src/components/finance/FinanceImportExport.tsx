import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialReport } from '@/hooks/useFinancialReports';

interface FinanceImportExportProps {
  reports: FinancialReport[];
  onImport: (data: Partial<FinancialReport>) => void;
  isAdmin: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
};

export const FinanceImportExport: React.FC<FinanceImportExportProps> = ({
  reports,
  onImport,
  isAdmin,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (jsonData.length === 0) {
        toast.error('Le fichier est vide');
        return;
      }

      // Map Excel columns to report fields
      const row = jsonData[0] as Record<string, any>;
      const importedData: Partial<FinancialReport> = {
        year: Number(row['Année'] || row['year'] || new Date().getFullYear()),
        report_name: row['Nom du rapport'] || row['report_name'] || 'Rapport importé',
        achats: Number(row['Achats'] || row['achats'] || 0),
        services_exterieurs: Number(row['Services extérieurs'] || row['services_exterieurs'] || 0),
        autres_services: Number(row['Autres services'] || row['autres_services'] || 0),
        charges_personnel: Number(row['Charges de personnel'] || row['charges_personnel'] || 0),
        charges_financieres: Number(row['Charges financières'] || row['charges_financieres'] || 0),
        dotations_amortissements: Number(row['Dotations aux amortissements'] || row['dotations_amortissements'] || 0),
        ventes_prestations: Number(row['Ventes & Prestations'] || row['ventes_prestations'] || 0),
        subventions: Number(row['Subventions'] || row['subventions'] || 0),
        dons_cotisations: Number(row['Dons & Cotisations'] || row['dons_cotisations'] || 0),
        produits_financiers: Number(row['Produits financiers'] || row['produits_financiers'] || 0),
        autres_produits: Number(row['Autres produits'] || row['autres_produits'] || 0),
        total_actif: Number(row['Total Actif'] || row['total_actif'] || 0),
        total_passif: Number(row['Total Passif'] || row['total_passif'] || 0),
        reserves: Number(row['Réserves'] || row['reserves'] || 0),
        tresorerie: Number(row['Trésorerie'] || row['tresorerie'] || 0),
        notes: row['Notes'] || row['notes'] || '',
        is_provisional: Boolean(row['Prévisionnel'] || row['is_provisional']),
      };

      // Calculate totals
      importedData.total_charges = 
        (importedData.achats || 0) +
        (importedData.services_exterieurs || 0) +
        (importedData.autres_services || 0) +
        (importedData.charges_personnel || 0) +
        (importedData.charges_financieres || 0) +
        (importedData.dotations_amortissements || 0);

      importedData.total_produits = 
        (importedData.ventes_prestations || 0) +
        (importedData.subventions || 0) +
        (importedData.dons_cotisations || 0) +
        (importedData.produits_financiers || 0) +
        (importedData.autres_produits || 0);

      importedData.resultat = importedData.total_produits - importedData.total_charges;

      onImport(importedData);
      toast.success('Données importées avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'import du fichier');
      console.error(error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const exportToExcel = () => {
    if (reports.length === 0) {
      toast.error('Aucun rapport à exporter');
      return;
    }

    const exportData = reports.map(r => ({
      'Année': r.year,
      'Nom du rapport': r.report_name,
      'Prévisionnel': r.is_provisional ? 'Oui' : 'Non',
      'Achats': r.achats,
      'Services extérieurs': r.services_exterieurs,
      'Autres services': r.autres_services,
      'Charges de personnel': r.charges_personnel,
      'Charges financières': r.charges_financieres,
      'Dotations aux amortissements': r.dotations_amortissements,
      'Total Charges': r.total_charges,
      'Ventes & Prestations': r.ventes_prestations,
      'Subventions': r.subventions,
      'Dons & Cotisations': r.dons_cotisations,
      'Produits financiers': r.produits_financiers,
      'Autres produits': r.autres_produits,
      'Total Produits': r.total_produits,
      'Résultat': r.resultat,
      'Total Actif': r.total_actif,
      'Total Passif': r.total_passif,
      'Réserves': r.reserves,
      'Trésorerie': r.tresorerie,
      'Notes': r.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapports financiers');
    XLSX.writeFile(workbook, `rapports-financiers-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Export Excel téléchargé');
  };

  const exportToPDF = async (report: FinancialReport) => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('RAPPORT FINANCIER', pageWidth / 2, 25, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text(`Exercice ${report.year}`, pageWidth / 2, 35, { align: 'center' });
      
      if (report.is_provisional) {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(12);
        doc.text('(Prévisionnel)', pageWidth / 2, 42, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(report.report_name, pageWidth / 2, 50, { align: 'center' });

      // Compte de résultat
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPTE DE RÉSULTAT', 14, 65);

      // Charges table
      autoTable(doc, {
        startY: 70,
        head: [['CHARGES', 'Montant']],
        body: [
          ['Achats', formatCurrency(report.achats)],
          ['Services extérieurs', formatCurrency(report.services_exterieurs)],
          ['Autres services extérieurs', formatCurrency(report.autres_services)],
          ['Charges de personnel', formatCurrency(report.charges_personnel)],
          ['Charges financières', formatCurrency(report.charges_financieres)],
          ['Dotations aux amortissements', formatCurrency(report.dotations_amortissements)],
        ],
        foot: [['TOTAL CHARGES', formatCurrency(report.total_charges)]],
        theme: 'striped',
        headStyles: { fillColor: [220, 53, 69] },
        footStyles: { fillColor: [220, 53, 69], fontStyle: 'bold' },
        margin: { left: 14, right: pageWidth / 2 + 5 },
        tableWidth: pageWidth / 2 - 19,
      });

      // Produits table
      autoTable(doc, {
        startY: 70,
        head: [['PRODUITS', 'Montant']],
        body: [
          ['Ventes & Prestations', formatCurrency(report.ventes_prestations)],
          ['Subventions', formatCurrency(report.subventions)],
          ['Dons & Cotisations', formatCurrency(report.dons_cotisations)],
          ['Produits financiers', formatCurrency(report.produits_financiers)],
          ['Autres produits', formatCurrency(report.autres_produits)],
          ['', ''],
        ],
        foot: [['TOTAL PRODUITS', formatCurrency(report.total_produits)]],
        theme: 'striped',
        headStyles: { fillColor: [40, 167, 69] },
        footStyles: { fillColor: [40, 167, 69], fontStyle: 'bold' },
        margin: { left: pageWidth / 2 + 5, right: 14 },
        tableWidth: pageWidth / 2 - 19,
      });

      // Résultat
      const resultY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const resultColor = report.resultat >= 0 ? [40, 167, 69] : [220, 53, 69];
      doc.setTextColor(resultColor[0], resultColor[1], resultColor[2]);
      doc.text(`RÉSULTAT : ${formatCurrency(report.resultat)}`, pageWidth / 2, resultY, { align: 'center' });
      doc.setTextColor(0, 0, 0);

      // Bilan simplifié
      if (report.total_actif > 0 || report.reserves > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('BILAN SIMPLIFIÉ', 14, resultY + 20);

        autoTable(doc, {
          startY: resultY + 25,
          body: [
            ['Total Actif', formatCurrency(report.total_actif), 'Total Passif', formatCurrency(report.total_passif)],
            ['dont Trésorerie', formatCurrency(report.tresorerie), 'Réserves', formatCurrency(report.reserves)],
          ],
          theme: 'grid',
        });
      }

      // Notes
      if (report.notes) {
        const notesY = (doc as any).lastAutoTable?.finalY + 15 || resultY + 30;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Notes :', 14, notesY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitNotes = doc.splitTextToSize(report.notes, pageWidth - 28);
        doc.text(splitNotes, 14, notesY + 7);
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Document généré le ${new Date().toLocaleDateString('fr-FR')} - Assemblée Générale`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );

      doc.save(`rapport-financier-${report.year}.pdf`);
      toast.success('PDF téléchargé');
    } catch (error) {
      toast.error('Erreur lors de la génération du PDF');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [{
      'Année': new Date().getFullYear(),
      'Nom du rapport': 'Rapport annuel',
      'Prévisionnel': 'Non',
      'Achats': 0,
      'Services extérieurs': 0,
      'Autres services': 0,
      'Charges de personnel': 0,
      'Charges financières': 0,
      'Dotations aux amortissements': 0,
      'Ventes & Prestations': 0,
      'Subventions': 0,
      'Dons & Cotisations': 0,
      'Produits financiers': 0,
      'Autres produits': 0,
      'Total Actif': 0,
      'Total Passif': 0,
      'Réserves': 0,
      'Trésorerie': 0,
      'Notes': '',
    }];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Modèle');
    XLSX.writeFile(workbook, 'modele-rapport-financier.xlsx');
    toast.success('Modèle téléchargé');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import / Export
        </CardTitle>
        <CardDescription>
          Importez des données depuis Excel/CSV ou exportez les rapports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdmin && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Import de données</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Importer Excel/CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger modèle
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Export des rapports</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            {reports.slice(0, 3).map(report => (
              <Button
                key={report.id}
                variant="ghost"
                size="sm"
                onClick={() => exportToPDF(report)}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                PDF {report.year}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
