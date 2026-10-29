import {
  Zap, Leaf, Brain, Rocket, FlaskConical,
  Trophy, Medal, GraduationCap, TrendingUp, Code2,
  Languages, ScrollText, Music, BarChart3, Link2,
  Bot, Lightbulb, GitBranch, Shield, ShieldAlert,
  Globe, BookMarked, Network,
  Server, Eye, Megaphone,
  Monitor, Users, Database,
  FileSpreadsheet, Calculator,
  type LucideIcon,
} from "lucide-react";

export type PokemonType =
  | "FIRE" | "GRASS" | "WATER" | "PSYCHIC"
  | "ELECTRIC" | "GHOST" | "DRAGON" | "NORMAL";

export const typeColors: Record<PokemonType, string> = {
  FIRE: "#EE8130",
  GRASS: "#7AC74C",
  WATER: "#6390F0",
  PSYCHIC: "#F95587",
  ELECTRIC: "#F7D02C",
  GHOST: "#735797",
  DRAGON: "#6F35FC",
  NORMAL: "#A8A878",
};

/** Fallback for the "last updated" date; the real value comes from git at build time (see next.config.ts). */
export const POKEDEX_UPDATED_FALLBACK = "2026-10-28";

export type Category = "founding" | "hackathon" | "award" | "education" | "cert" | "research" | "role";

export interface Achievement {
  id: string;
  name: string;
  org: string;
  period: string;
  category: Category;
  types: PokemonType[];
  icon: LucideIcon;
  description: string;
  detail: string;
  highlight?: string;
}

