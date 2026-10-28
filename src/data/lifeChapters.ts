// The chapters behind the orb on /agent. Every statement comes from content already published
// on braunf.com, the project READMEs and the CV data. Edit freely.

type V3 = [number, number, number];

/** Colours the orb (and the light behind it) takes on for a chapter. */
export interface Palette {
  blue: V3;
  peri: V3;
  lav: V3;
  peach: V3;
}

export interface LifeItem {
  title: string;
  meta?: string;
  text: string;
  href?: string;
  linkLabel?: string;
  external?: boolean;
}

export interface Chapter {
  id: string;
  label: string;
  title: string;
  period: string;
  blurb: string;
  palette: Palette;
  items: LifeItem[];
}

export const DEFAULT_PALETTE: Palette = {
  blue: [0.22, 0.46, 0.86],
  peri: [0.64, 0.71, 0.96],
  lav: [0.64, 0.6, 0.88],
  peach: [1.0, 0.84, 0.86],
};

export const CHAPTERS: Chapter[] = [
  {
    id: "school",
    label: "School years",
    title: "School years",
    period: "2012 – 2023",
    blurb: "Eleven years at the European School of Luxembourg 1, finished with the European Baccalaureate.",
    palette: {
      blue: [0.2, 0.6, 0.5],
      peri: [0.7, 0.9, 0.8],
      lav: [0.62, 0.8, 0.86],
      peach: [0.98, 0.95, 0.82],
    },
    items: [
      {
        title: "Founder & President, ESL1 IT Club",
        meta: "Feb 2022 – Feb 2023",
        text: "Founded and led the IT Club: workshops, coordinating projects and mentoring peers in IT skills.",
      },
      {
        title: "Head of IT, Pupils' Committee",
        meta: "Sep 2022 – Jun 2023",
        text: "Led all IT operations, specialising in website development. Also built the front end of the Pupils' Committee Sports website.",
      },
      {
        title: "Student Representative",
        meta: "Jan – Jun 2023",
        text: "Represented students in the Digital Teaching & Learning Working Group, on bringing digitalisation into courses and the wider education system.",
      },
      {
        title: "Guitar Orchestra",
        meta: "Sep 2017 – Jun 2020",
        text: "Rehearsals and concerts at the Conservatoire de la Ville de Luxembourg, alongside formal guitar and music theory study (certificate, 2014 – 2021).",
      },
    ],
  },
  {
    id: "studies",
    label: "Studies",
    title: "Studies",
    period: "2023 – 2027",
    blurb: "Computer science in Leuven, with detours into Japanese, finance and linear algebra.",
    palette: DEFAULT_PALETTE,
    items: [
      {
        title: "BASc Applied Computer Science, UCLL",
        meta: "2024 – 2027",
        text: "The main degree: software engineering, AI and data engineering.",
      },
      {
        title: "BSc Computer Science, KU Leuven",
        meta: "Sep 2023 – Sep 2024",
        text: "A first year of computer science before moving to UCLL.",
      },
      {
        title: "CS50, Harvard",
        meta: "Sep – Dec 2024",
        text: "Introduction to Computer Science.",
      },
      {
        title: "Japanese Language Program, KU Leuven",
        meta: "Feb – Dec 2026",
        text: "Currently at JLPT N5 level, and the language behind his main research.",
      },
      {
        title: "Finance, Yale · Linear Algebra, Korea University",
        meta: "2026",
        text: "A non-degree finance program at Yale (Jan – Jun) and an international summer program in linear algebra at Korea University (Jun – Jul).",
      },
      {
        title: "25 DataCamp credentials",
        meta: "2025 – 2026",
        text: "Five formal certifications, including Data Engineer and Data Scientist, plus courses on PyTorch, LangChain, NLP and transformers.",
        href: "https://data.braunf.com",
        linkLabel: "See the credentials",
        external: true,
      },
    ],
  },
  {
    id: "building",
    label: "Building",
    title: "Building",
    period: "2023 – now",
    blurb: "Products, apps and hardware, taken from idea to release.",
    palette: {
      blue: [0.47, 0.32, 0.88],
      peri: [0.78, 0.7, 0.96],
      lav: [0.78, 0.62, 0.92],
      peach: [1.0, 0.78, 0.88],
    },
    items: [
      {
        title: "CalmCampus",
        meta: "Co-Founder & CTO · Jan 2026 –",
        text: "A privacy-first wellness companion for students: it notices when stress is building from on-device signals and a short daily check-in, then offers brief evidence-based exercises. All data stays on the phone. Started in the KU Leuven KICK Challenge; being rebuilt as a native SwiftUI iOS app.",
        href: "https://cc.braunf.com",
        linkLabel: "cc.braunf.com",
        external: true,
      },
      {
        title: "Personal projects",
        meta: "Lumen Studio · Oct 2023 –",
        text: "Apps and tools he builds on his own: Velox (an autonomous trading system), CalmCampus, Tokn (a macOS menu bar app), Feather (an early-alpha macOS browser), Nihongo (a Japanese learning app), a Go app with a built-in AI, and Project Silkworm (a preference-dataset pipeline).",
        href: "https://projects.braunf.com",
        linkLabel: "Browse the projects",
        external: true,
      },
      {
        title: "Mabushi Lab",
        meta: "Research & engineering lab",
        text: "The engineering side: open-source ESP32 devices in C++: CrossWave (paired motion sensors over 433 MHz RF), NetworkSniffer (an RF analyzer with a live dashboard on the chip) and Pulsar (a portfolio dashboard on a tiny colour display).",
        href: "https://research.braunf.com#engineering",
        linkLabel: "See the engineering",
        external: true,
      },
      {
        title: "Hackathons",
        meta: "2024 – 2026",
        text: "NeuroMedix (finalist): decoding EEG signals with machine learning. Next Level Challenge: a 24-hour AI investment app with the Claude API, scoring 80/100. European Synbio Hackathon: a nutrition app for the Agrifood track.",
        href: "/pokedex",
        linkLabel: "Open the Pokédex",
      },
    ],
  },
  {
    id: "research",
    label: "Research",
    title: "Research",
    period: "2025 – 2026",
    blurb: "Cross-lingual NLP and LLM interpretability, and whether the probes used to evaluate models can be trusted.",
    palette: {
      blue: [0.12, 0.56, 0.76],
      peri: [0.62, 0.88, 0.9],
      lav: [0.6, 0.78, 0.86],
      peach: [0.86, 0.98, 0.9],
    },
    items: [
      {
        title: "Excess Separability: probing for benchmark contamination",
        meta: "August 2026",
        text: "A protocol for detecting benchmark contamination with linear probes that survives measurement: a depth-profile contrast against a level-matched placebo, tested with a label-permutation null. Shows the naive probe approach can have false-positive rates anywhere from 0.03 to 0.99 under a true null. Preprint on arXiv, with code released.",
        href: "https://arxiv.org/abs/2608.12652",
        linkLabel: "Read on arXiv",
        external: true,
      },
      {
        title: "Interpretable Cross-Lingual Alignment in Small Language Models",
        meta: "April 2026",
        text: "Introduces J-PragEval-v0, a minimal-pair benchmark for four Japanese pragmatic phenomena, probes how TinySwallow-1.5B encodes honorifics, zero anaphora, in-group reference and indirect refusal, and proposes Pragmatic Representation Steering: a parameter-free way to steer a model by editing residual-stream activations at inference time.",
      },
      {
        title: "The Foundational Role of Data Structures and Algorithms in AI Systems",
        meta: "October 2025",
        text: "Shows through analysis and case studies that data structure and algorithm choices directly shape AI performance, tracing the lineage from symbolic AI to transformers.",
      },
      {
        title: "All the research",
        text: "Abstracts, key contributions and links for every paper, plus the engineering side of the lab.",
        href: "https://research.braunf.com",
        linkLabel: "Visit research.braunf.com",
        external: true,
      },
    ],
  },
  {
    id: "work",
    label: "Work & leadership",
    title: "Work & leadership",
    period: "2024 – now",
    blurb: "Keeping student organisations running, on the technical side and the people side.",
    palette: {
      blue: [0.9, 0.5, 0.32],
      peri: [1.0, 0.82, 0.64],
      lav: [0.95, 0.7, 0.68],
      peach: [1.0, 0.93, 0.8],
    },
    items: [
      {
        title: "IT team, NEXT Leuven",
        meta: "May 2026 –",
        text: "Part of the IT team at one of Belgium's largest student entrepreneurship organisations, maintaining the technical infrastructure and internal tooling behind its events and initiatives.",
      },
      {
        title: "Head of Logistics, Insignia's Culture Fest",
        meta: "Oct 2025 –",
        text: "Leads logistics and coordination for the flagship cultural festival of UCLL's international student association.",
      },
      {
        title: "Head of Events, Insignia",
        meta: "Jul – Dec 2025",
        text: "Led event planning and coordination for the association, after a year as its Social Media Manager (Sep 2024 – Jun 2025).",
      },
    ],
  },
  {
    id: "offduty",
    label: "Off duty",
    title: "Off duty",
    period: "always",
    blurb: "Film, watches, Go, Japanese and a little pocket synthesizer.",
    palette: {
      blue: [0.85, 0.36, 0.58],
      peri: [0.98, 0.74, 0.84],
      lav: [0.82, 0.66, 0.92],
      peach: [1.0, 0.88, 0.84],
    },
    items: [
      {
        title: "Film photography & mechanical watches",
        text: "Shoots film and collects mechanical watches.",
      },
      {
        title: "Go",
        text: "Plays Go, currently around 25 kyu, and built a Go app with a Japanese interface and its own AI opponent.",
        href: "https://go.braunf.com",
        linkLabel: "Open the Go app",
        external: true,
      },
      {
        title: "Japanese",
        text: "Tracks kanji in WaniKani and built an offline Japanese learning app.",
        href: "https://nihongo.braunf.com",
        linkLabel: "Open Nihongo",
        external: true,
      },
      {
        title: "Beats",
        text: "Loops made on a Teenage Engineering PO-33 K.O.",
        href: "/music",
        linkLabel: "Listen",
      },
      {
        title: "Languages",
        text: "Dutch and French native, English C1, German A2, Japanese N5, Spanish A1.",
      },
    ],
  },
  {
    id: "hello",
    label: "Say hello",
    title: "Say hello",
    period: "Leuven, Belgium",
    blurb: "Open to research collaborations and engineering opportunities, including internships.",
    palette: {
      blue: [0.3, 0.52, 0.9],
      peri: [0.72, 0.78, 0.97],
      lav: [0.7, 0.64, 0.92],
      peach: [1.0, 0.86, 0.8],
    },
    items: [
      {
        title: "Email",
        text: "contact@braunf.com",
        href: "mailto:contact@braunf.com",
        linkLabel: "Write an email",
      },
      {
        title: "LinkedIn",
        text: "Experience, education and recommendations.",
        href: "https://www.linkedin.com/in/braunflorian25/",
        linkLabel: "Open LinkedIn",
        external: true,
      },
      {
        title: "GitHub & Hugging Face",
        text: "Code on GitHub (lumenworksco), models and datasets on Hugging Face (iPwnds).",
        href: "https://github.com/lumenworksco",
        linkLabel: "Open GitHub",
        external: true,
      },
      {
        title: "What he is up to right now",
        text: "Live GitHub and Hugging Face activity.",
        href: "/pokedex#now",
        linkLabel: "Open Now",
      },
    ],
  },
];
