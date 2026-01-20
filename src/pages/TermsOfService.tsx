import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PublicFooter } from "@/components/PublicFooter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container px-4 md:px-8 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-foreground">associacion</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container px-4 md:px-8 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          {t("legal.terms.title")}
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.terms.object.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.terms.object.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.terms.registration.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.terms.registration.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.terms.services.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.terms.services.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.terms.responsibilities.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.terms.responsibilities.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.terms.intellectual.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.terms.intellectual.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.terms.termination.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.terms.termination.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.terms.jurisdiction.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.terms.jurisdiction.content")}
            </p>
          </section>
        </div>

        <p className="text-sm text-muted-foreground mt-12 pt-6 border-t border-border">
          {t("legal.lastUpdated")}: Janvier 2026
        </p>
      </main>

      <PublicFooter />
    </div>
  );
};

export default TermsOfService;
