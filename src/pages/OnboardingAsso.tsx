import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  User, 
  Building2, 
  FileText, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Upload,
  Instagram,
  Linkedin,
  Phone,
  MapPin
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const REGIONS = [
  { value: "savoie", label: "Savoie (73)" },
  { value: "haute-savoie", label: "Haute-Savoie (74)" },
  { value: "val-aoste", label: "Val d'Aoste (Italie)" },
  { value: "piemont", label: "Piémont (Italie)" },
  { value: "alpes-maritimes", label: "Alpes-Maritimes (06)" },
];

const STEPS = [
  { id: 1, title: "Votre profil", icon: User },
  { id: 2, title: "Votre association", icon: Building2 },
  { id: 3, title: "Documents", icon: FileText },
];

const OnboardingAsso = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [statutsFile, setStatutsFile] = useState<File | null>(null);

  // Profile data
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    region: "",
  });

  // Association data
  const [association, setAssociation] = useState({
    name: "",
    siret: "",
    rna: "",
    nafApe: "",
    instagramUrl: "",
    linkedinUrl: "",
  });

  // Load existing profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile({
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          phone: profileData.phone || "",
          region: profileData.region || "",
        });
      }
    };

    loadProfile();
  }, [user]);

  const progress = (currentStep / STEPS.length) * 100;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatutsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Veuillez uploader un fichier PDF");
        return;
      }
      setStatutsFile(file);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!profile.firstName || !profile.lastName || !profile.region) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }

      // Save profile
      if (user) {
        const { error } = await supabase
          .from("user_profiles")
          .update({
            first_name: profile.firstName,
            last_name: profile.lastName,
            phone: profile.phone,
            region: profile.region,
          })
          .eq("user_id", user.id);

        if (error) {
          toast.error("Erreur lors de la sauvegarde du profil");
          return;
        }
      }
    }

    if (currentStep === 2) {
      // Validate step 2
      if (!association.name) {
        toast.error("Le nom de l'association est obligatoire");
        return;
      }
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    if (!statutsFile) {
      toast.error("Veuillez uploader les statuts de votre association");
      return;
    }

    setIsLoading(true);

    try {
      let logoUrl = null;
      let statutsUrl = null;

      // Upload logo if provided
      if (logoFile) {
        const logoPath = `${user.id}/${Date.now()}-${logoFile.name}`;
        const { error: logoError } = await supabase.storage
          .from("association-logos")
          .upload(logoPath, logoFile);

        if (logoError) throw logoError;

        const { data: { publicUrl } } = supabase.storage
          .from("association-logos")
          .getPublicUrl(logoPath);

        logoUrl = publicUrl;
      }

      // Upload statuts
      const statutsPath = `${user.id}/${Date.now()}-${statutsFile.name}`;
      const { error: statutsError } = await supabase.storage
        .from("association-documents")
        .upload(statutsPath, statutsFile);

      if (statutsError) throw statutsError;

      statutsUrl = statutsPath; // Store the path, not the URL for private bucket

      // Create association
      const { error: assoError } = await supabase
        .from("associations")
        .insert({
          owner_id: user.id,
          name: association.name,
          siret: association.siret || null,
          rna: association.rna || null,
          naf_ape: association.nafApe || null,
          logo_url: logoUrl,
          instagram_url: association.instagramUrl || null,
          linkedin_url: association.linkedinUrl || null,
          statuts_url: statutsUrl,
        });

      if (assoError) throw assoError;

      toast.success("Association créée avec succès !");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="text-2xl font-bold text-primary">associacion</span>
            <span className="text-2xl font-semibold text-muted-foreground">.eu</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Configuration de votre espace</h1>
          <p className="text-muted-foreground">Quelques étapes pour démarrer</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <div 
                key={step.id}
                className={`flex items-center gap-2 text-sm ${
                  currentStep >= step.id ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > step.id 
                    ? "bg-secondary text-white" 
                    : currentStep === step.id 
                    ? "bg-primary text-white" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <Card className="border-border/50 shadow-xl">
          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Votre profil dirigeant
                </CardTitle>
                <CardDescription>
                  Ces informations nous aident à personnaliser votre expérience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      placeholder="Jean"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      placeholder="Dupont"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      className="pl-10"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Région *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <Select 
                      value={profile.region} 
                      onValueChange={(value) => setProfile({ ...profile, region: value })}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Sélectionnez votre région" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Association */}
          {currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Votre association
                </CardTitle>
                <CardDescription>
                  Informations de base de votre association
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assoName">Nom de l'association *</Label>
                  <Input
                    id="assoName"
                    placeholder="Association des amis de la montagne"
                    value={association.name}
                    onChange={(e) => setAssociation({ ...association, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siret">SIRET</Label>
                    <Input
                      id="siret"
                      placeholder="123 456 789 00012"
                      value={association.siret}
                      onChange={(e) => setAssociation({ ...association, siret: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rna">RNA</Label>
                    <Input
                      id="rna"
                      placeholder="W123456789"
                      value={association.rna}
                      onChange={(e) => setAssociation({ ...association, rna: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nafApe">Code NAF/APE</Label>
                  <Input
                    id="nafApe"
                    placeholder="94.99Z (Associations)"
                    value={association.nafApe}
                    onChange={(e) => setAssociation({ ...association, nafApe: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Généralement 94.99Z pour les associations loi 1901
                  </p>
                </div>

                {/* Logo upload */}
                <div className="space-y-2">
                  <Label>Logo de l'association</Label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-16 h-16 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border border-dashed border-border">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG jusqu'à 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social links */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="instagram"
                        placeholder="@votreasso"
                        className="pl-10"
                        value={association.instagramUrl}
                        onChange={(e) => setAssociation({ ...association, instagramUrl: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="linkedin"
                        placeholder="URL LinkedIn"
                        className="pl-10"
                        value={association.linkedinUrl}
                        onChange={(e) => setAssociation({ ...association, linkedinUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documents
                </CardTitle>
                <CardDescription>
                  Uploadez les documents officiels de votre association
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Statuts de l'association (PDF) *</Label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      statutsFile 
                        ? "border-secondary bg-secondary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {statutsFile ? (
                      <div className="flex items-center justify-center gap-2 text-secondary">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">{statutsFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-foreground font-medium mb-1">
                          Glissez votre fichier ici
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          ou cliquez pour sélectionner
                        </p>
                      </>
                    )}
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={handleStatutsChange}
                      className="max-w-xs mx-auto cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Les statuts sont nécessaires pour valider votre association. Fichier PDF uniquement.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between p-6 pt-0">
            {currentStep > 1 ? (
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
            ) : (
              <div />
            )}

            {currentStep < STEPS.length ? (
              <Button 
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90"
              >
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-secondary text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    Terminer
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingAsso;
