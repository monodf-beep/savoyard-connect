import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mountain, Palette } from "lucide-react";

export const PublicFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground">associacion</span>
                <span className="text-xs text-muted-foreground">.eu</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/annuaire" className="hover:text-primary transition-colors">
                  {t('nav.directory')}
                </Link>
              </li>
              <li>
                <Link to="/experts" className="hover:text-primary transition-colors">
                  {t('experts.navTitle')}
                </Link>
              </li>
              <li>
                <Link to="/tarifs" className="hover:text-primary transition-colors">
                  {t('nav.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary transition-colors">
                  {t('footer.blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Silos */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.sectors')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/silos/sport" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Mountain className="h-4 w-4" />
                  Sport & Montagne
                </Link>
              </li>
              <li>
                <Link to="/silos/culture" className="hover:text-primary transition-colors flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Culture
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/cgu" className="hover:text-primary transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="hover:text-primary transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/mentions-legales" className="hover:text-primary transition-colors">
                  {t('footer.legalMentions')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Associacion. {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>🇫🇷 FR</span>
            <span>🇮🇹 IT</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
