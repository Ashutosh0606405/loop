import { z } from "zod";

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Feedback Submission & Ingestion Schemas
export const createFeedbackSchema = z.object({
  content: z
    .string()
    .min(5, "Feedback content must be at least 5 characters")
    .max(5000, "Feedback content must be under 5000 characters"),
  channel: z.string().max(100).default("Web Form"),
  customerName: z.string().max(200).optional(),
});

// Single-item classification request.
export const classifyRequestSchema = z.object({
  feedbackId: z.string().min(1, "feedbackId is required"),
});

export const updateFeedbackStatusSchema = z.object({
  feedbackId: z.string(),
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]),
});

export const bulkIngestSchema = z.object({
  items: z
    .array(createFeedbackSchema)
    .min(1, "At least one feedback item required")
    .max(500, "A maximum of 500 feedback items can be ingested per request"),
});

// Bulk reclassification — batched so a large workspace doesn't blow past the
// request timeout mid-loop and report a misleading partial success.
export const reclassifyAllSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(25),
  cursor: z.string().optional(),
});

// Feedback Query & Pagination Schema
export const feedbackQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  channel: z.string().optional(),
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]).optional(),
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]).optional(),
  themeId: z.string().optional(),
});

// AI Ask LOOP Query Schema
export const askLoopQuerySchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters"),
  mode: z.enum(["Concise", "Detailed"]).optional().default("Detailed"),
});

// AI Classification Output Schema — validates whatever the model returns
// before it gets trusted and written to the database.
export const classificationSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).default([]),
});

// Report Generator Schema
export const generateReportSchema = z.object({
  title: z.string().min(3, "Report title is required"),
  period: z.enum(["Weekly", "Monthly", "Quarterly", "Custom"]).default("Weekly"),
});
