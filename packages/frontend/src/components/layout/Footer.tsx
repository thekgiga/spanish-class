import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Instagram, Mail, MapPin } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export function Footer() {
  const { t } = useTranslation("common");
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-spanish-teal-500 to-spanish-coral-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <span className="text-white font-display text-sm font-bold">
                  S
                </span>
              </div>
              <span className="font-display text-lg font-semibold text-slate-900 group-hover:text-spanish-teal-600 transition-colors">
                Spanish Class
              </span>
            </Link>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              to="/about"
              className="text-slate-600 hover:text-spanish-teal-600 transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-slate-600 hover:text-spanish-teal-600 transition-colors"
            >
              Contact
            </Link>
            <a
              href="mailto:professor@spanishclass.com"
              className="flex items-center gap-1.5 text-slate-600 hover:text-spanish-teal-600 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
            <span className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="h-4 w-4" />
              Belgrade, Serbia
            </span>
          </div>

          {/* Social & Copyright */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/casovi_spanskog_online/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-600 hover:text-spanish-coral-600 transition-colors group"
              title={t("footer.instagram_title")}
            >
              <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">
                @casovi_spanskog_online
              </span>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm text-center sm:text-left">
              &copy; {new Date().getFullYear()} Spanish Class. All rights
              reserved.
            </p>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
