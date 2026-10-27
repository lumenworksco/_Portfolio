import {
  DESTINATIONS,
  EMAIL,
  TOPICS,
  type AgentLink,
  type Destination,
  type Topic,
} from "@/data/agentKnowledge";

export interface AgentReply {
  text: string;
  links: AgentLink[];
  followUps: string[];
  /** Set when the visitor asked to be taken somewhere. The UI confirms, then navigates. */
  navigate?: AgentLink;
  topicId: string | null;
}

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "to", "of", "and", "or", "in", "on", "at", "for",
  "with", "do", "does", "did", "he", "his", "him", "she", "her", "it", "its", "me", "my", "i", "you",
  "your", "can", "could", "would", "should", "please", "about", "what", "whats", "tell", "any", "some",
  "there", "this", "that", "these", "those", "has", "have", "had", "how", "so", "if", "than", "then",
]);

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(normalized: string): string[] {
  return normalized.split(" ").filter((t) => t && !STOPWORDS.has(t));
}

function containsPhrase(haystack: string, phrase: string): boolean {
  return new RegExp(`(^|\\s)${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=\\s|$)`).test(haystack);
}

/** Score = phrase hits count 3, exact word hits 2, close stems (4+ chars) 1. */
function scoreKeywords(keywords: string[], normalized: string, tokens: string[]): number {
  let score = 0;
  for (const raw of keywords) {
    const kw = normalize(raw);
    if (!kw) continue;
    if (kw.includes(" ")) {
      if (containsPhrase(normalized, kw)) score += 3;
      continue;
    }
    for (const t of tokens) {
      if (t === kw) {
        score += 2;
        break;
      }
      if (t.length >= 4 && kw.length >= 4 && (t.startsWith(kw) || kw.startsWith(t))) {
        score += 1;
        break;
      }
    }
  }
  return score;
}

const NAV_INTENT = /^(please )?(take|bring|send|show|open|go|navigate|jump|head|visit|launch|direct)\b|\b(take|bring|send) me\b|\bgo to\b|\bnavigate to\b|\bopen up\b/;

function toLink(d: Destination): AgentLink {
  return { label: d.label, href: d.href, external: d.external };
}

function findDestination(normalized: string, tokens: string[]): Destination | null {
  let best: Destination | null = null;
  let bestScore = 0;
  for (const d of DESTINATIONS) {
    const s = scoreKeywords(d.keywords, normalized, tokens);
    if (s > bestScore) {
      best = d;
      bestScore = s;
    }
  }
  return bestScore >= 2 ? best : null;
}

function findTopic(normalized: string, tokens: string[]): { topic: Topic; score: number } | null {
  let best: Topic | null = null;
  let bestScore = 0;
  for (const t of TOPICS) {
    const s = scoreKeywords(t.keywords, normalized, tokens);
    if (s > bestScore) {
      best = t;
      bestScore = s;
    }
  }
  return best && bestScore >= 2 ? { topic: best, score: bestScore } : null;
}

const GREETING = /^(hi|hello|hey|hola|yo|hallo|bonjour|good (morning|afternoon|evening)|sup|howdy)\b/;
const THANKS = /^(thanks|thank you|thx|cheers|great|awesome|cool|nice|perfect)\b/;

export function respond(query: string): AgentReply {
  const normalized = normalize(query);
  const tokens = tokenize(normalized);

  if (!normalized) {
    return {
      text: "Ask me anything about Florian: his studies, projects, research or how to reach him.",
      links: [],
      followUps: ["Who is Florian?", "What is he building?"],
      topicId: null,
    };
  }

  if (GREETING.test(normalized) && tokens.length <= 3) {
    return {
      text: "Hi! I can tell you about Florian's studies, projects and research, or take you to any part of the site. What would you like to know?",
      links: [],
      followUps: ["Who is Florian?", "What is he building?", "Tell me about his research"],
      topicId: "greeting",
    };
  }

  if (THANKS.test(normalized) && tokens.length <= 3) {
    return {
      text: "Happy to help. Anything else you want to know?",
      links: [],
      followUps: ["How can I contact him?", "What are his skills?"],
      topicId: "thanks",
    };
  }

  if (/\b(are you|who are you|what are you|how do you work|are u|you a bot|your name)\b/.test(normalized)) {
    const agent = TOPICS.find((t) => t.id === "agent")!;
    return { text: agent.answer, links: agent.links ?? [], followUps: agent.followUps ?? [], topicId: "agent" };
  }

  const destination = findDestination(normalized, tokens);

  if (destination && NAV_INTENT.test(normalized)) {
    return {
      text: `Taking you to ${destination.label}.`,
      links: [],
      followUps: [],
      navigate: toLink(destination),
      topicId: `nav:${destination.id}`,
    };
  }

  const hit = findTopic(normalized, tokens);
  if (hit) {
    const { topic } = hit;
    return {
      text: topic.answer,
      links: topic.links ?? [],
      followUps: topic.followUps ?? [],
      topicId: topic.id,
    };
  }

  if (destination) {
    return {
      text: `I do not have notes on that, but ${destination.label} may help. Want me to take you there?`,
      links: [toLink(destination)],
      followUps: [],
      topicId: `dest:${destination.id}`,
    };
  }

  return {
    text: `I do not have notes on that, and I would rather say so than guess. You can ask Florian directly at ${EMAIL}, or try one of these.`,
    links: [{ label: "Contact page", href: "/contact" }],
    followUps: ["Who is Florian?", "What is he building?", "How can I contact him?"],
    topicId: null,
  };
}
