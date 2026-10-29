import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "The orb now lives on the home page at braunf.com.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://braunf.com/" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
