import type { Metadata } from "next";
import localFont from "next/font/local";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import { InlineScript } from "./inline-script";
import { reloadDetectScript } from "./reload";
import ReloadCurtain from "./reload-curtain";
import "./globals.css";

// "Gang of Three" by Last Soundtrack, free from dafont.com
const gangOfThree = localFont({
  src: "./fonts/gang-of-three.ttf",
  variable: "--font-gang",
  display: "swap",
});

// body copy in the sections below the hero
const zenKaku = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaisen Ramen",
  description: "Japanese ramen, karaage and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the reload script may flag <html> before React hydrates
    <html lang="en" className={`${gangOfThree.variable} ${zenKaku.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <InlineScript html={reloadDetectScript} />
        <ReloadCurtain />
        {children}
      </body>
    </html>
  );
}