export const achievements: Achievement[] = [
  {
    id: "041",
    name: "Excess Separability Paper",
    org: "Independent Research",
    period: "Aug 2026",
    category: "research",
    types: ["PSYCHIC", "DRAGON"],
    icon: Eye,
    description: "Nuisance-controlled residual-stream probing for detecting benchmark contamination.",
    detail:
      "Independent research paper: \"Excess Separability: Nuisance-Controlled Residual-Stream Probing for Benchmark Contamination Detection.\" Shows that the natural way of reading contamination off a linear probe on internal activations does not work, and specifies a protocol that survives measurement: a depth-profile contrast against a level-matched placebo, tested with a label-permutation null. Preprint on arXiv, with the implementation and audits released.",
    highlight: "arXiv · Aug 2026",
  },
  {
    id: "002",
    name: "CalmCampus",
    org: "Co-Founder & CTO",
    period: "Feb 2026 – Present",
    category: "founding",
    types: ["GRASS", "PSYCHIC"],
    icon: Leaf,
    description: "Privacy-first student wellbeing platform using passive behavioural signals and on-device AI.",
    detail:
      "Co-founded a privacy-first student wellbeing platform through the KU Leuven KICK Challenge, in collaboration with KU Leuven STUVO. Identifies burnout risk through passive behavioural signals and on-device AI — without individual surveillance. Lead technical development: data strategy, AI/ML approach, privacy-by-design architecture, and GDPR-conscious data handling.",
    highlight: "Co-Founder & CTO",
  },
  {
    id: "040",
    name: "University of Tsukuba",
    org: "Research Student, NLP Lab",
    period: "Oct 2026 – Present",
    category: "education",
    types: ["WATER", "PSYCHIC"],
    icon: Languages,
    description: "Non-degree research student (研究生) in an NLP lab at the University of Tsukuba, Japan.",
    detail:
      "Non-degree research enrolment (研究生) in the NLP lab of Prof. Takehito Utsuro at the University of Tsukuba, admitted following the lab's mathematics and programming screening. Works on Japanese pragmatics and LLM evaluation ahead of entry to the Master of Engineering in Intelligent and Mechanical Interaction Systems in April 2028.",
    highlight: "Master's entry Apr 2028",
  },
  {
    id: "001",
    name: "Lumen Studio",
    org: "Independent Developer",
    period: "Oct 2023 – Present",
    category: "role",
    types: ["FIRE", "NORMAL"],
    icon: Zap,
    description: "My personal projects portfolio: original apps, built full stack from idea to production.",
    detail:
      "My personal projects portfolio, published as Lumen Studio. I build my own apps from end to end: ideation, technical planning, development, testing, release and iteration, across back-end services and APIs, front-end experiences, infrastructure, deployments and performance optimisation.",
    highlight: "Solo",
  },
  {
    id: "022",
    name: "Cross-Lingual LLM Paper",
    org: "Independent Research",
    period: "Apr 2026",
    category: "research",
    types: ["PSYCHIC", "DRAGON"],
    icon: BookMarked,
    description: "Research paper on cross-lingual alignment and pragmatic reasoning in bilingual LLMs.",
    detail:
      "Independent research paper: \"Interpretable Cross-Lingual Alignment in Small Language Models: Probing Cultural and Pragmatic Reasoning in Japanese-English Bilingual LLMs.\" Investigates how small language models encode cross-lingual alignment, focusing on cultural and pragmatic reasoning in Japanese-English bilingual settings.",
    highlight: "Published Apr 2026",
  },
  {
    id: "006",
    name: "Future of IT Leaders",
    org: "Editx — Data & AI Challenge",
    period: "2025",
    category: "award",
    types: ["DRAGON"],
    icon: Trophy,
    description: "Selected as one of Belgium's top 50 emerging IT leaders in the Data & AI track.",
    detail:
      "Selected as a Finalist and placed in the Top 50 of the Future of IT Leaders: Data & AI Challenge 2025, organised by Editx. This competitive programme recognises Belgium's most promising young IT talent across Data, AI, Cybersecurity, and other technical disciplines. The online round drew 693 participants, and only the best 50 reached the final in Leuven.",
    highlight: "Top 50 of 693 · Finalist",
  },
  {
    id: "003",
    name: "NeuroMedix Hackathon",
    org: "Hackathon",
    period: "Mar 2026",
    category: "hackathon",
    types: ["ELECTRIC", "PSYCHIC"],
    icon: Brain,
    description: "Decoded EEG brain signals using ML to translate neurological data into tangible outputs.",
    detail:
      "Decoded EEG brain signals using machine learning and translated them into tangible, interpretable outputs. Reached the finals with a team of 3–4 on a sponsor-defined case at the intersection of neuroscience and AI — a deep dive into applied neurotechnology and real-time signal processing.",
    highlight: "Finalist",
  },
  {
    id: "007",
    name: "KICK Challenge",
    org: "KU Leuven",
    period: "2026",
    category: "award",
    types: ["DRAGON", "GRASS"],
    icon: Medal,
    description: "Selected to participate in KU Leuven's competitive entrepreneurship programme.",
    detail:
      "Selected as a participant in the KU Leuven KICK Challenge 2026 — a competitive entrepreneurship programme run by KU Leuven Research & Development. Through this programme, CalmCampus received mentorship, resources, and institutional collaboration to develop the platform further.",
    highlight: "Selected Participant",
  },
  {
    id: "004",
    name: "Next Level Challenge",
    org: "NEXT Leuven Hackathon",
    period: "Mar 2026",
    category: "hackathon",
    types: ["ELECTRIC"],
    icon: Rocket,
    description: "24h hackathon — built an AI investment app using the Claude API. Scored 80/100.",
    detail:
      "24-hour hackathon organised by NEXT Leuven on a real-world case by InvestSuite. Built an AI-powered investment app using the Claude API that dynamically adapts its interface and recommendations to the individual user. Scored 80/100 overall (40/50 technical, 40/50 business) — jury praised great design and strong product thinking.",
    highlight: "80/100",
  },
  {
    id: "024",
    name: "NEXT Leuven",
    org: "Information Manager",
    period: "May 2026 – Present",
    category: "role",
    types: ["ELECTRIC", "NORMAL"],
    icon: Server,
    description: "Information Manager in the IT team powering the tech infrastructure behind Belgium's largest student entrepreneurship organisation.",
    detail:
      "Information Manager in the IT team at NEXT Leuven, one of Belgium's largest student entrepreneurship organisations — connecting students with startups, scale-ups, and industry through flagship events like the Next Level Challenge and MedTech Convention. Manages and maintains the technical infrastructure and internal tooling powering operations across large-scale student initiatives, from 24-hour hackathons to professional industry conventions.",
  },
  {
    id: "008",
    name: "BASc Applied Computer Science",
    org: "UCLL University of Applied Sciences",
    period: "Sep 2024 – Jun 2027",
    category: "education",
    types: ["WATER"],
    icon: GraduationCap,
    description: "Main degree covering software engineering, AI, and data engineering.",
    detail:
      "Bachelor of Applied Science in Applied Computer Science at UCLL University of Applied Sciences, Leuven. Main focus areas: software engineering, artificial intelligence, and data engineering. Pursued alongside active entrepreneurial work and independent research.",
  },
  {
    id: "042",
    name: "Data Scientist",
    org: "DataCamp",
    period: "May 2026",
    category: "cert",
    types: ["GHOST", "WATER"],
    icon: BarChart3,
    description: "DataCamp certification in data science, machine learning and statistics with Python.",
    detail:
      "Data Scientist certification from DataCamp (certified 10 May 2026), covering machine learning, statistics, Python and data analysis. One of four DataCamp certifications earned in May 2026.",
  },
  {
    id: "036",
    name: "Data Engineer",
    org: "DataCamp",
    period: "May 2026",
    category: "cert",
    types: ["GHOST", "WATER"],
    icon: Database,
    description: "DataCamp certification covering data pipelines, warehousing, and processing at scale.",
    detail:
      "Data Engineer certification from DataCamp, covering data pipelines, ETL processes, data warehousing, and processing frameworks. Builds the data-engineering foundation underpinning production work across Velox, FinSight, and other data-heavy projects.",
  },
  {
    id: "023",
    name: "DSA in AI Paper",
    org: "Independent Research",
    period: "Oct 2025",
    category: "research",
    types: ["PSYCHIC"],
    icon: Network,
    description: "Research paper on the foundational role of data structures in AI systems.",
    detail:
      "Independent research paper: \"The Foundational Role of Data Structures and Algorithms in Artificial Intelligence Systems.\" Examines how classical CS fundamentals — sorting, searching, graph algorithms, dynamic programming — underpin modern AI infrastructure and ML systems at scale.",
    highlight: "Published Oct 2025",
  },
  {
    id: "025",
    name: "i-Force",
    org: "Security Consultant",
    period: "Apr 2026 – Jun 2026",
    category: "role",
    types: ["GHOST", "DRAGON"],
    icon: Eye,
    description: "Covert security assessments at Brussels Airport — testing protocols and staff vigilance.",
    detail:
      "Conducted covert security assessments at Brussels Airport Zaventem, testing the effectiveness of security protocols and staff vigilance across checkpoints and restricted zones. Evaluated compliance with security procedures, identified potential vulnerabilities, and submitted detailed reports to support continuous improvement of airport security operations.",
    highlight: "Brussels Airport",
  },
  {
    id: "005",
    name: "European Synbio Hackathon",
    org: "EU-wide Hackathon",
    period: "Nov 2024",
    category: "hackathon",
    types: ["ELECTRIC", "GRASS"],
    icon: FlaskConical,
    description: "EU-wide hackathon on synthetic biology — developed a biotech nutrition app.",
    detail:
      "EU-wide online hackathon focused on innovation in synthetic biology. Competed in the Agrifood & Nutrition track, developing a nutrition app leveraging biotechnology to advance sustainable food and agriculture. Pitched to a jury of academics, industry leaders, and investors.",
  },
  {
    id: "043",
    name: "Associate Data Scientist",
    org: "DataCamp",
    period: "May 2026",
    category: "cert",
    types: ["GHOST", "WATER"],
    icon: Calculator,
    description: "Associate-level DataCamp certification in data science with Python.",
    detail:
      "Associate Data Scientist certification from DataCamp (certified 4 May 2026), covering Python, machine learning, statistics and data analysis. One of four DataCamp certifications earned in May 2026.",
  },
  {
    id: "037",
    name: "Python Data Associate",
    org: "DataCamp",
    period: "May 2026",
    category: "cert",
    types: ["GHOST", "WATER"],
    icon: FileSpreadsheet,
    description: "Associate-level DataCamp certification in Python for data analysis.",
    detail:
      "Python Data Associate certification from DataCamp, covering data manipulation, analysis, and visualisation with Python — pandas, NumPy, and core data-analysis workflows.",
  },
  {
    id: "010",
    name: "CS50: Intro to Computer Science",
    org: "Harvard University",
    period: "Sep 2024 – Dec 2024",
    category: "education",
    types: ["WATER"],
    icon: Code2,
    description: "Harvard's legendary intro CS course — algorithms, C, Python, SQL, and web.",
    detail:
      "Harvard University's renowned introductory computer science course, covering the foundational concepts of computing: algorithms, data structures, C programming, Python, SQL, and web development. Completed as a rigorous, self-paced programme to solidify core CS fundamentals.",
    highlight: "Harvard University",
  },
  {
    id: "009",
    name: "Yale Finance Program",
    org: "Yale University",
    period: "Jan 2026 – Jun 2026",
    category: "education",
    types: ["WATER"],
    icon: TrendingUp,
    description: "Non-degree finance program at Yale — financial principles, markets, and economics.",
    detail:
      "Non-degree finance program at Yale University covering financial principles, markets, and economic reasoning. Pursued alongside the main CS degree to build interdisciplinary expertise spanning technology and finance — informing work at the intersection of AI and financial systems.",
  },
  {
    id: "038",
    name: "Korea University",
    org: "International Summer Program",
    period: "Jun 2026 – Jul 2026",
    category: "education",
    types: ["WATER", "ELECTRIC"],
    icon: Calculator,
    description: "International summer program in Linear Algebra at Korea University.",
    detail:
      "International Summer Program at Korea University, focused on Linear Algebra — eigenvalue analysis, least-squares methods, and matrix theory. Complements a one-week Preparatory Mathematics course at KU Leuven, and directly informs applied work in ML and data engineering, where linear algebra is foundational.",
  },
  {
    id: "014",
    name: "Bloomberg Market Concepts",
    org: "Bloomberg",
    period: "2025",
    category: "cert",
    types: ["GHOST"],
    icon: BarChart3,
    description: "Industry-standard Bloomberg certification covering financial markets and economics.",
    detail:
      "Bloomberg Market Concepts (BMC) is Bloomberg's flagship financial literacy certification, covering economic indicators, currencies, fixed income, and equities. Earned as part of building a working knowledge of financial markets to complement technical AI and data work.",
    highlight: "Bloomberg Certified",
  },
  {
    id: "011",
    name: "Japanese Language Program",
    org: "KU Leuven",
    period: "Feb 2026 – Jun 2026",
    category: "education",
    types: ["WATER", "NORMAL"],
    icon: Languages,
    description: "Formal Japanese language study at KU Leuven, targeting N5 proficiency.",
    detail:
      "Formal Japanese language study at KU Leuven — Genki I (JPN 101) and WaniKani Kanji (JPN 102) — working toward JLPT N5 proficiency. Motivated by research interest in Japanese-English cross-lingual NLP and a broader goal of linguistic fluency. Practical study supplemented by the Nihongo web app — a custom learning tool built alongside this programme.",
  },
  {
    id: "039",
    name: "BSc Computer Science",
    org: "KU Leuven",
    period: "Sep 2023 – Sep 2024",
    category: "education",
    types: ["WATER"],
    icon: GraduationCap,
    description: "First year of Computer Science studies at KU Leuven before transferring to UCLL.",
    detail:
      "Bachelor of Science in Computer Science at KU Leuven, Sep 2023 – Sep 2024, before continuing the degree at UC Leuven-Limburg (UCLL). Built the foundational CS coursework — programming, algorithms, and systems — that carried into the BASc at UCLL.",
  },
  {
    id: "016",
    name: "Intermediate Deep Learning with PyTorch",
    org: "DataCamp",
    period: "Mar 2026",
    category: "cert",
    types: ["GHOST", "PSYCHIC"],
    icon: Bot,
    description: "Intermediate deep learning certification covering neural networks and PyTorch.",
    detail:
      "Intermediate Deep Learning with PyTorch certification from DataCamp — covering neural network architectures, training pipelines, CNNs, RNNs, and model evaluation. Earned as hands-on preparation for NLP research and language model fine-tuning work.",
  },
  {
    id: "015",
    name: "Developing LLM Applications with LangChain",
    org: "DataCamp",
    period: "Mar 2026",
    category: "cert",
    types: ["GHOST", "PSYCHIC"],
    icon: Link2,
    description: "Certification in developing LLM-powered applications with LangChain.",
    detail:
      "Certification in developing LLM-powered applications using LangChain — covering chains, agents, memory, tools, and retrieval-augmented generation (RAG). Earned alongside active work building AI-integrated products and research experiments.",
  },
  {
    id: "017",
    name: "AI Fundamentals",
    org: "DataCamp",
    period: "Oct 2025",
    category: "cert",
    types: ["GHOST"],
    icon: Lightbulb,
    description: "Foundational AI certification covering core ML concepts and practical applications.",
    detail:
      "AI Fundamentals certification from DataCamp, covering core machine learning concepts, supervised and unsupervised learning, model evaluation, and practical AI workflows. Part of a structured path toward applied AI and ML research competency.",
  },
  {
    id: "018",
    name: "GitHub Foundations",
    org: "DataCamp",
    period: "Oct 2025",
    category: "cert",
    types: ["GHOST"],
    icon: GitBranch,
    description: "Certification in GitHub workflows, version control, and team collaboration.",
    detail:
      "GitHub Foundations certification covering version control with Git, branching strategies, pull request workflows, GitHub Actions basics, and collaborative development practices. Formalised knowledge of tooling used daily across all production projects.",
  },
  {
    id: "020",
    name: "Advent of Cyber 2025",
    org: "TryHackMe",
    period: "2025",
    category: "cert",
    types: ["GHOST"],
    icon: ShieldAlert,
    description: "25-day cybersecurity challenge covering offensive and defensive security topics.",
    detail:
      "TryHackMe's Advent of Cyber 2025 — a 25-day challenge covering OSINT, web exploitation, reverse engineering, forensics, malware analysis, and defensive tools. Practical, hands-on security training through gamified CTF-style challenges.",
  },
  {
    id: "019",
    name: "Pre Security Certificate",
    org: "TryHackMe",
    period: "2025",
    category: "cert",
    types: ["GHOST"],
    icon: Shield,
    description: "Cybersecurity fundamentals — networking, web security, Linux, and Windows.",
    detail:
      "TryHackMe Pre Security Certificate covering the foundations of cybersecurity: networking concepts, Linux fundamentals, Windows fundamentals, and web application security. Completed as part of building security-aware engineering practice across all projects.",
  },
  {
    id: "021",
    name: "IPv6 Sage Certification",
    org: "Hurricane Electric",
    period: "2025",
    category: "cert",
    types: ["GHOST"],
    icon: Globe,
    description: "Top-tier IPv6 proficiency certification — the highest level in HE's programme.",
    detail:
      "Hurricane Electric's IPv6 Sage Certification — the highest level in their IPv6 certification programme. Demonstrates comprehensive understanding of IPv6 addressing, routing, tunneling, and deployment. Earned as part of building deep networking knowledge alongside security and systems work.",
    highlight: "Sage Level",
  },
  {
    id: "027",
    name: "Insignia",
    org: "Social Media · Events · Logistics",
    period: "Sep 2024 – Present",
    category: "role",
    types: ["NORMAL", "ELECTRIC"],
    icon: Megaphone,
    description: "Three roles at UCLL's international student association: social media, events, and logistics for its flagship Culture Fest.",
    detail:
      "Three roles at Insignia, UCLL's international student association. As Social Media Manager (Sep 2024 – Jun 2025) managed its online presence, content creation and community engagement for the international student community. As Head of Events (Jul 2025 – Dec 2025) led event planning and coordination. Since Oct 2025, Head of Logistics for Insignia's Culture Fest, leading logistics and coordination so that one of the association's flagship events runs smoothly.",
    highlight: "Culture Fest",
  },
  {
    id: "031",
    name: "ESL1 IT Club",
    org: "Founder & President",
    period: "Feb 2022 – Feb 2023",
    category: "role",
    types: ["ELECTRIC", "DRAGON"],
    icon: Users,
    description: "Founded and led the school's IT Club — workshops, projects, and peer mentoring.",
    detail:
      "Founded and led the IT Club at European School of Luxembourg 1, organising workshops, coordinating projects, and mentoring peers in IT skills — an early step into technical leadership.",
    highlight: "Founder",
  },
  {
    id: "029",
    name: "Pupils' Committee IT",
    org: "European School of Luxembourg 1",
    period: "Sep 2022 – Jun 2023",
    category: "role",
    types: ["ELECTRIC", "WATER"],
    icon: Monitor,
    description: "Led all IT operations, specialising in website development, for the school's Pupils' Committee.",
    detail:
      "Head of Information Technology Department for the Pupils' Committee of European School of Luxembourg 1. Led all IT operations, specialising in website development and ensuring smooth digital functionality across the organisation.",
  },
  {
    id: "032",
    name: "Digital Teaching & Learning WG",
    org: "Student Representative",
    period: "Jan 2023 – Jun 2023",
    category: "role",
    types: ["WATER", "NORMAL"],
    icon: GraduationCap,
    description: "Represented students in shaping digitalisation across courses and the education system.",
    detail:
      "Served as Student Representative on the Digital Teaching and Learning Working Group, contributing to integrating digitalisation into courses and the broader education system at European School of Luxembourg 1.",
  },
  {
    id: "030",
    name: "Pupils' Committee Sports",
    org: "Front-End Developer",
    period: "Nov 2022 – Jun 2023",
    category: "role",
    types: ["WATER", "ELECTRIC"],
    icon: Code2,
    description: "Built and maintained the front-end of the Pupils' Committee Sports website.",
    detail:
      "Built and maintained the front-end of the Pupils' Committee Sports website at European School of Luxembourg 1, ensuring an engaging and user-friendly experience for the school community.",
  },
  {
    id: "012",
    name: "European Baccalaureate",
    org: "European School of Luxembourg 1",
    period: "2012 – 2023",
    category: "education",
    types: ["WATER", "NORMAL"],
    icon: ScrollText,
    description: "Multilingual European Baccalaureate diploma across 11 years.",
    detail:
      "Completed the European Baccalaureate at the European School of Luxembourg 1 — a multilingual, European-curriculum secondary education programme. Attended in a trilingual environment (Dutch, French, English) from age 6 to 18, building a strong academic and cross-cultural foundation.",
  },
  {
    id: "033",
    name: "Guitar Orchestra",
    org: "Conservatoire de la Ville de Luxembourg",
    period: "Sep 2017 – Jun 2020",
    category: "role",
    types: ["NORMAL"],
    icon: Music,
    description: "Performed with the Conservatoire's Guitar Orchestra across regular concerts.",
    detail:
      "Performed as a member of the Conservatoire de la Ville de Luxembourg's Guitar Orchestra, participating in regular rehearsals and concerts alongside formal guitar and music theory study.",
  },
  {
    id: "013",
    name: "Classical Guitar",
    org: "Conservatoire de la Ville de Luxembourg",
    period: "2014 – 2021",
    category: "education",
    types: ["NORMAL"],
    icon: Music,
    description: "Seven years of classical guitar at the Luxembourg Conservatoire.",
    detail:
      "Seven years of classical guitar at the Conservatoire de la Ville de Luxembourg, studying classical technique. Completed together with music theory and rewarded with a formal Certificate in Guitar & Music Theory with the mention Très Bien. A discipline that shaped long-term creative discipline.",
    highlight: "Mention Très Bien",
  },
  {
    id: "044",
    name: "Music Theory",
    org: "Conservatoire de la Ville de Luxembourg",
    period: "2014 – 2021",
    category: "education",
    types: ["NORMAL", "PSYCHIC"],
    icon: ScrollText,
    description: "Music theory studied alongside guitar at the Luxembourg Conservatoire.",
    detail:
      "Music theory at the Conservatoire de la Ville de Luxembourg, studied alongside guitar: harmony, counterpoint and music history. Together with the guitar it earned the Certificate in Guitar & Music Theory with the mention Très Bien. Shaped analytical thinking.",
    highlight: "Mention Très Bien",
  },
];
