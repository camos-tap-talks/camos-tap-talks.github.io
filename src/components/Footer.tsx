import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export default function Footer({ locale: _locale }: Props) {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--surface)] py-4 px-6 text-sm text-[var(--muted)]">
      <div className="max-w-3xl mx-auto text-center">
        <span>© Camos Tap Talks</span>
      </div>
    </footer>
  );
}
