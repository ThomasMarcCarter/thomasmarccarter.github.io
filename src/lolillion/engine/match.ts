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

interface Ranked {
  /** Exact alias hits, then names starting with the query, then other aliases starting with it. */
  sure: Entry[];
  /** Near-misses, closest first; `key` compares how close, so equal keys are a genuine tie. */
  fuzzy: { e: Entry; key: [number, number] }[];
}

function rank(input: string, pool: readonly Entry[]): Ranked {
  const query = normalise(input);
  if (!query) return { sure: [], fuzzy: [] };

  // aliases[0] is always the normalised name.
  const exact = pool.filter((e) => e.aliases.includes(query));
  const namePrefix = pool.filter((e) => !exact.includes(e) && e.aliases[0].startsWith(query)).sort(byName);
  const aliasPrefix = pool
    .filter((e) => !exact.includes(e) && !namePrefix.includes(e) && e.aliases.some((a) => a.startsWith(query)))
    .sort(byName);
  const sure = [...exact, ...namePrefix, ...aliasPrefix];

  const fuzzy = pool
    .filter((e) => !sure.includes(e))
    .map((e) => ({
      e,
      key: [Math.min(...e.aliases.map((a) => editDistance(query, a))), editDistance(query, e.aliases[0])] as [
        number,
        number,
      ],
    }))
    .filter(({ key }) => key[0] <= maxTypos(query))
    .sort((x, y) => x.key[0] - y.key[0] || x.key[1] - y.key[1] || x.e.popularity - y.e.popularity);

  return { sure, fuzzy };
}

/** Autocomplete over one pool: exact aliases, names starting with the input, other aliases, then near-misses. */
export function suggest(input: string, pool: readonly Entry[], limit = DEFAULT_LIMIT): Entry[] {
  const { sure, fuzzy } = rank(input, pool);
  return [...sure, ...fuzzy.map(({ e }) => e)].slice(0, limit);
}

/** The entry a submitted answer means, or null when it matches nothing or two spellings are equally close. */
export function matchAnswer(input: string, pool: readonly Entry[]): Entry | null {
  const { sure, fuzzy } = rank(input, pool);
  if (sure.length) return sure[0];
  const [best, next] = fuzzy;
  if (!best) return null;
  const tied = next && next.key[0] === best.key[0] && next.key[1] === best.key[1];
  return tied ? null : best.e;
}
