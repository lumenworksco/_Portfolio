import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research",
  description: "Research now lives at research.braunf.com, together with the Mabushi Lab engineering work.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://research.braunf.com" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
