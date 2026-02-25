import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose,
} from "@/components/ui/sheet";
import {
  Banknote, Clock, TrendingUp, Sparkles, Search, Building2,
  Calendar, Euro, ExternalLink, Share2, X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────
interface Subvention {
  id: number;
  titre: string;
  organisme: string;
  montant_max: string;
  deadline: string | null;
  public_cible: string;
  resume: string;
  lien_candidature: string;
  tags: string[];
  pertinence_culturelle: number;
  source: string;
  date_ajout: string;
}

// ── Helpers ────────────────────────────────────────────
const TAG_COLORS: Record<string, string> = {
  musique: "bg-purple-100 text-purple-700 border-purple-200",
  patrimoine: "bg-amber-100 text-amber-700 border-amber-200",
  numérique: "bg-blue-100 text-blue-700 border-blue-200",
  "spectacle vivant": "bg-pink-100 text-pink-700 border-pink-200",
  "arts visuels": "bg-emerald-100 text-emerald-700 border-emerald-200",
  cinéma: "bg-red-100 text-red-700 border-red-200",
  littérature: "bg-indigo-100 text-indigo-700 border-indigo-200",
  "éducation artistique": "bg-teal-100 text-teal-700 border-teal-200",
};

function tagColor(tag: string) {
  return TAG_COLORS[tag.toLowerCase()] ?? "bg-muted text-muted-foreground border-border";
}

function parseFrenchDate(d: string | null): Date | null {
  if (!d) return null;
  const parts = d.split("/");
  if (parts.length === 3) return new Date(+parts[2], +parts[1] - 1, +parts[0]);
  const iso = new Date(d);
  return isNaN(iso.getTime()) ? null : iso;
}

function deadlineColor(d: string | null): string {
  const date = parseFrenchDate(d);
  if (!date) return "text-muted-foreground";
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (days < 30) return "text-destructive";
  if (days < 90) return "text-orange-500";
  return "text-muted-foreground";
}

function daysUntil(d: string | null): number | null {
  const date = parseFrenchDate(d);
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

// ── Fetch ──────────────────────────────────────────────
async function fetchSubventions(): Promise<Subvention[]> {
  const res = await fetch("https://TON_URL_N8N_REEL/webhook/api/subventions");
  if (!res.ok) throw new Error("Fetch failed");
  const json = await res.json();
  return json.data ?? [];
}

// ── Filter options ─────────────────────────────────────
const THEMATIQUES = [
  "Tous", "Musique", "Patrimoine", "Numérique", "Spectacle vivant",
  "Arts visuels", "Cinéma", "Littérature", "Éducation artistique",
];

const TERRITOIRES = [
  "Tous", "National", "Auvergne-Rhône-Alpes", "Rhône", "Isère",
  "Ain", "Drôme", "Ardèche", "Savoie", "Haute-Savoie",
];

const TYPES = ["Tous", "Subvention", "Appel à projets", "Mécénat", "Résidence"];

// ── Component ──────────────────────────────────────────
export default function Subventions() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login", { replace: true });
  }, [authLoading, user, navigate]);

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["subventions"],
    queryFn: fetchSubventions,
    staleTime: 5 * 60_000,
    enabled: !!user,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [thematique, setThematique] = useState("Tous");
  const [territoire, setTerritoire] = useState("Tous");
  const [typeFinancement, setTypeFinancement] = useState("Tous");
  const [deadlineRange, setDeadlineRange] = useState("all");
  const [selected, setSelected] = useState<Subvention | null>(null);

  const resetFilters = () => {
    setSearch(""); setThematique("Tous"); setTerritoire("Tous");
    setTypeFinancement("Tous"); setDeadlineRange("all");
  };

  // AND‑logic filtering
  const filtered = useMemo(() => {
    return items.filter((s) => {
      // Search on titre, organisme, resume
      if (search) {
        const q = search.toLowerCase();
        const matchesSearch =
          s.titre.toLowerCase().includes(q) ||
          s.organisme.toLowerCase().includes(q) ||
          s.resume.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Thématique
      if (thematique !== "Tous") {
        const hasTag = s.tags.some(
          (t) => t.toLowerCase() === thematique.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // Territoire
      if (territoire !== "Tous") {
        const combined = `${s.public_cible} ${s.titre} ${s.resume} ${s.source}`.toLowerCase();
        if (!combined.includes(territoire.toLowerCase())) return false;
      }

      // Type de financement
      if (typeFinancement !== "Tous") {
        const combined = `${s.titre} ${s.resume} ${s.source}`.toLowerCase();
        if (!combined.includes(typeFinancement.toLowerCase())) return false;
      }

      // Deadline range
      if (deadlineRange !== "all") {
        const days = daysUntil(s.deadline);
        if (days === null) {
          if (deadlineRange !== "none") return false;
        } else {
          if (deadlineRange === "month" && days > 30) return false;
          if (deadlineRange === "3months" && days > 90) return false;
          if (deadlineRange === "none") return false;
        }
      }

      return true;
    });
  }, [items, search, thematique, territoire, typeFinancement, deadlineRange]);

  // Stats
  const stats = useMemo(() => {
    const deadlineThisMonth = items.filter((s) => {
      const d = daysUntil(s.deadline);
      return d !== null && d >= 0 && d <= 30;
    }).length;
    const amounts = items
      .map((s) => parseInt(s.montant_max?.replace(/\D/g, "") || "0"))
      .filter((n) => n > 0);
    const avgAmount = amounts.length
      ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length)
      : 0;
    const oneWeekAgo = Date.now() - 7 * 86_400_000;
    const addedThisWeek = items.filter(
      (s) => new Date(s.date_ajout).getTime() > oneWeekAgo
    ).length;
    return {
      total: items.length,
      deadlineThisMonth,
      avgAmount,
      addedThisWeek,
    };
  }, [items]);

  if (authLoading) return null;
  if (!user) return null;

  const handleShare = (s: Subvention) => {
    navigator.clipboard.writeText(s.lien_candidature || window.location.href);
    toast({ title: "Lien copié !" });
  };

  return (
    <HubPageLayout breadcrumb="Subventions & Appels à projets">
      <div className="space-y-6">
        {/* ── Header ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Subventions &amp; Appels à projets
            </h1>
            <p className="text-sm text-muted-foreground">
              Mise à jour chaque jour · {items.length} opportunités disponibles
            </p>
          </div>
          <Badge variant="secondary" className="self-start sm:self-center text-xs">
            Dernière mise à jour : aujourd'hui
          </Badge>
        </div>

        {/* ── Filters ────────────────────────────── */}
        <div className="sticky top-16 z-30 bg-background border-b border-border pb-4 pt-2 -mx-1 px-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une subvention..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={thematique} onValueChange={setThematique}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Thématique" /></SelectTrigger>
              <SelectContent>
                {THEMATIQUES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={territoire} onValueChange={setTerritoire}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Territoire" /></SelectTrigger>
              <SelectContent>
                {TERRITOIRES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={typeFinancement} onValueChange={setTypeFinancement}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>

            <ToggleGroup type="single" value={deadlineRange} onValueChange={(v) => v && setDeadlineRange(v)} className="hidden md:flex">
              <ToggleGroupItem value="all" className="text-xs">Tous</ToggleGroupItem>
              <ToggleGroupItem value="month" className="text-xs">Ce mois</ToggleGroupItem>
              <ToggleGroupItem value="3months" className="text-xs">3 mois</ToggleGroupItem>
              <ToggleGroupItem value="none" className="text-xs">Sans limite</ToggleGroupItem>
            </ToggleGroup>

            <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap">
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        {/* ── Stats row ──────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Total disponibles", value: stats.total, icon: Banknote, color: "text-primary" },
            { title: "Deadline ce mois", value: stats.deadlineThisMonth, icon: Clock, color: "text-orange-500" },
            { title: "Montant moyen", value: `${stats.avgAmount.toLocaleString("fr-FR")} €`, icon: TrendingUp, color: "text-green-600" },
            { title: "Ajoutés cette semaine", value: stats.addedThisWeek, icon: Sparkles, color: "text-purple-600" },
          ].map((s) => (
            <Card key={s.title}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Error ──────────────────────────────── */}
        {isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Impossible de charger les subventions. Réessayez plus tard.
          </div>
        )}

        {/* ── Loading skeleton ───────────────────── */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="space-y-3 p-5">
                <div className="flex gap-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-16" /></div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-full" />
              </Card>
            ))}
          </div>
        )}

        {/* ── Cards grid ─────────────────────────── */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-lg font-medium text-foreground mb-2">
              Aucune subvention ne correspond à vos filtres
            </p>
            <Button variant="outline" onClick={resetFilters}>Réinitialiser</Button>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <Card
                key={s.id}
                className="flex flex-col rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="flex flex-col flex-1 p-5 gap-3">
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {s.tags.slice(0, 1).map((tag) => (
                      <Badge key={tag} variant="outline" className={tagColor(tag)}>{tag}</Badge>
                    ))}
                    <Badge variant="secondary" className="text-xs">
                      {s.public_cible?.includes("national") || s.source?.toLowerCase().includes("national")
                        ? "National"
                        : "AURA"}
                    </Badge>
                  </div>

                  {/* Title (clickable → drawer) */}
                  <button
                    onClick={() => setSelected(s)}
                    className="text-left font-semibold text-base leading-tight line-clamp-2 hover:text-primary transition-colors"
                  >
                    {s.titre}
                  </button>

                  {/* Organisme */}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="truncate">{s.organisme}</span>
                  </div>

                  {/* Résumé */}
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                    {s.resume}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs gap-2 flex-wrap">
                    <span className={`flex items-center gap-1 ${deadlineColor(s.deadline)}`}>
                      <Calendar className="h-3.5 w-3.5" />
                      {s.deadline || "Pas de deadline"}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Euro className="h-3.5 w-3.5" />
                      {s.montant_max || "Montant non précisé"}
                    </span>
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => window.open(s.lien_candidature, "_blank")}
                    >
                      Voir l'appel <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail drawer ────────────────────────── */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="space-y-3">
                <SheetTitle className="text-xl leading-tight">{selected.titre}</SheetTitle>
                <SheetDescription className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> {selected.organisme}
                  {selected.source && <span className="text-muted-foreground">· {selected.source}</span>}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {selected.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className={tagColor(tag)}>{tag}</Badge>
                  ))}
                </div>

                {/* Resume */}
                <p className="text-sm text-muted-foreground whitespace-pre-line">{selected.resume}</p>

                {/* Metadata rows */}
                <div className="divide-y divide-border text-sm">
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Deadline</span>
                    <span className={deadlineColor(selected.deadline)}>{selected.deadline || "Non précisée"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Montant max</span>
                    <span>{selected.montant_max || "Non précisé"}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Public cible</span>
                    <span>{selected.public_cible || "Non précisé"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={() => window.open(selected.lien_candidature, "_blank")}>
                    Accéder au dossier de candidature <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  <div className="flex gap-2">
                    <SheetClose asChild>
                      <Button variant="outline" className="flex-1">Fermer</Button>
                    </SheetClose>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare(selected)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </HubPageLayout>
  );
}
