import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask Florian",
  description: "An assistant that answers questions about Florian Braun and can take you around the site.",
  // Early version: keep it out of search results until it is ready to be the front door.
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
