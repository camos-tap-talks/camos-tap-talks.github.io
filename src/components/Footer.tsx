import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export default function Footer({ locale }: Props) {
  const t = getTranslations(locale);

  return (
    <footer className="border-t border-stone-200 mt-auto py-6 px-6 text-sm text-stone-400">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>{t.footer.venue}</span>
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/hk.camos"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-stone-700 transition-colors"
          >
            {t.footer.instagram}
          </a>
          <span>© CAMOS TAP TALKS</span>
        </div>
      </div>
    </footer>
  );
}
