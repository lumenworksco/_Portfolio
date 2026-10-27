import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orb",
  description: "A soft, iridescent ball that follows your cursor.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
