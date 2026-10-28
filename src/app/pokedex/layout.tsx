import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pokédex",
  description:
    "Florian Braun's Pokédex: every hackathon, award, role, certification and research paper, plus what he is working on now with live GitHub and Hugging Face activity.",
  openGraph: {
    title: "Pokédex · Florian Braun",
    description: "Every hackathon, award, role and course, plus what he is working on now.",
    url: "https://braunf.com/pokedex",
  },
  twitter: {
    title: "Pokédex · Florian Braun",
    description: "Every hackathon, award, role and course, plus what he is working on now.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
