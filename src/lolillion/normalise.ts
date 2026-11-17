// Lowercase, strip accents, then drop everything but letters and digits: "Dr. Mundo" -> "drmundo".
export function normalise(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}
