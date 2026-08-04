import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Instagram, Mail, MapPin } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export function Footer() {
  const { t } = useTranslation("common");
  return (
    <footer className="bg-surface border-t border-line">
      <div className="mx-auto max-w-settings px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-ui-sm bg-brand flex items-center justify-center shrink-0 group-hover:opacity-90 transition-opacity">
              <span className="text-brand-contrast font-semibold text-small">S</span>
            </div>
            <span className="font-semibold text-title text-ink group-hover:text-brand transition-colors">
              Spanish Class
            </span>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-small">
            <Link to="/contact" className="text-ink-secondary hover:text-ink transition-colors duration-micro">
              {t("navigation.contact")}
            </Link>
            <a
              href="mailto:professor@spanishclass.com"
              className="flex items-center gap-1.5 text-ink-secondary hover:text-ink transition-colors duration-micro"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("footer.email_label")}
            </a>
            <span className="flex items-center gap-1.5 text-ink-tertiary">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {t("footer.location")}
            </span>
          </div>

          {/* Social */}
          <a
            href="https://www.instagram.com/casovi_spanskog_online/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ink-secondary hover:text-ink transition-colors duration-micro"
            aria-label={t("footer.instagram_title")}
          >
            <Instagram className="h-5 w-5" aria-hidden="true" />
            <span className="text-small font-medium">@casovi_spanskog_online</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-line">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-caption text-ink-tertiary text-center sm:text-left">
              &copy; {new Date().getFullYear()} Spanish Class. {t("footer.copyright")}
            </p>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
