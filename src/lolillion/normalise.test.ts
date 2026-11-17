import { describe, expect, it } from 'vitest';
import { normalise } from './normalise';

describe('normalise', () => {
  it('drops apostrophes and spaces', () => {
    expect(normalise("Kai'Sa")).toBe('kaisa');
    expect(normalise('kai sa')).toBe('kaisa');
    expect(normalise("Kha'Zix")).toBe('khazix');
  });
  it('drops dots and ampersands', () => {
    expect(normalise('Dr. Mundo')).toBe('drmundo');
    expect(normalise('Nunu & Willump')).toBe('nunuwillump');
  });
  it('strips accents', () => {
    expect(normalise('Pokémon')).toBe('pokemon');
  });
});
