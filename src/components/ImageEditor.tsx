import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Image as FabricImage, Circle as FabricCircle } from 'fabric';
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
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [zoom, setZoom] = useState([1]);
  const [originalImage, setOriginalImage] = useState<FabricImage | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const MAX_FILE_MB = 5;
  const ACCEPTED_TYPES = ['image/jpeg','image/jpg','image/png','image/webp'];

  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    console.log('Initializing canvas...');
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: '#ffffff',
    });

    setFabricCanvas(canvas);
    console.log('Canvas initialized');

    // Load initial image if provided
    if (initialImageUrl) {
      console.log('Loading initial image:', initialImageUrl);
      loadImage(initialImageUrl, canvas, true);
    }

    return () => {
      console.log('Disposing canvas');
      canvas.dispose();
    };
  }, [isOpen, initialImageUrl]);

  const loadImage = async (url: string, canvas: FabricCanvas, silent = false) => {
    console.log('loadImage called with:', url);
    if (!url) return;

    setLoadError(null);
    setIsLoadingImage(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        console.log('Image loaded successfully');
        const fabricImg = new FabricImage(img);
        
        // Scale image to fit canvas
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const imgWidth = img.width;
        const imgHeight = img.height;

        const scale = Math.min(
          (canvasWidth - 40) / imgWidth,
          (canvasHeight - 40) / imgHeight
        );

        fabricImg.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
        });

        canvas.clear();
        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.renderAll();

        setOriginalImage(fabricImg);
        setIsLoadingImage(false);

        if (!silent) {
          toast.success('Image chargée !');
        }
        console.log('Image added to canvas');
      };

      img.onerror = () => {
        console.error('Failed to load image');
        setIsLoadingImage(false);
        setLoadError("Impossible de charger l'image");
        toast.error("Impossible de charger l'image");
      };

      img.src = url;
    } catch (error) {
      console.error('Error loading image:', error);
      setIsLoadingImage(false);
      setLoadError("Erreur lors du chargement");
      toast.error("Erreur lors du chargement");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) return;

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
        loadImage(result, fabricCanvas);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleZoom = (value: number[]) => {
    if (!fabricCanvas) return;
    const zoomLevel = value[0];
    setZoom(value);
    fabricCanvas.setZoom(zoomLevel);
    fabricCanvas.renderAll();
  };

  const clearImage = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    setOriginalImage(null);
    fabricCanvas.renderAll();
  };

  const saveImage = () => {
    if (!fabricCanvas) {
      toast.error('Aucune image à sauvegarder');
      return;
    }

    try {
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 0.9,
        multiplier: 1,
      });

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
              className="border border-border rounded-lg shadow-lg bg-white"
            />
            
            {!originalImage && !isLoadingImage && (
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
                  disabled={!originalImage}
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
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between p-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={saveImage} disabled={!originalImage}>
            <Check className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
};