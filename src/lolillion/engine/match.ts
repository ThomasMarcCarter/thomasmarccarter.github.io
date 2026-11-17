import { normalise } from '../normalise';
import type { Entry } from '../data/types';

const DEFAULT_LIMIT = 6;

/** Levenshtein distance that also counts two swapped neighbouring letters as one edit ("yasou" -> "yasuo"). */
export function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

// Short inputs allow one typo, longer ones two.
const maxTypos = (query: string) => (query.length <= 5 ? 1 : 2);
const byName = (a: Entry, b: Entry) => a.name.localeCompare(b.name);

/** Autocomplete over one pool: exact aliases, then prefix matches by name, then near-misses by closeness. */
export function suggest(input: string, pool: readonly Entry[], limit = DEFAULT_LIMIT): Entry[] {
  const query = normalise(input);
  if (!query) return [];

  const exact = pool.filter((e) => e.aliases.includes(query));
  const prefix = pool.filter((e) => !exact.includes(e) && e.aliases.some((a) => a.startsWith(query))).sort(byName);
  const fuzzy = pool
    .filter((e) => !exact.includes(e) && !prefix.includes(e))
    .map((e) => ({ e, distance: Math.min(...e.aliases.map((a) => editDistance(query, a))) }))
    .filter(({ distance }) => distance <= maxTypos(query))
    .sort((x, y) => x.distance - y.distance || byName(x.e, y.e))
    .map(({ e }) => e);

  return [...exact, ...prefix, ...fuzzy].slice(0, limit);
}

/** The entry a submitted answer means: an exact alias, otherwise the top suggestion. */
export function matchAnswer(input: string, pool: readonly Entry[]): Entry | null {
  return suggest(input, pool, 1)[0] ?? null;
}
