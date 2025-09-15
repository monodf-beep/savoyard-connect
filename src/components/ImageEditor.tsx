import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, FabricImage, Rect, util } from 'fabric';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { X, RotateCcw, Check, Upload, ZoomIn, ZoomOut, Crop, Loader2 } from 'lucide-react';
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
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropRect, setCropRect] = useState<Rect | null>(null);
  const [originalImage, setOriginalImage] = useState<FabricImage | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const MAX_FILE_MB = 5;
  const ACCEPTED_TYPES = ['image/jpeg','image/png','image/webp'];

  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    console.log('Initializing canvas...');
    
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: '#f8f9fa',
    });

    console.log('Canvas created:', canvas);
    setFabricCanvas(canvas);

    // Load initial image if provided
    if (initialImageUrl) {
      console.log('Loading initial image:', initialImageUrl);
      loadImageFromUrl(initialImageUrl, canvas);
    } else {
      console.log('No initial image URL provided');
    }

    return () => {
      console.log('Disposing canvas');
      canvas.dispose();
    };
  }, [isOpen, initialImageUrl]);

  const loadImageFromUrl = async (url: string, canvas: FabricCanvas) => {
    console.log('Loading image from URL:', url);
    if (!url) return;

    // Prefer native Image() to avoid edge cases with util.loadImage and data URLs
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      // Only set crossOrigin for non-data URLs
      if (!url.startsWith('data:')) image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = (e) => reject(new Error('Impossible de charger l\'image'));
      image.src = url;
    });

    const fabricImg = new FabricImage(img, {
      selectable: true,
      moveable: true,
      scalable: true,
    });

    // Scale image to fit canvas while maintaining aspect ratio
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const imgWidth = fabricImg.width!;
    const imgHeight = fabricImg.height!;

    const padding = 20;
    const availableWidth = canvasWidth - padding * 2;
    const availableHeight = canvasHeight - padding * 2;

    const scaleX = availableWidth / imgWidth;
    const scaleY = availableHeight / imgHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    fabricImg.scale(scale);

    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    fabricImg.set({
      left: (canvasWidth - scaledWidth) / 2,
      top: (canvasHeight - scaledHeight) / 2,
      originX: 'left',
      originY: 'top',
    });

    // Clear canvas and add image
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    canvas.add(fabricImg);
    canvas.setActiveObject(fabricImg);
    canvas.centerObject(fabricImg);
    canvas.requestRenderAll();
    setOriginalImage(fabricImg);
    toast.success('Image chargée !');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate size and type
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Fichier trop volumineux (max ${MAX_FILE_MB} Mo)`);
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Format non supporté. Formats acceptés: JPG, PNG, WebP');
      return;
    }

    // Ensure canvas exists (race condition fix)
    let targetCanvas = fabricCanvas;
    if (!targetCanvas && canvasRef.current) {
      targetCanvas = new FabricCanvas(canvasRef.current, {
        width: 600,
        height: 400,
        backgroundColor: '#f8f9fa',
      });
      setFabricCanvas(targetCanvas);
    }
    if (!targetCanvas) {
      toast.error('Canvas non prêt. Réessayez.');
      return;
    }

    setIsLoadingImage(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      try {
        await loadImageFromUrl(imageUrl, targetCanvas!);
      } finally {
        setIsLoadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      setIsLoadingImage(false);
      toast.error('Erreur lors de la lecture du fichier');
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const enableCropMode = () => {
    if (!fabricCanvas || !originalImage) return;
    
    setIsCropMode(true);
    
    // Create crop rectangle
    const rect = new Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 200,
      fill: 'transparent',
      stroke: '#007bff',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: true,
      moveable: true,
      scalable: true,
    });

    fabricCanvas.add(rect);
    setCropRect(rect);
    fabricCanvas.setActiveObject(rect);
    fabricCanvas.renderAll();
  };

  const applyCrop = () => {
    if (!fabricCanvas || !cropRect || !originalImage) return;

    const cropX = cropRect.left!;
    const cropY = cropRect.top!;
    const cropWidth = cropRect.width! * cropRect.scaleX!;
    const cropHeight = cropRect.height! * cropRect.scaleY!;

    // Create a new canvas for cropping
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return;

    // Get the original image element
    const imgElement = originalImage.getElement() as HTMLImageElement;
    
    // Calculate crop coordinates relative to the image
    const imageLeft = originalImage.left!;
    const imageTop = originalImage.top!;
    const imageScaleX = originalImage.scaleX!;
    const imageScaleY = originalImage.scaleY!;

    const srcX = (cropX - imageLeft) / imageScaleX;
    const srcY = (cropY - imageTop) / imageScaleY;
    const srcWidth = cropWidth / imageScaleX;
    const srcHeight = cropHeight / imageScaleY;

    tempCtx.drawImage(
      imgElement,
      srcX, srcY, srcWidth, srcHeight,
      0, 0, cropWidth, cropHeight
    );

    // Create new fabric image from cropped canvas
    util.loadImage(tempCanvas.toDataURL())
      .then((croppedImg) => {
        const newFabricImg = new FabricImage(croppedImg, {
          selectable: true,
          moveable: true,
          scalable: true,
        });

        // Center the cropped image
        newFabricImg.set({
          left: (fabricCanvas.getWidth() - newFabricImg.width!) / 2,
          top: (fabricCanvas.getHeight() - newFabricImg.height!) / 2
        });
        fabricCanvas.clear();
        fabricCanvas.add(newFabricImg);
        fabricCanvas.renderAll();
        
        setOriginalImage(newFabricImg);
        setIsCropMode(false);
        setCropRect(null);
        toast.success('Image recadrée !');
      });
  };

  const resetZoom = () => {
    if (!fabricCanvas) return;
    setZoom([1]);
    fabricCanvas.setZoom(1);
    fabricCanvas.renderAll();
  };

  const saveImage = () => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 0.9,
      multiplier: 1,
    });

    onSave(dataURL);
    toast.success('Image sauvegardée !');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Éditeur d'image</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Canvas area */}
          <div className="flex-1 p-4 bg-muted/20 relative flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="border border-border rounded-lg shadow-lg bg-background"
            />
            {!originalImage && (
              <div className="absolute inset-4 flex flex-col items-center justify-center text-center text-muted-foreground pointer-events-none">
                <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Aucune image chargée</p>
                <p className="text-sm">Utilisez le bouton \"Choisir un fichier\" pour commencer</p>
              </div>
            )}
            {isLoadingImage && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                <span className="text-sm">Chargement de l'image...</span>
              </div>
            )}
          </div>

          {/* Controls panel */}
          <div className="w-80 p-4 border-l border-border bg-card/50 overflow-y-auto">
            <div className="space-y-6">
              {/* Upload */}
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
                <p className="text-xs text-muted-foreground mt-2">
                  Formats: JPG, PNG, WebP • Max {MAX_FILE_MB} Mo
                </p>
              </div>

              {/* Zoom controls */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Zoom</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleZoom([Math.max(0.1, zoom[0] - 0.1)])}
                      variant="outline"
                      size="sm"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleZoom([Math.min(3, zoom[0] + 0.1)])}
                      variant="outline"
                      size="sm"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={resetZoom}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Slider
                  value={zoom}
                  onValueChange={handleZoom}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {Math.round(zoom[0] * 100)}%
                </div>
              </div>

              {/* Crop controls */}
              <div>
                <Label className="text-sm font-medium">Recadrage</Label>
                <div className="mt-2 space-y-2">
                  {!isCropMode ? (
                    <Button
                      onClick={enableCropMode}
                      variant="outline"
                      className="w-full"
                      disabled={!originalImage}
                    >
                      <Crop className="w-4 h-4 mr-2" />
                      Activer le recadrage
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={applyCrop}
                        className="w-full"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Appliquer le recadrage
                      </Button>
                      <Button
                        onClick={() => {
                          if (cropRect && fabricCanvas) {
                            fabricCanvas.remove(cropRect);
                            setCropRect(null);
                            setIsCropMode(false);
                            fabricCanvas.renderAll();
                          }
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Annuler
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
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
