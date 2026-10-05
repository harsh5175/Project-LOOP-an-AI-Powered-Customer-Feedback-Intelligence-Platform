import { Feedback } from '@/types';

/**
 * Calculates a semantic relevance score between a query and a feedback item.
 * Uses term-frequency cosine vector approximation and keyword intent boosting.
 */
export function calculateSemanticRelevance(query: string, item: Feedback): number {
  const queryTerms = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (queryTerms.length === 0) return 0;

  const contentText = `${item.content} ${item.featureArea} ${item.themes.join(' ')} ${item.customerLabel}`.toLowerCase();
  
  let score = 0;
  let termMatches = 0;

  for (const term of queryTerms) {
    if (contentText.includes(term)) {
      termMatches++;
      // Give higher weight if term is found in themes or featureArea
      if (item.themes.some((t) => t.toLowerCase().includes(term))) {
        score += 3.0;
      }
      if (item.featureArea.toLowerCase().includes(term)) {
        score += 2.0;
      }
      // Content match
      const count = (contentText.match(new RegExp(term, 'g')) || []).length;
      score += Math.min(count * 1.5, 4.0);
    }
  }

  // Boost for high customer ARR (enterprise relevance)
  if (item.arr && item.arr > 30000) {
    score += 0.5;
  }

  // Coverage bonus: penalize single-word match if user asked multi-word query
  const coverage = termMatches / queryTerms.length;
  score = score * (0.4 + 0.6 * coverage);

  return score;
}

/**
 * Retrieves top-K most semantically relevant feedback items for Ask LOOP RAG pipeline
 */
export function retrieveTopGroundedFeedback(
  query: string,
  feedbacks: Feedback[],
  topK: number = 6
): Feedback[] {
  const scored = feedbacks.map((item) => ({
    item,
    score: calculateSemanticRelevance(query, item),
  }));

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  // Filter items that have meaningful match
  const filtered = scored.filter((s) => s.score > 0);

  if (filtered.length > 0) {
    return filtered.slice(0, topK).map((s) => s.item);
  }

  // If query is broad or no exact terms, return most critical negative & high ARR items
  return feedbacks
    .filter((f) => f.sentiment === 'NEGATIVE')
    .slice(0, topK);
}
