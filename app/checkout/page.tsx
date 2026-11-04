import type { Metadata } from "next";
import Shell from "../site/shell";
import Checkout from "./checkout";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finish your Kaisen Ramen order.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Shell>
      <Checkout />
    </Shell>
  );
}
