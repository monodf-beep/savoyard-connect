import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PublicFooter } from "@/components/PublicFooter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
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
          {t("legal.privacy.title")}
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.privacy.collection.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.privacy.collection.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.privacy.purpose.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.privacy.purpose.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.privacy.storage.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.privacy.storage.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.privacy.rights.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.privacy.rights.content")}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>{t("legal.privacy.rights.access")}</li>
              <li>{t("legal.privacy.rights.rectification")}</li>
              <li>{t("legal.privacy.rights.erasure")}</li>
              <li>{t("legal.privacy.rights.portability")}</li>
              <li>{t("legal.privacy.rights.opposition")}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.privacy.cookies.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.privacy.cookies.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.privacy.contact.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.privacy.contact.content")}{" "}
              <a href="mailto:rgpd@associacion.eu" className="text-primary hover:underline">rgpd@associacion.eu</a>
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

export default PrivacyPolicy;
