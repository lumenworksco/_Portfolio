import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Orb",
  description: "A soft, iridescent glass orb that follows your cursor.",
  robots: { index: false, follow: false },
  // Send the full address (not just the origin) to the sites it links to, so their back button can return here.
  referrer: "no-referrer-when-downgrade",
};

export const viewport: Viewport = {
  themeColor: "#070914",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
