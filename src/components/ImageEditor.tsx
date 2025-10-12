import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { X, Check, Upload, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
  initialImageUrl?: string;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  initialImageUrl
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState([1]);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const MAX_FILE_MB = 5;
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Dessiner l'image sur le canvas
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculer les dimensions pour centrer l'image
    const scale = Math.min(
      canvas.width / image.width,
      canvas.height / image.height
    ) * 0.9;

    const scaledWidth = image.width * scale * zoom[0];
    const scaledHeight = image.height * scale * zoom[0];
    const x = (canvas.width - scaledWidth) / 2 + panX;
    const y = (canvas.height - scaledHeight) / 2 + panY;

    // Dessiner l'image
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  };

  // Charger une image
  const loadImage = (url: string, silent = false) => {
    if (!url) return;

    setLoadError(null);
    setIsLoadingImage(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setImage(img);
      setZoom([1]);
      setPanX(0);
      setPanY(0);
      setIsLoadingImage(false);
      if (!silent) {
        toast.success('Image chargée !');
      }
    };

    img.onerror = () => {
      setIsLoadingImage(false);
      setLoadError("Impossible de charger l'image");
      toast.error("Impossible de charger l'image");
    };

    img.src = url;
  };

  // Charger l'image initiale
  useEffect(() => {
    if (isOpen && initialImageUrl) {
      loadImage(initialImageUrl, true);
    }
  }, [isOpen, initialImageUrl]);

  // Redessiner quand l'image, zoom ou pan change
  useEffect(() => {
    if (image) {
      drawCanvas();
    }
  }, [image, zoom, panX, panY]);

  // Upload de fichier
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Fichier trop volumineux (max ${MAX_FILE_MB} Mo)`);
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Format non supporté. Formats acceptés: JPG, PNG, WebP');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        loadImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Gestion du zoom
  const handleZoom = (value: number[]) => {
    setZoom(value);
  };

  // Gestion du drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Supprimer l'image
  const clearImage = () => {
    setImage(null);
    setZoom([1]);
    setPanX(0);
    setPanY(0);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Sauvegarder l'image
  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) {
      toast.error('Aucune image à sauvegarder');
      return;
    }

    try {
      const dataURL = canvas.toDataURL('image/png', 0.9);
      onSave(dataURL);
      toast.success('Image sauvegardée !');
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Éditeur d'image</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="flex-1 p-4 bg-muted/20 relative flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="border border-border rounded-lg shadow-lg bg-white cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            
            {!image && !isLoadingImage && (
              <div className="absolute inset-4 flex flex-col items-center justify-center text-center text-muted-foreground pointer-events-none">
                <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Aucune image chargée</p>
                <p className="text-sm">Utilisez le bouton "Choisir un fichier" pour commencer</p>
              </div>
            )}
            
            {isLoadingImage && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-sm">Chargement de l'image...</span>
              </div>
            )}
            
            {loadError && (
              <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
                <div className="max-w-md w-full bg-destructive/10 border border-destructive rounded-lg p-4 shadow">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive">Erreur</p>
                      <p className="mt-1 text-foreground/90">{loadError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-80 p-4 border-l border-border bg-card/50 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Charger une image</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(',')}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full mt-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choisir un fichier
                </Button>
                <Button
                  onClick={clearImage}
                  variant="destructive"
                  className="w-full mt-2"
                  disabled={!image}
                >
                  Supprimer l'image
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Formats: JPG, PNG, WebP • Max {MAX_FILE_MB} Mo
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Zoom</Label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(zoom[0] * 100)}%
                  </span>
                </div>
                <Slider
                  value={zoom}
                  onValueChange={handleZoom}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                  disabled={!image}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Glissez l'image pour la repositionner
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between p-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={saveImage} disabled={!image}>
            <Check className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
};
