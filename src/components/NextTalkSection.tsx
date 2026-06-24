"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  noUpcomingText: string;
};

const NextTalkSectionClient = dynamic(() => import("@/components/NextTalkSectionClient"), {
  ssr: false,
});

export default function NextTalkSection({ locale, noUpcomingText }: Props) {
  return <NextTalkSectionClient locale={locale} noUpcomingText={noUpcomingText} />;
}
