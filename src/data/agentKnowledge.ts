// Curated knowledge the /agent page answers from. Every statement here comes from
// content already published on braunf.com, the project READMEs or the CV data.
// Add or edit topics freely: the engine in src/lib/agentEngine.ts picks them up.

export interface AgentLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Topic {
  id: string;
  /** Words or phrases that signal this topic. Phrases score higher than single words. */
  keywords: string[];
  answer: string;
  links?: AgentLink[];
  followUps?: string[];
}

export interface Destination {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  keywords: string[];
}

export const EMAIL = "contact@braunf.com";

export const DESTINATIONS: Destination[] = [
  { id: "home", label: "the home menu", href: "/", keywords: ["home", "menu", "start", "main page", "homepage"] },
  { id: "research", label: "Research", href: "/research", keywords: ["research", "papers", "paper", "publications"] },
  { id: "pokedex", label: "the Pokédex", href: "/pokedex", keywords: ["pokedex", "pokédex", "achievements", "trophies"] },
  { id: "music", label: "Beats", href: "/music", keywords: ["music", "beats", "loops", "po-33", "po33"] },
  { id: "now", label: "Now", href: "/now", keywords: ["now", "current focus", "currently"] },
  { id: "contact", label: "Contact", href: "/contact", keywords: ["contact", "email page"] },
  { id: "terminal", label: "the Terminal", href: "/terminal", keywords: ["terminal", "console", "shell"] },
  { id: "projects", label: "Personal Projects", href: "https://lumen.braunf.com", external: true, keywords: ["projects", "lumen", "portfolio of projects", "personal projects"] },
  { id: "calmcampus", label: "CalmCampus", href: "https://cc.braunf.com", external: true, keywords: ["calmcampus", "calm campus"] },
  { id: "datacamp", label: "DataCamp credentials", href: "https://data.braunf.com", external: true, keywords: ["datacamp", "certificates", "certifications", "credentials"] },
  { id: "iot", label: "the IoT Lab", href: "https://iot.braunf.com", external: true, keywords: ["iot", "mabushi", "esp32", "hardware"] },
  { id: "nihongo", label: "Nihongo", href: "https://nihongo.braunf.com", external: true, keywords: ["nihongo", "wanikani"] },
  { id: "go", label: "the Go app", href: "https://go.braunf.com", external: true, keywords: ["go app", "baduk", "igo", "weiqi"] },
];

