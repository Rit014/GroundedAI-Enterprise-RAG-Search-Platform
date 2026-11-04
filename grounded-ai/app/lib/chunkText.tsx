
export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  const cleanedText = text.replace(/\s+/g, " ").trim();

  if (!cleanedText) {
    return [];
  }

  if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
    throw new Error(
      "Chunk size must be positive, and overlap must be smaller than chunk size."
    );
  }

  const chunks: string[] = [];

  let start = 0;

  while (start < cleanedText.length) {
    const end = start + chunkSize;

    chunks.push(cleanedText.slice(start, end));

    start += chunkSize - overlap;
  }

  return chunks;
}
