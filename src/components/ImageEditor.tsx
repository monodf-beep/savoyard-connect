import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Image as FabricImage, Rect, util, Circle as FabricCircle, Point } from 'fabric';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { X, RotateCcw, Check, Upload, ZoomIn, ZoomOut, Crop, Loader2, AlertCircle, RotateCw } from 'lucide-react';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewCircle, setPreviewCircle] = useState<any>(null);
  const [hasRendered, setHasRendered] = useState(false);
  const MAX_FILE_MB = 5;
  const ACCEPTED_TYPES = ['image/jpeg','image/jpg','image/png','image/webp'];

  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    console.log('Initializing canvas...');
    
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: '#ffffff',
      enableRetinaScaling: false,
      renderOnAddRemove: true,
      selection: true,
    });

    console.log('Canvas created:', canvas);
    setFabricCanvas(canvas);

    // Mark first render when Fabric has drawn something
    const onAfterRender = () => setHasRendered(true);
    canvas.on('after:render', onAfterRender);

    // Load initial image if provided
    if (initialImageUrl) {
      console.log('Loading initial image:', initialImageUrl);
      setHasRendered(false);
      setPreviewUrl(initialImageUrl);
      loadImageFromUrl(initialImageUrl, canvas);
    } else {
      console.log('No initial image URL provided');
    }

    return () => {
      console.log('Disposing canvas');
      canvas.off('after:render', onAfterRender);
      canvas.dispose();
    };
  }, [isOpen, initialImageUrl]);

  const loadImageFromUrl = async (url: string, canvas: FabricCanvas) => {
    console.log('Loading image from URL:', url);
    if (!url) return;

    setLoadError(null);
    setIsLoadingImage(true);
    setHasRendered(false);
    setPreviewUrl(url);

    try {
      // Try Fabric Image.fromURL first (v6 API)
      const fabricImg = await FabricImage.fromURL(url, {
        crossOrigin: !url.startsWith('data:') ? 'anonymous' : undefined,
      });

      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const intrinsicW = fabricImg.width || 1;
      const intrinsicH = fabricImg.height || 1;

      const padding = 20;
      const availableWidth = canvasWidth - padding * 2;
      const availableHeight = canvasHeight - padding * 2;

      const scaleX = availableWidth / intrinsicW;
      const scaleY = availableHeight / intrinsicH;
      const scale = Math.min(scaleX, scaleY, 1);

      fabricImg.set({
        originX: 'center',
        originY: 'center',
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        objectCaching: false,
        opacity: 1,
        visible: true,
        angle: 0,
      });

      // Reset viewport and zoom to avoid invisible content
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      setZoom([1]);

      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.add(fabricImg);
      canvas.setActiveObject(fabricImg);
      fabricImg.setCoords();
      canvas.centerObject(fabricImg);
      canvas.requestRenderAll();
      setTimeout(() => canvas.renderAll(), 0);
      console.log('Image bounding rect:', fabricImg.getBoundingRect());
      console.log('Image visible?', fabricImg.visible, 'opacity', fabricImg.opacity);

      setOriginalImage(fabricImg);
      addPreviewCircle(canvas);
      setIsLoadingImage(false);
      setHasRendered(true);
      toast.success('Image chargée !', {
        duration: 3000,
        dismissible: true,
        closeButton: true
      });
    } catch (e1) {
      console.warn('Fabric util.loadImage failed, trying native Image()', e1);
      try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          if (!url.startsWith('data:')) image.crossOrigin = 'anonymous';
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error("Impossible de charger l'image"));
          image.src = url;
        });

        const fabricImg = new FabricImage(img, {
          selectable: true,
          moveable: true,
          scalable: true,
        });

        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const intrinsicW = (img as HTMLImageElement).naturalWidth || (img as HTMLImageElement).width || 1;
        const intrinsicH = (img as HTMLImageElement).naturalHeight || (img as HTMLImageElement).height || 1;

        const padding = 20;
        const availableWidth = canvasWidth - padding * 2;
        const availableHeight = canvasHeight - padding * 2;

        const scaleX = availableWidth / intrinsicW;
        const scaleY = availableHeight / intrinsicH;
        const scale = Math.min(scaleX, scaleY, 1);
        fabricImg.scale(scale);

        fabricImg.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          originX: 'center',
          originY: 'center',
        });

        canvas.clear();
        canvas.backgroundColor = '#ffffff';
        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.centerObject(fabricImg);
        canvas.requestRenderAll();
        setOriginalImage(fabricImg);
        addPreviewCircle(canvas);
        setPreviewUrl(null);
        setIsLoadingImage(false);
        toast.success('Image chargée !', {
          duration: 3000,
          dismissible: true,
          closeButton: true
        });
      } catch (e2) {
        setIsLoadingImage(false);
        console.error('Both loaders failed', e2);
        const isExternal = /^https?:/i.test(url);
        if (isExternal) {
          try {
            const host = new URL(url).host;
            setLoadError(`Impossible de charger l'image depuis ${host}. Le site distant bloque le chargement (CORS / anti-hotlink). Téléchargez le fichier depuis votre ordinateur ou utilisez un lien accessible.`);
          } catch {
            setLoadError("Impossible de charger l'image distante (CORS / anti-hotlink).");
          }
        } else {
          setLoadError("Impossible de charger l'image. Fichier invalide.");
        }
        toast.error("Impossible de charger l'image. Essayez un autre fichier.");
      }
    }
  };

  const addPreviewCircle = (canvas: FabricCanvas) => {
    // Supprimer le cercle existant s'il y en a un
    if (previewCircle) {
      canvas.remove(previewCircle);
    }
    
    const circle = new FabricCircle({
      radius: 100,
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      originX: 'center',
      originY: 'center',
      fill: 'transparent',
      // Canvas 2D does not resolve CSS variables; use a concrete color string
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDashArray: [10, 5],
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    
    canvas.add(circle);
    setPreviewCircle(circle);
    canvas.renderAll();
  };

  React.useEffect(() => {
    if (fabricCanvas) {
      try {
        addPreviewCircle(fabricCanvas);
      } catch (e) {
        console.warn('Preview circle init failed', e);
      }
    }
  }, [fabricCanvas]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      const msg = `Fichier trop volumineux (max ${MAX_FILE_MB} Mo)`;
      setLoadError(msg);
      toast.error(msg);
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      const msg = 'Format non supporté. Formats acceptés: JPG, PNG, WebP';
      setLoadError(msg);
      toast.error(msg);
      return;
    }

    // Ensure canvas exists (race condition fix)
    let targetCanvas = fabricCanvas;
    if (!targetCanvas && canvasRef.current) {
      targetCanvas = new FabricCanvas(canvasRef.current, {
        width: 600,
        height: 400,
        backgroundColor: '#ffffff',
        enableRetinaScaling: false,
        renderOnAddRemove: true,
        selection: true,
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
      setPreviewUrl(imageUrl);
      setHasRendered(false);
      try {
        await loadImageFromUrl(imageUrl, targetCanvas!);
        console.log('Canvas objects after load:', targetCanvas!.getObjects().length);
      } catch (err) {
        console.error('Load image error', err);
        toast.error("Impossible de charger l'image.");
        setIsLoadingImage(false);
      } finally {
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
    const center = new Point(fabricCanvas.getWidth() / 2, fabricCanvas.getHeight() / 2);
    fabricCanvas.zoomToPoint(center, zoomLevel);
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
        addPreviewCircle(fabricCanvas);
        fabricCanvas.renderAll();
        
        setOriginalImage(newFabricImg);
        setIsCropMode(false);
        setCropRect(null);
        toast.success('Image recadrée !', {
          duration: 3000,
          dismissible: true,
          closeButton: true
        });
      });
  };

  const rotateImage = (angle: number) => {
    if (!fabricCanvas || !originalImage) return;
    const currentAngle = originalImage.angle || 0;
    originalImage.rotate(currentAngle + angle);
    fabricCanvas.renderAll();
  };

  const resetZoom = () => {
    if (!fabricCanvas) return;
    setZoom([1]);
    const center = new Point(fabricCanvas.getWidth() / 2, fabricCanvas.getHeight() / 2);
    fabricCanvas.zoomToPoint(center, 1);
    fabricCanvas.renderAll();
  };

  const clearImage = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    setOriginalImage(null);
    setHasRendered(false);
    try { addPreviewCircle(fabricCanvas); } catch {}
    fabricCanvas.renderAll();
  };
  const saveImage = () => {
    if (!fabricCanvas) {
      toast.error('Erreur lors de la sauvegarde: Canvas non initialisé', {
        duration: 4000,
        dismissible: true,
        closeButton: true
      });
      return;
    }

    try {
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 0.9,
        multiplier: 1,
      });

      if (!dataURL || dataURL === 'data:,') {
        throw new Error('Impossible de générer l\'image');
      }

      onSave(dataURL);
      toast.success('Image sauvegardée !', {
        duration: 3000,
        dismissible: true,
        closeButton: true
      });
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Erreur lors de la sauvegarde', {
        duration: 4000,
        dismissible: true,
        closeButton: true
      });
    }
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
              width={600}
              height={400}
              className="border border-border rounded-lg shadow-lg bg-background"
            />
            {previewUrl && !hasRendered && (
              <img
                src={previewUrl}
                alt="Aperçu"
                className="absolute inset-4 object-contain max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] pointer-events-none rounded-lg"
              />
            )}
            {!originalImage && !isLoadingImage && (
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
            {loadError && (
              <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
                <div className="max-w-md w-full bg-destructive/10 border border-destructive rounded-lg p-4 shadow">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive">Impossible de charger l'image</p>
                      <p className="mt-1 text-foreground/90">{loadError}</p>
                    </div>
                  </div>
                </div>
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
                <Button
                  onClick={clearImage}
                  variant="destructive"
                  className="w-full mt-2"
                  disabled={!originalImage}
                >
                  Supprimer l'image actuelle
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

              {/* Rotation controls */}
              <div>
                <Label className="text-sm font-medium">Rotation</Label>
                <div className="mt-2 flex gap-2">
                  <Button
                    onClick={() => rotateImage(-90)}
                    variant="outline"
                    className="flex-1"
                    disabled={!originalImage}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    90° gauche
                  </Button>
                  <Button
                    onClick={() => rotateImage(90)}
                    variant="outline"
                    className="flex-1"
                    disabled={!originalImage}
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    90° droite
                  </Button>
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