export const TOPICS: Topic[] = [
  {
    id: "about",
    keywords: ["who", "florian", "about", "introduce", "yourself", "background", "summary", "bio", "overview"],
    answer:
      "Florian Braun is an Applied Computer Science student at UCLL in Leuven, Belgium, working across AI, data and product. He co-founded CalmCampus, builds his own apps, and does independent research in cross-lingual NLP and LLM interpretability.",
    links: [{ label: "Research", href: "/research" }],
    followUps: ["What does he study?", "What is he building?", "Tell me about his research"],
  },
  {
    id: "education",
    keywords: ["study", "studies", "education", "degree", "university", "school", "ucll", "ku leuven", "harvard", "yale", "cs50", "student", "college", "korea", "baccalaureate"],
    answer:
      "He is doing a BASc in Applied Computer Science at UCLL (2024 to 2027), focused on software engineering, AI and data engineering. Before that he spent a year on a BSc in Computer Science at KU Leuven and took Harvard's CS50 online. Alongside the degree: a Japanese language program at KU Leuven, a non-degree finance program at Yale, and a summer linear algebra program at Korea University. He finished school with the European Baccalaureate at the European School of Luxembourg 1.",
    followUps: ["What languages does he speak?", "What are his skills?"],
  },
  {
    id: "experience",
    keywords: ["experience", "work", "job", "career", "internship", "intern", "hire", "hiring", "employment", "role", "roles", "worked", "available", "looking", "opportunity", "opportunities"],
    answer:
      "Right now he is part of the IT team at NEXT Leuven (since May 2026), one of Belgium's largest student entrepreneurship organisations, and Co-Founder & CTO of CalmCampus (since January 2026). Since October 2023 he has also been building his own apps as an independent developer. He is open to research collaborations and engineering opportunities, so internship conversations are welcome.",
    links: [{ label: "Get in touch", href: "/contact" }],
    followUps: ["Tell me about CalmCampus", "How can I contact him?", "What are his skills?"],
  },
  {
    id: "calmcampus",
    keywords: ["calmcampus", "calm campus", "wellness", "wellbeing", "burnout", "stress", "kick", "stuvo", "privacy"],
    answer:
      "CalmCampus is a privacy-first wellness companion for university students. It notices when stress is building up using signals the phone already has (sleep, activity, screen time) plus a short daily check-in, then offers brief, evidence-based exercises. All data stays on the device. It started in the KU Leuven KICK Challenge 2026 together with KU Leuven STUVO, and Florian leads the technical side as CTO: data strategy, the AI approach and privacy-by-design. It is a wellness tool, not a medical device, and is being rebuilt as a native SwiftUI iOS app.",
    links: [
      { label: "cc.braunf.com", href: "https://cc.braunf.com", external: true },
      { label: "GitHub", href: "https://github.com/lumenworksco/CalmCampus", external: true },
    ],
    followUps: ["What else is he building?", "What are his skills?"],
  },
  {
    id: "projects",
    keywords: ["project", "projects", "building", "built", "build", "apps", "app", "portfolio", "lumen", "side", "ship", "shipped", "tokn", "feather", "macos"],
    answer:
      "His personal projects live at lumen.braunf.com. Highlights: Velox, an autonomous equity trading system; Piste, an Android ski companion; Tokn, a macOS menu bar app for Claude usage; Feather, an early-alpha native macOS browser; a Japanese learning PWA; and a Go (baduk) app with a built-in AI opponent. He builds them full stack, from idea to release.",
    links: [{ label: "Personal projects", href: "https://lumen.braunf.com", external: true }],
    followUps: ["Tell me about Velox", "Tell me about the IoT lab"],
  },
  {
    id: "velox",
    keywords: ["velox", "trading", "trade", "alpaca", "algorithmic", "quant", "finance", "stocks", "equity"],
    answer:
      "Velox is a terminal-native autonomous equity trading system built on Alpaca. It runs 6 strategies through an 18-stage signal pipeline, with ML gating, value-at-risk limits, a circuit breaker and a live dashboard. It is written in Python and published as an open-source repository.",
    links: [{ label: "Velox page", href: "https://lumen.braunf.com/velox.html", external: true }],
    followUps: ["What else is he building?", "What are his skills?"],
  },
  {
    id: "research",
    keywords: ["research", "paper", "papers", "nlp", "llm", "llms", "interpretability", "cross-lingual", "crosslingual", "alignment", "steering", "pragmatic", "thesis", "publication", "tinyswallow", "probing"],
    answer:
      "His research focus is cross-lingual NLP and LLM interpretability. In April 2026 he introduced J-PragEval-v0, a minimal-pair benchmark for four Japanese pragmatic phenomena, probed how TinySwallow-1.5B encodes honorifics, zero anaphora, in-group reference and indirect refusal, and proposed Pragmatic Representation Steering, a parameter-free way to steer a model by editing residual-stream activations at inference time. In October 2025 he also wrote a paper on the role of data structures and algorithms in AI systems.",
    links: [{ label: "Read the research", href: "/research" }],
    followUps: ["Why Japanese?", "What are his skills?"],
  },
  {
    id: "japanese",
    keywords: ["japanese", "japan", "nihongo", "jlpt", "wanikani", "kanji", "why japanese"],
    answer:
      "Japanese runs through several parts of his life: he is in the Japanese Language Program at KU Leuven (February to December 2026), is at JLPT N5 level, tracks his kanji progress in WaniKani, built a Japanese learning app and a Go app with a Japanese interface, and his main research probes Japanese-English bilingual language models.",
    links: [{ label: "Nihongo app", href: "https://nihongo.braunf.com", external: true }],
    followUps: ["Tell me about his research", "What are his hobbies?"],
  },
  {
    id: "skills",
    keywords: ["skills", "skill", "tech", "stack", "technologies", "python", "typescript", "rust", "pytorch", "react", "tools", "programming", "languages programming", "know", "good at", "strengths", "ml", "machine learning", "data"],
    answer:
      "AI and NLP: PyTorch, Hugging Face, scikit-learn, LangChain, the Claude API, LLM probing. Data and programming: Python, TypeScript, Rust, pandas, NumPy, SQL, data engineering, linear algebra. Web and systems: React and Next.js, Flutter, Docker, PostgreSQL, plus ESP32 firmware in C++. He also brings product strategy, project management and rapid prototyping.",
    links: [{ label: "DataCamp credentials", href: "https://data.braunf.com", external: true }],
    followUps: ["Does he have certifications?", "What is he building?"],
  },
  {
    id: "certifications",
    keywords: ["certification", "certifications", "certificate", "certificates", "certified", "datacamp", "credentials", "courses", "course"],
    answer:
      "He holds 25 DataCamp credentials, including five formal certifications: Data Engineer, Data Scientist, Associate Data Scientist, Python Data Associate and AI Fundamentals. The rest are courses on PyTorch, LangChain, NLP, transformers, Git and GitHub, and more. Each one has a PDF copy on the credentials site.",
    links: [{ label: "DataCamp credentials", href: "https://data.braunf.com", external: true }],
    followUps: ["What are his skills?", "Tell me about his hackathons"],
  },
  {
    id: "hackathons",
    keywords: ["hackathon", "hackathons", "competition", "competitions", "award", "awards", "neuromedix", "synbio", "next level", "challenge", "finalist", "won"],
    answer:
      "Three hackathons. NeuroMedix (March 2026): decoded EEG brain signals with machine learning and reached the finals. Next Level Challenge by NEXT Leuven (March 2026): a 24-hour build of an AI-powered investment app with the Claude API for a real InvestSuite case, scoring 80/100. European Synbio Hackathon (November 2024): a nutrition app for the Agrifood and Nutrition track, pitched to a jury of academics, industry leaders and investors.",
    links: [{ label: "Pokédex of achievements", href: "/pokedex" }],
    followUps: ["What is he building?", "What are his skills?"],
  },
  {
    id: "iot",
    keywords: ["iot", "esp32", "hardware", "embedded", "mabushi", "crosswave", "networksniffer", "pulsar", "firmware", "arduino", "rf", "electronics", "microcontroller"],
    answer:
      "Mabushi Lab is his open-source IoT hardware lab, all on the ESP32 in C++. CrossWave is a pair of motion-sensing devices that talk over 433 MHz RF and stream data over WebSocket. NetworkSniffer is a 433 MHz analyzer with a live web dashboard hosted on the chip. Pulsar is a wall display with live market data and a Pomodoro timer.",
    links: [{ label: "IoT Lab", href: "https://iot.braunf.com", external: true }],
    followUps: ["What else is he building?", "What are his skills?"],
  },
  {
    id: "leadership",
    keywords: ["leadership", "lead", "led", "volunteering", "volunteer", "insignia", "organisation", "organization", "committee", "club", "events", "culture fest", "president", "founder"],
    answer:
      "Outside of work he has led student organisations: Head of Events and earlier Social Media Manager at Insignia (UCLL's international student association), Head of Logistics for Insignia's Culture Fest, and at the European School of Luxembourg 1 he founded and led the IT Club and headed the Pupils' Committee IT department.",
    followUps: ["What does he study?", "What are his hobbies?"],
  },
  {
    id: "languages",
    keywords: ["languages", "speak", "spoken", "dutch", "french", "english", "german", "spanish", "multilingual", "bilingual", "fluent"],
    answer:
      "Dutch and French are native, English is C1, German is A2, Japanese is N5 and Spanish is A1.",
    followUps: ["Why Japanese?", "What does he study?"],
  },
  {
    id: "hobbies",
    keywords: ["hobby", "hobbies", "free time", "fun", "interests", "photography", "film", "watches", "watch", "play go", "baduk", "guitar", "beats", "po-33", "off duty", "outside"],
    answer:
      "Off duty he shoots film photography, collects mechanical watches, plays Go (currently around 25 kyu) and makes loops on a Teenage Engineering PO-33 K.O. He also played in a guitar orchestra at the Conservatoire de la Ville de Luxembourg for three years.",
    links: [{ label: "Beats", href: "/music" }],
    followUps: ["Why Japanese?", "Tell me about his research"],
  },
  {
    id: "contact",
    keywords: ["contact", "email", "mail", "reach", "message", "linkedin", "github", "hugging face", "huggingface", "get in touch", "talk", "connect", "cv", "resume"],
    answer:
      `The best way to reach him is by email at ${EMAIL}. He is also on LinkedIn, GitHub (lumenworksco) and Hugging Face (iPwnds).`,
    links: [
      { label: "Contact page", href: "/contact" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/braunflorian25/", external: true },
      { label: "GitHub", href: "https://github.com/lumenworksco", external: true },
    ],
    followUps: ["What is he looking for?", "What are his skills?"],
  },
  {
    id: "location",
    keywords: ["where", "location", "live", "lives", "based", "city", "country", "from", "belgium", "leuven", "luxembourg"],
    answer:
      "He is based in Leuven, Belgium, where he studies. He grew up in Luxembourg and went to the European School of Luxembourg 1.",
    followUps: ["What does he study?", "What languages does he speak?"],
  },
  {
    id: "now",
    keywords: ["now", "currently", "lately", "focus", "right now", "working on", "these days"],
    answer:
      "Right now: building his own apps and tools, cross-lingual NLP research on how small language models reason across languages, and shipping features for CalmCampus. The Now page shows live GitHub and Hugging Face activity.",
    links: [{ label: "Now page", href: "/now" }],
    followUps: ["Tell me about CalmCampus", "Tell me about his research"],
  },
  {
    id: "site",
    keywords: ["site", "website", "built this", "made this", "pokemon", "pokémon", "next.js", "nextjs", "how was this"],
    answer:
      "This site is a static Next.js 16 and React 19 app with Tailwind, Framer Motion and a few WebGL and canvas effects. The home page is a Pokémon-style start menu. This agent page is new and still an early version.",
    links: [{ label: "Home menu", href: "/" }],
    followUps: ["What are you?", "What is he building?"],
  },
  {
    id: "agent",
    keywords: ["you", "agent", "bot", "ai", "assistant", "chatgpt", "gpt", "claude", "llm powered", "are you real", "how do you work", "model"],
    answer:
      "I am a small assistant on Florian's site. For now I am not a live language model: I answer from a curated set of notes about him and can take you to any page here. A model-backed version is the next step. If you ask something I have no notes on, I will say so instead of guessing.",
    followUps: ["Who is Florian?", "What is he building?"],
  },
];

export const STARTER_PROMPTS = [
  "Who is Florian?",
  "What is he building?",
  "Tell me about his research",
  "Take me to the Pokédex",
];
