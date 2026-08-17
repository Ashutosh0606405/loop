// Voyage AI embeddings + cosine similarity helpers used for Ask LOOP semantic search.
import "dotenv/config";

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VOYAGE_MODEL = process.env.VOYAGE_MODEL || "voyage-4-lite";

/**
 * Embed a single piece of text via Voyage AI.
 * inputType should be "document" when embedding feedback content to store,
 * and "query" when embedding a user's question at search time.
 * Returns null (never throws) if the key is missing or the call fails, so
 * callers can degrade gracefully instead of breaking the request.
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function embedText(
  text: string,
  inputType: "query" | "document" = "document",
  retries = 3,
): Promise<number[] | null> {
  if (!VOYAGE_API_KEY) {
    console.warn("embedText: VOYAGE_API_KEY not set, skipping embedding");
    return null;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://api.voyageai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${VOYAGE_API_KEY}`,
        },
        body: JSON.stringify({
          input: text,
          model: VOYAGE_MODEL,
          input_type: inputType,
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (res.status === 429 && attempt < retries) {
        // Voyage's rate limit is tight on smaller plans — back off and retry
        // rather than silently giving up and leaving this item unembedded.
        await sleep(1500 * (attempt + 1));
        continue;
      }

      if (!res.ok) {
        console.warn("embedText: Voyage API returned", res.status, await res.text());
        return null;
      }

      const data = await res.json();
      const vector = data?.data?.[0]?.embedding;
      return Array.isArray(vector) ? vector : null;
    } catch (err) {
      console.warn("embedText: Voyage API call failed", err);
      return null;
    }
  }

  return null;
}

/**
 * Embed a feedback item's content and persist it as an Embedding row.
 * Safe to call fire-and-forget-ish (still awaited) — swallows errors so a
 * failed embedding never breaks the classification response.
 */
export async function embedAndStoreFeedback(
  feedbackId: string,
  content: string,
): Promise<boolean> {
  try {
    const vector = await embedText(content, "document");
    if (!vector) return false;

    // Lazy import to avoid a require cycle with lib/db in edge cases.
    const { db } = await import("@/lib/db");

    // Delete any existing embeddings for this feedback item first. Without
    // this, re-classifying an item (or switching embedding models/versions)
    // just piles up extra rows with mismatched vector dimensions that
    // silently break cosine similarity comparisons later.
    await db.embedding.deleteMany({ where: { feedbackId } });

    await db.embedding.create({
      data: {
        feedbackId,
        vector: JSON.stringify(vector),
      },
    });

    return true;
  } catch (err) {
    console.warn("embedAndStoreFeedback: failed to store embedding", err);
    return false;
  }
}

/** Standard cosine similarity between two equal-length numeric vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
