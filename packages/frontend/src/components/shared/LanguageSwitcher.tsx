import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Globe } from "lucide-react";

type Locale = "en" | "sr" | "es";

const languages = {
  en: { name: "English", flag: "🇬🇧" },
  sr: { name: "Српски", flag: "🇷🇸" },
  es: { name: "Español", flag: "🇪🇸" },
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language as Locale;

  const changeLanguage = (lng: Locale) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languages[currentLocale]?.name || "EN"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(languages).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => changeLanguage(code as Locale)}
            className={currentLocale === code ? "bg-accent" : ""}
          >
            <span className="mr-2">{flag}</span>
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
