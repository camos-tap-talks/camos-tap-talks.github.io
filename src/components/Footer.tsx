import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export default function Footer({ locale }: Props) {
  const t = getTranslations(locale);

  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--surface)] py-6 px-6 text-sm text-[var(--muted)]">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>{t.footer.venue}</span>
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/hk.camos"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--accent-deep)]"
          >
            {t.footer.instagram}
          </a>
          <span>© Camos Tap Talks</span>
        </div>
      </div>
    </footer>
  );
}
