
export function retrieveChunks(
  question: string,
  chunks: string[],
  topK: number = 3
): string[] {
  const stopWords = new Set([
    "the", "is", "are", "a", "an", "of", "in",
    "to", "for", "and", "or", "do", "does",
    "what", "how", "when", "where", "who",
    "can", "could", "would", "should", "i",
    "me", "my", "we", "our", "you", "your"
  ]);

  const keywords = question
    .toLowerCase()
    .match(/\b[a-z0-9]+\b/g)
    ?.filter((word) => !stopWords.has(word)) ?? [];

  const scoredChunks = chunks.map((chunk, index) => {
    const text = chunk.toLowerCase();

    const score = keywords.reduce((total, keyword) => {
      return total + (text.includes(keyword) ? 1 : 0);
    }, 0);

    return { chunk, index, score };
  });

  return scoredChunks
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, topK)
    .map((item) => item.chunk);
}
