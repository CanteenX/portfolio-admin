import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LANGUAGE_META from "@/core/i18n/flags";
import { SUPPORTED_LANGUAGES } from "@/core/i18n/i18n";

/**
 * LanguageDropdown renders a flag+label trigger button that opens
 * a dropdown list of 8 supported languages. Selecting a language
 * calls i18next.changeLanguage which also toggles RTL for Arabic.
 */
export default function LanguageDropdown() {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  const currentMeta = LANGUAGE_META[currentLang] ?? LANGUAGE_META.en;

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm
                     hover:bg-accent hover:text-accent-foreground
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-ring transition-colors"
          aria-label="Select language"
        >
          <span className="text-lg leading-none" role="img" aria-label={currentMeta.name}>
            {currentMeta.flag}
          </span>
          <span className="hidden sm:inline">{currentMeta.nativeName}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SUPPORTED_LANGUAGES.map((code) => {
          const meta = LANGUAGE_META[code];
          const isActive = code === currentLang;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => handleSelect(code)}
              className={isActive ? "bg-accent font-medium" : ""}
            >
              <span className="text-lg leading-none mr-2" role="img" aria-label={meta.name}>
                {meta.flag}
              </span>
              <span className="flex-1">{meta.nativeName}</span>
              {isActive && (
                <span className="ml-auto text-xs text-muted-foreground">
                  &#10003;
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
