import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import { InlineScript } from "./inline-script";
import { reloadDetectScript } from "./reload";
import CartDrawer from "./cart/drawer";
import ReloadCurtain from "./reload-curtain";
import Header from "./site/header";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "./site/seo";
import "./globals.css";
import "./hero.css";
import "./sections/sections.css";
import "./site/site.css";

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
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "food",
  keywords: ["ramen", "Japanese restaurant", "tonkotsu", "miso ramen", "shoyu ramen", "hand-pulled noodles", "ramen delivery"],
  openGraph: { title: SITE_TITLE, description: SITE_DESCRIPTION, siteName: SITE_NAME, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

export const viewport: Viewport = { themeColor: "#7a0a0e" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the reload script may flag <html> before React hydrates
    <html lang="en" className={`${gangOfThree.variable} ${zenKaku.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <InlineScript html={reloadDetectScript} />
        <ReloadCurtain />
        <Header />
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
