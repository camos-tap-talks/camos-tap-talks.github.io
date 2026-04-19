import type { Metadata } from "next";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-zen-maru-gothic",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Camos Tap Talks",
  description: "An informal talk series at Hongo Kikusaka-cho Camos, Hongo, Tokyo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${zenMaruGothic.variable} antialiased`} suppressHydrationWarning>
      <body
        className={`${zenMaruGothic.className} bg-background text-foreground font-medium`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
