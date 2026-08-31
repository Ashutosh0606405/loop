/**
 * Project LOOP High-Performance In-Memory Data Store & Fallback Engine
 * Ensures 100% uptime for Feedback Ingestion, AI Classification, Ask LOOP Q&A, and VoC Reports.
 */

export interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  sentimentScore: number;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  customerName: string | null;
  workspaceId: string;
  isManuallyReviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
  themes?: Array<{
    theme: {
      id: string;
      name: string;
    };
  }>;
}

export function quickClassifySentiment(content: string): {
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  sentimentScore: number;
  themeName: string;
} {
  const text = (content || "").toLowerCase();

  const posKeywords = [
    "amazing", "awesome", "great", "love", "fast", "resolved", "excellent", "superb",
    "helpful", "fantastic", "wonderful", "best", "good", "improvement", "improvements",
    "saves hours", "easy", "perfect", "smooth", "happy", "delighted", "impressed",
    "top-notch", "outstanding", "brilliant", "valuable", "efficient", "seamless",
    "favorite", "clean", "intuitive", "speed", "quick", "thanks", "thank you", "nice",
    "useful", "like", "liked", "satisfied", "enjoy", "enjoyed", "analyzing"
  ];

  const negKeywords = [
    "slow", "issue", "issues", "error", "errors", "lag", "lagging", "fail", "failed",
    "broken", "bad", "terrible", "horrible", "crash", "crashed", "bug", "bugs",
    "frustrated", "disappointed", "delayed", "delay", "poor", "useless", "stuck",
    "waste", "refund", "annoying", "expensive", "complicated", "difficult", "worst",
    "hate", "problem", "problems", "unable", "cannot", "can't", "freeze", "freezing",
    "dislike", "disliked", "awful"
  ];

  let posCount = 0;
  let negCount = 0;

  for (const kw of posKeywords) {
    if (text.includes(kw)) posCount++;
  }

  for (const kw of negKeywords) {
    if (text.includes(kw)) negCount++;
  }

  let sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" = "NEUTRAL";
  let sentimentScore = 0.0;

  if (posCount > negCount) {
    sentiment = "POSITIVE";
    sentimentScore = Math.min(0.95, 0.65 + posCount * 0.1);
  } else if (negCount > posCount) {
    sentiment = "NEGATIVE";
    sentimentScore = Math.max(-0.95, -0.65 - negCount * 0.1);
  }

  let themeName = "Product Quality";
  if (text.includes("speed") || text.includes("slow") || text.includes("fast") || text.includes("lag") || text.includes("load")) {
    themeName = "Application Speed";
  } else if (text.includes("payment") || text.includes("card") || text.includes("checkout") || text.includes("cost") || text.includes("price")) {
    themeName = "Payment Issues";
  } else if (text.includes("support") || text.includes("help") || text.includes("agent") || text.includes("ticket")) {
    themeName = "Customer Support";
  }

  return { sentiment, sentimentScore, themeName };
}

