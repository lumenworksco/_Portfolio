import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Now",
  description: "Now lives inside the Pokédex at braunf.com/pokedex.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://braunf.com/pokedex" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
