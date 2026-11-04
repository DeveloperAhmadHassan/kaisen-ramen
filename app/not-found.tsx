import type { Metadata } from "next";
import Lost from "./site/lost";
import Shell from "./site/shell";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page has gone cold. Head back to the menu or the homepage.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Shell>
      <Lost />
    </Shell>
  );
}
