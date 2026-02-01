import { useTranslation } from "react-i18next";
import { PublicNavbar } from "@/components/PublicNavbar";
import { PublicFooter } from "@/components/PublicFooter";

const LegalMentions = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Unified Navbar */}
      <PublicNavbar />

      {/* Content */}
      <main className="flex-1 container px-4 md:px-8 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
          {t("legal.mentions.title")}
        </h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.mentions.editor.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.mentions.editor.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.mentions.director.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.mentions.director.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.mentions.hosting.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.mentions.hosting.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.mentions.intellectual.title")}</h2>
            <p className="text-muted-foreground">
              {t("legal.mentions.intellectual.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">{t("legal.mentions.contact.title")}</h2>
            <p className="text-muted-foreground">
              Email : <a href="mailto:contact@associacion.eu" className="text-primary hover:underline">contact@associacion.eu</a>
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

export default LegalMentions;
