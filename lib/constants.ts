export interface DiscoveryTag {
  id: string;
  label: string;
  emoji: string;
  query: string
}

const TAG_PROMPTS: Record<string, string> = {
  "boost-dopamine":
    "Recommend episodes about positive psychology, gratitude, self-improvemnt, health and fitness, manifesting.",

  "make-me-laugh":
    "Recommend podcast episodes which are funny.`",

  "brain-food":
    "Recommend episodes about science, history, culture, psychology, business.",

  "main-character-energy":
    "Recommend high-energy, hype episodes for workouts — self-improvement, confidence, mental toughness, empowerment, motivation, glow-up mindset, or success stories.",

  "long-drives":
    "Recommend long episode types about travel or history or culture or current affairs.",

  "strolling-around":
    "Recommend episodes about personal journals, mindful living, nature sounds",

  "girl-talk":
    "Recommend casual, conversational episodes like chatting with best friends — female friendships, dating, glow-up advice, manifestation, or wellness talk with female hosts.",

  "mealtime-watch":
    "Recommend episodes about sports, comedy/entertainment genre, travel, history.",

  "quick-listen":
    "Recommend short episode types about life hacks or productivity tips or quick news or how-tos, or motivational bites.",

  "finance-101":
    "Recommend episodes about personal finance — budgeting, investing basics, saving money, mindful spending, financial planning, or business strategies.",

  "whats-new":
    "Recommend episodes about latest events — new STEM innovations, scientific discoveries, product launches, current affairs, tech news, or trending topics.",

  "literal-chills":
    "Recommend spine-tingling episodes — true crime, unsolved mysteries, thriller narratives, suspenseful storytelling, or investigative deep dives.",

  "before-sleep":
    "Recommend calming episodes to fall asleep to — soothing narration, bedtime stories, gentle ASMR, sleep meditation, or slow meandering conversation.",
};


export const DISCOVERY_TAGS: DiscoveryTag[] = [
  { id: "boost-dopamine",        label: "boost dopamine",        emoji: "🧃",  query: TAG_PROMPTS["boost-dopamine"]},
  { id: "make-me-laugh",         label: "make me laugh",         emoji: "😂",  query: TAG_PROMPTS["make-me-laugh"]},
  { id: "brain-food",            label: "brain food",            emoji: "🪩",  query: TAG_PROMPTS["brain-food"]},
  { id: "main-character-energy", label: "main character energy", emoji: "⭐",  query: TAG_PROMPTS["main-character-energy"]},
  { id: "strolling-around",      label: "strolling around",      emoji: "🚶",  query: TAG_PROMPTS["strolling-around"]},
  { id: "girl-talk",             label: "girl talk",             emoji: "👭",  query: TAG_PROMPTS["girl-talk"]},
  { id: "mealtime-watch",        label: "mealtime watch",        emoji: "🍽️",  query: TAG_PROMPTS["mealtime-watch"]},
  { id: "long-drives",           label: "long drives",           emoji: "🚗",  query: TAG_PROMPTS["long-drives"]},
  { id: "whats-new",             label: "what's new",            emoji: "📰",  query: TAG_PROMPTS["whats-new"]},
  { id: "finance-101",           label: "finance 101",           emoji: "💰",  query: TAG_PROMPTS["finance-101"]},
  { id: "literal-chills",        label: "literal chills",        emoji: "🥶",  query: TAG_PROMPTS["literal-chills"]},
  { id: "before-sleep",          label: "before sleep",          emoji: "😴",  query: TAG_PROMPTS["before-sleep"]},
  { id: "quick-listen",          label: "quick listen",          emoji: "⚡",  query:  TAG_PROMPTS["quick-listen"]},
];
