import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, FabricImage, Rect, util } from 'fabric';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { X, RotateCcw, Check, Upload, ZoomIn, ZoomOut, Crop } from 'lucide-react';
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

  const loadImageFromUrl = (url: string, canvas: FabricCanvas) => {
    console.log('Loading image from URL:', url);
    
    if (!url) {
      console.log('No URL provided');
      return;
    }

    util.loadImage(url, { crossOrigin: 'anonymous' })
      .then((img) => {
        console.log('Image loaded successfully:', img);
        
        const fabricImg = new FabricImage(img, {
          selectable: true,
          moveable: true,
          scalable: true,
        });

        console.log('FabricImage created:', fabricImg);

        // Scale image to fit canvas
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const imgWidth = fabricImg.width!;
        const imgHeight = fabricImg.height!;

        console.log('Canvas dimensions:', canvasWidth, 'x', canvasHeight);
        console.log('Image dimensions:', imgWidth, 'x', imgHeight);

        const scaleX = canvasWidth / imgWidth;
        const scaleY = canvasHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY, 1);

        console.log('Scale calculated:', scale);

        fabricImg.scale(scale);
        
        // Center the image manually
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        fabricImg.set({
          left: (canvasWidth - scaledWidth) / 2,
          top: (canvasHeight - scaledHeight) / 2
        });

        console.log('Image positioned and scaled');

        canvas.clear();
        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.renderAll();
        setOriginalImage(fabricImg);
        
        console.log('Image added to canvas and set as active object');
        console.log('Image bounds:', fabricImg.getBoundingRect());
        toast.success('Image chargée !');
      })
      .catch((error) => {
        console.error('Error loading image:', error);
        toast.error('Erreur lors du chargement de l\'image: ' + error.message);
      });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !fabricCanvas) {
      console.log('No file selected or canvas not ready');
      return;
    }

    console.log('File selected:', file.name, file.type);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      console.log('File read as data URL, length:', imageUrl.length);
      loadImageFromUrl(imageUrl, fabricCanvas);
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast.error('Erreur lors de la lecture du fichier');
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
          <div className="flex-1 p-4 flex items-center justify-center bg-muted/20">
            <canvas
              ref={canvasRef}
              className="border border-border rounded-lg shadow-lg bg-background"
            />
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
                  accept="image/*"
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