import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Orb",
  description: "A soft, iridescent glass orb that follows your cursor.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#070914",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