const inMemoryFeedbacks: FeedbackItem[] = [
  {
    id: "fb-seed-001",
    content: "The new dashboard analytics and auto-classification feature is incredible!",
    channel: "Web Form",
    sentiment: "POSITIVE",
    sentimentScore: 0.95,
    status: "REVIEWED",
    customerName: "Sarah Connor",
    workspaceId: "ws-demo-001",
    isManuallyReviewed: false,
    createdAt: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(Date.now() - 3600000 * 2),
    themes: [{ theme: { id: "th-01", name: "Product Quality" } }],
  },
  {
    id: "fb-seed-002",
    content: "Payment checkout failed with error 500 when using Visa card.",
    channel: "Support Ticket",
    sentiment: "NEGATIVE",
    sentimentScore: -0.85,
    status: "NEW",
    customerName: "David Miller",
    workspaceId: "ws-demo-001",
    isManuallyReviewed: false,
    createdAt: new Date(Date.now() - 3600000 * 5),
    updatedAt: new Date(Date.now() - 3600000 * 5),
    themes: [{ theme: { id: "th-02", name: "Payment Issues" } }],
  },
  {
    id: "fb-seed-003",
    content: "Experienced slight lag when loading large reporting exports on mobile browser.",
    channel: "NPS Survey",
    sentiment: "NEGATIVE",
    sentimentScore: -0.7,
    status: "NEW",
    customerName: "Taylor Swift",
    workspaceId: "ws-demo-001",
    isManuallyReviewed: false,
    createdAt: new Date(Date.now() - 3600000 * 8),
    updatedAt: new Date(Date.now() - 3600000 * 8),
    themes: [{ theme: { id: "th-03", name: "Application Speed" } }],
  },
  {
    id: "fb-seed-004",
    content: "Customer support resolved my workspace configuration inquiry within minutes. Great team!",
    channel: "Email",
    sentiment: "POSITIVE",
    sentimentScore: 0.9,
    status: "ACTIONED",
    customerName: "Morgan Freeman",
    workspaceId: "ws-demo-001",
    isManuallyReviewed: true,
    createdAt: new Date(Date.now() - 3600000 * 12),
    updatedAt: new Date(Date.now() - 3600000 * 12),
    themes: [{ theme: { id: "th-04", name: "Customer Support" } }],
  },
];

export const feedbackStore = {
  async add(item: {
    content: string;
    channel?: string;
    customerName?: string;
    workspaceId: string;
    status?: "NEW" | "REVIEWED" | "ACTIONED";
    sentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    sentimentScore?: number;
  }): Promise<FeedbackItem> {
    const classified = quickClassifySentiment(item.content);
    const sentiment = item.sentiment || classified.sentiment;
    const sentimentScore = typeof item.sentimentScore === "number" ? item.sentimentScore : classified.sentimentScore;

    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      content: item.content,
      channel: item.channel || "Web Form",
      customerName: item.customerName || "Anonymous Customer",
      sentiment,
      sentimentScore,
      status: item.status || "REVIEWED",
      workspaceId: item.workspaceId || "ws-demo-001",
      isManuallyReviewed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      themes: [{ theme: { id: `th-${classified.themeName.toLowerCase().replace(/\s+/g, "-")}`, name: classified.themeName } }],
    };
    inMemoryFeedbacks.unshift(newItem);
    return newItem;
  },

  async addMany(
    items: Array<{ content: string; channel?: string; customerName?: string; workspaceId: string }>
  ): Promise<number> {
    let count = 0;
    for (const item of items) {
      await this.add(item);
      count++;
    }
    return count;
  },

  async update(id: string, workspaceId: string, data: Partial<FeedbackItem>): Promise<FeedbackItem | null> {
    const idx = inMemoryFeedbacks.findIndex((f) => f.id === id && f.workspaceId === workspaceId);
    if (idx !== -1) {
      inMemoryFeedbacks[idx] = {
        ...inMemoryFeedbacks[idx],
        ...data,
        updatedAt: new Date(),
      };
      return inMemoryFeedbacks[idx];
    }
    return null;
  },

  async list(workspaceId: string, options?: { search?: string; sentiment?: string; channel?: string; status?: string }): Promise<FeedbackItem[]> {
    let items = inMemoryFeedbacks.filter((f) => f.workspaceId === workspaceId);

    if (options?.search) {
      const query = options.search.toLowerCase();
      items = items.filter(
        (f) => f.content.toLowerCase().includes(query) || (f.customerName && f.customerName.toLowerCase().includes(query))
      );
    }

    if (options?.sentiment && options.sentiment !== "All") {
      items = items.filter((f) => f.sentiment === options.sentiment);
    }

    if (options?.channel && options.channel !== "All") {
      items = items.filter((f) => f.channel === options.channel);
    }

    if (options?.status && options.status !== "All") {
      items = items.filter((f) => f.status === options.status);
    }

    return items;
  },
};
