import { normalise } from '../normalise';
import type { Entry } from '../data/types';

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

/**
 * What a typed answer means:
 * - exact: a name, id or nickname, submitted straight away;
 * - guess: one likely answer (a misspelling, or the only name starting with the input), confirmed with a second Enter;
 * - ambiguous: several equally likely answers, so the player types more;
 * - none: nothing close.
 */
export type Resolution =
  | { kind: 'exact' | 'guess'; entry: Entry }
  | { kind: 'ambiguous'; entries: Entry[] }
  | { kind: 'none' };

export function resolveAnswer(input: string, pool: readonly Entry[]): Resolution {
  const query = normalise(input);
  if (!query) return { kind: 'none' };

  const exact = pool.find((e) => e.aliases.includes(query));
  if (exact) return { kind: 'exact', entry: exact };

  // aliases[0] is always the normalised name; a name starting with the input beats a nickname that does.
  const namePrefix = pool.filter((e) => e.aliases[0].startsWith(query)).sort(byName);
  const aliasPrefix = pool.filter((e) => !namePrefix.includes(e) && e.aliases.some((a) => a.startsWith(query))).sort(byName);
  const prefix = namePrefix.length ? namePrefix : aliasPrefix;
  if (prefix.length === 1) return { kind: 'guess', entry: prefix[0] };
  if (prefix.length > 1) return { kind: 'ambiguous', entries: prefix };

  const fuzzy = pool
    .map((e) => ({
      e,
      // Closest any spelling gets, then how close the real name is, so a near nickname doesn't outrank a near name.
      key: [Math.min(...e.aliases.map((a) => editDistance(query, a))), editDistance(query, e.aliases[0])],
    }))
    .filter(({ key }) => key[0] <= maxTypos(query))
    .sort((x, y) => x.key[0] - y.key[0] || x.key[1] - y.key[1] || x.e.popularity - y.e.popularity);

  const [best, next] = fuzzy;
  if (!best) return { kind: 'none' };
  const tied = fuzzy.filter(({ key }) => key[0] === best.key[0] && key[1] === best.key[1]);
  if (next && tied.length > 1) return { kind: 'ambiguous', entries: tied.map(({ e }) => e) };
  return { kind: 'guess', entry: best.e };
}
