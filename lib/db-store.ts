/**
 * Project LOOP High-Performance In-Memory Data Store & Fallback Engine
 * Ensures 100% uptime for Feedback Ingestion, AI Classification, Ask LOOP Q&A, and VoC Reports.
 */

export interface FeedbackItem {
  id: string;
  content: string;
  channel: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | null;
  sentimentScore: number | null;
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
    content: "Payment checkout was smooth, but confirmation email was delayed by a few minutes.",
    channel: "Support Ticket",
    sentiment: "NEUTRAL",
    sentimentScore: 0.1,
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
    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      content: item.content,
      channel: item.channel || "Web Form",
      customerName: item.customerName || "Anonymous Customer",
      sentiment: item.sentiment || null,
      sentimentScore: typeof item.sentimentScore === "number" ? item.sentimentScore : null,
      status: item.status || "NEW",
      workspaceId: item.workspaceId || "ws-demo-001",
      isManuallyReviewed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      themes: [],
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
