/**
 * Normalizes text by converting to lowercase and removing diacritics.
 * This is crucial for Sanskrit search (e.g., matching 'vrddhi' to 'vṛddhi').
 */
export const normalizeText = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove combining diacritics
};

/**
 * Checks if the query matches the target content using fuzzy logic.
 * 
 * Rules:
 * 1. Both query and targets are normalized (accents removed).
 * 2. Query is split into tokens (words).
 * 3. ALL tokens from the query must be present in the combined target fields.
 * 
 * @param query The user's search string
 * @param targets A list of strings to search against (e.g., sanskrit, translation, meaning)
 */
export const fuzzyMatch = (query: string, ...targets: (string | undefined | null)[]): boolean => {
  if (!query) return true;
  
  const normalizedQuery = normalizeText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);
  
  if (queryTokens.length === 0) return true;

  // Combine all targets into one normalized string.
  // We join with space to ensure boundaries between fields.
  const combinedTarget = targets.map(t => normalizeText(t || "")).join(" ");
  
  // AND logic: Every token in the query must exist in the target content
  return queryTokens.every(token => combinedTarget.includes(token));
};
