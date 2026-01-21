import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAssociation } from "@/hooks/useAssociation";
import { supabase } from "@/integrations/supabase/client";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Building2, Settings, Shield, Bell, Loader2, Save, Camera } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  region: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { associations } = useAssociation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      if (data) {
        setProfile(data);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
        setRegion(data.region || "");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: user.id,
          first_name: firstName || null,
          last_name: lastName || null,
          phone: phone || null,
          region: region || null,
        });

      if (error) throw error;

      toast.success(t("profile.saved"));
      fetchProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(t("profile.saveError"));
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (email: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return email?.substring(0, 2).toUpperCase() || "U";
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "admin":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "gestionnaire":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (authLoading || loading) {
    return (
      <HubPageLayout title={t("profile.title")} loading>
        <div />
      </HubPageLayout>
    );
  }

  return (
    <HubPageLayout
      title={t("profile.title")}
      subtitle={t("profile.subtitle")}
      breadcrumb={t("profile.breadcrumb")}
    >
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 px-1 sm:px-0">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6 pb-4">
            <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20 md:h-24 md:w-24">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-xl md:text-2xl bg-primary/10 text-primary">
                    {getInitials(user?.email || "")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-7 w-7 md:h-8 md:w-8 rounded-full"
                  disabled
                >
                  <Camera className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-lg md:text-xl font-semibold text-foreground">
                  {firstName && lastName ? `${firstName} ${lastName}` : user?.email}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground break-all">{user?.email}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {t("profile.memberSince")} {new Date(user?.created_at || "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <User className="h-4 w-4 md:h-5 md:w-5" />
              {t("profile.personalInfo")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">{t("profile.personalInfoDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="firstName" className="text-sm">{t("profile.firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("profile.firstNamePlaceholder")}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="lastName" className="text-sm">{t("profile.lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("profile.lastNamePlaceholder")}
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="phone" className="text-sm">{t("profile.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("profile.phonePlaceholder")}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="region" className="text-sm">{t("profile.region")}</Label>
                <Input
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder={t("profile.regionPlaceholder")}
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Associations */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Building2 className="h-4 w-4 md:h-5 md:w-5" />
              {t("profile.myAssociations")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">{t("profile.myAssociationsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {associations.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {associations.map((asso: any) => (
                  <div
                    key={asso.id || asso.association_id}
                    className="flex items-center justify-between p-2.5 md:p-3 bg-muted/30 rounded-lg border border-border gap-2"
                  >
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                        <AvatarImage src={asso.logo_url || asso.associations?.logo_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm">
                          {(asso.name || asso.associations?.name || "A").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-sm md:text-base text-foreground truncate">{asso.name || asso.associations?.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{asso.domain || asso.associations?.domain}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getRoleBadgeColor(asso.role || "member")} text-xs flex-shrink-0`}>
                      {asso.role}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4 md:py-6 text-sm">
                {t("profile.noAssociations")}
              </p>
            )}
            <Separator className="my-3 md:my-4" />
            <Button variant="outline" asChild className="w-full h-10">
              <Link to="/onboarding-asso">{t("profile.addAssociation")}</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              {t("profile.preferences")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">{t("profile.preferencesDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t("profile.preferencesComingSoon")}
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Shield className="h-4 w-4 md:h-5 md:w-5" />
              {t("profile.security")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">{t("profile.securityDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="h-10 text-sm">
              <Link to="/forgot-password">{t("profile.changePassword")}</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pb-4">
          <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto min-w-[150px] h-11">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("profile.save")}
              </>
            )}
          </Button>
        </div>
      </div>
    </HubPageLayout>
  );
};

export default Profile;
