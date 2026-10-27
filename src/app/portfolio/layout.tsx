import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Experience, education, skills, and research of Florian Braun — Co-Founder at CalmCampus, BASc Applied CS at UCLL.",
  openGraph: {
    title: "Portfolio · Florian Braun",
    description:
      "Experience, education, skills, and research of Florian Braun — Co-Founder, Engineer & Researcher.",
    url: "https://braunf.com/portfolio",
  },
  twitter: {
    title: "Portfolio · Florian Braun",
    description:
      "Experience, education, skills, and research of Florian Braun — Co-Founder, Engineer & Researcher.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
