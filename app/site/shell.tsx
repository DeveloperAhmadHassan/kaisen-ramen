import type { ReactNode } from "react";
import AnchorScroll from "../sections/anchor-scroll";
import Footer from "../sections/footer";

/** Every page below the homepage: its sections, then the footer. */
export default function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="kr-page">
      <div className="kr-sections">
        {children}
        <Footer />
      </div>
      <AnchorScroll />
    </main>
  );
}
