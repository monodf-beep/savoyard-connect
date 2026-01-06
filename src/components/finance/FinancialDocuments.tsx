import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FileText, Download, Trash2, Upload, Plus, FileSpreadsheet, File } from 'lucide-react';

interface FinancialDocument {
  id: string;
  name: string;
  created_at: string;
  metadata: {
    year?: number;
    document_type?: string;
    original_name?: string;
  } | null;
}

interface FinancialDocumentsProps {
  isAdmin: boolean;
  years: number[];
}

const DOCUMENT_TYPES = [
  { value: 'bilan', label: 'Bilan comptable' },
  { value: 'compte_resultat', label: 'Compte de résultat' },
  { value: 'rapport_ag', label: 'Rapport AG' },
  { value: 'budget_previsionnel', label: 'Budget prévisionnel' },
  { value: 'autre', label: 'Autre document' },
];

export const FinancialDocuments = ({ isAdmin, years }: FinancialDocumentsProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch documents from storage
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['financial-documents'],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('financial-documents')
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      return (data || []).filter(f => !f.id.endsWith('/')) as FinancialDocument[];
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!selectedYear || !selectedType) {
        throw new Error('Veuillez sélectionner une année et un type de document');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedYear}_${selectedType}_${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('financial-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            year: selectedYear,
            document_type: selectedType,
            original_name: file.name,
          },
        });

      if (error) throw error;
      return fileName;
    },
    onSuccess: () => {
      toast.success('Document téléversé avec succès');
      queryClient.invalidateQueries({ queryKey: ['financial-documents'] });
      setDialogOpen(false);
      setSelectedYear('');
      setSelectedType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du téléversement');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage
        .from('financial-documents')
        .remove([fileName]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Document supprimé');
      queryClient.invalidateQueries({ queryKey: ['financial-documents'] });
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez PDF ou Excel.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 10 Mo)');
      return;
    }

    setUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setUploading(false);
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('financial-documents')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const getDocumentIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const parseFileName = (name: string) => {
    const parts = name.split('_');
    if (parts.length >= 2) {
      const year = parts[0];
      const type = parts[1];
      const typeLabel = DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
      return { year, typeLabel };
    }
    return { year: '', typeLabel: name };
  };

  // Group documents by year
  const groupedDocuments = documents.reduce((acc, doc) => {
    const { year } = parseFileName(doc.name);
    const key = year || 'Autres';
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {} as Record<string, FinancialDocument[]>);

  const sortedYears = Object.keys(groupedDocuments).sort((a, b) => {
    if (a === 'Autres') return 1;
    if (b === 'Autres') return -1;
    return Number(b) - Number(a);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents officiels
            </CardTitle>
            <CardDescription>
              Bilans, comptes de résultat et rapports d'assemblée générale
            </CardDescription>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Téléverser un document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Année</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une année" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                        {/* Add current and next year if not in list */}
                        {!years.includes(new Date().getFullYear()) && (
                          <SelectItem value={new Date().getFullYear().toString()}>
                            {new Date().getFullYear()}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type de document</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fichier (PDF ou Excel, max 10 Mo)</Label>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.xls,.xlsx"
                      onChange={handleFileSelect}
                      disabled={uploading || !selectedYear || !selectedType}
                    />
                  </div>
                  {uploading && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Upload className="h-4 w-4 animate-pulse" />
                      Téléversement en cours...
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : documents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucun document disponible
          </p>
        ) : (
          <div className="space-y-6">
            {sortedYears.map(year => (
              <div key={year}>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Badge variant="outline">{year}</Badge>
                </h4>
                <div className="space-y-2">
                  {groupedDocuments[year].map(doc => {
                    const { typeLabel } = parseFileName(doc.name);
                    return (
                      <div
                        key={doc.id || doc.name}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getDocumentIcon(doc.name)}
                          <div>
                            <p className="font-medium">{typeLabel}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={getPublicUrl(doc.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm('Supprimer ce document ?')) {
                                  deleteMutation.mutate(doc.name);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
