import { useState, useEffect } from 'react';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Palette, Building2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const OrganizationSettings = () => {
  const { settings, updateSettings, uploadLogo, isUpdating } = useOrganizationSettings();
  
  const [name, setName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');

  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setPrimaryColor(settings.primary_color);
      setSecondaryColor(settings.secondary_color);
    }
  }, [settings]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo(file);
    }
  };

  const handleSave = () => {
    updateSettings({
      name,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    });
  };

  const hslToHex = (hsl: string) => {
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
    const lightness = l / 100;
    const saturation = s / 100;
    const a = saturation * Math.min(lightness, 1 - lightness);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Personnalisation</h1>
        <p className="text-muted-foreground">
          Configurez l'apparence de votre organisation
        </p>
      </div>

      <div className="space-y-6">
        {/* Nom de l'association */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Nom de l'association
            </CardTitle>
            <CardDescription>
              Ce nom apparaîtra dans la navigation et sur toutes les pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="org-name">Nom</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon Association"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Logo
            </CardTitle>
            <CardDescription>
              Téléchargez le logo de votre organisation (format PNG, JPG ou SVG)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings?.logo_url && (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Logo actuel</p>
                  <p className="text-xs text-muted-foreground">
                    Téléchargez un nouveau fichier pour le remplacer
                  </p>
                </div>
              </div>
            )}
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUpdating}
              />
            </div>
          </CardContent>
        </Card>

        {/* Couleurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Couleurs
            </CardTitle>
            <CardDescription>
              Personnalisez les couleurs principales de votre interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Couleur principale</Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="primary-color"
                  type="color"
                  value={hslToHex(primaryColor)}
                  onChange={(e) => setPrimaryColor(hexToHsl(e.target.value))}
                  className="w-20 h-10 cursor-pointer"
                />
                <div className="flex-1">
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="222.2 47.4% 11.2%"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format HSL (ex: 222.2 47.4% 11.2%)
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Couleur secondaire</Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="secondary-color"
                  type="color"
                  value={hslToHex(secondaryColor)}
                  onChange={(e) => setSecondaryColor(hexToHsl(e.target.value))}
                  className="w-20 h-10 cursor-pointer"
                />
                <div className="flex-1">
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="210 40% 96.1%"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format HSL (ex: 210 40% 96.1%)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex-1 text-center">
                <div
                  className="w-full h-16 rounded-md mb-2"
                  style={{ backgroundColor: hslToHex(primaryColor) }}
                />
                <p className="text-xs font-medium">Principale</p>
              </div>
              <div className="flex-1 text-center">
                <div
                  className="w-full h-16 rounded-md mb-2 border"
                  style={{ backgroundColor: hslToHex(secondaryColor) }}
                />
                <p className="text-xs font-medium">Secondaire</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (settings) {
                setName(settings.name);
                setPrimaryColor(settings.primary_color);
                setSecondaryColor(settings.secondary_color);
              }
            }}
          >
            Réinitialiser
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </div>
    </div>
  );
};
