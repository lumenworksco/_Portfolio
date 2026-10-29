import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classic home",
  description: "The earlier braunf.com home page: a Pokémon-style start menu.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://braunf.com/" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
