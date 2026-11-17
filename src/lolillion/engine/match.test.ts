import { describe, expect, it } from 'vitest';
import { champions, items } from '../data/questions';
import { editDistance, resolveAnswer, type Resolution } from './match';
import type { Entry } from '../data/types';

const exact = (r: Resolution) => (r.kind === 'exact' ? r.entry.name : `not exact (${r.kind})`);
const guess = (r: Resolution) => (r.kind === 'guess' ? r.entry.name : `not a guess (${r.kind})`);
const options = (r: Resolution) => (r.kind === 'ambiguous' ? r.entries.map((e: Entry) => e.name) : []);

describe('editDistance', () => {
  it('counts single-character edits', () => {
    expect(editDistance('jinx', 'jinx')).toBe(0);
    expect(editDistance('jinxx', 'jinx')).toBe(1);
    expect(editDistance('kitten', 'sitting')).toBe(3);
  });
  it('counts swapped neighbouring letters as one edit', () => {
    expect(editDistance('yasou', 'yasuo')).toBe(1);
  });
});

describe('resolveAnswer: exact answers submit straight away', () => {
  it('ignores spacing, case and punctuation', () => {
    expect(exact(resolveAnswer('kai sa', champions))).toBe("Kai'Sa");
    expect(exact(resolveAnswer('DR MUNDO', champions))).toBe('Dr. Mundo');
    expect(exact(resolveAnswer('Dr. Mundo', champions))).toBe('Dr. Mundo');
  });
  it('accepts nicknames and ids', () => {
    expect(exact(resolveAnswer('mf', champions))).toBe('Miss Fortune');
    expect(exact(resolveAnswer('wukong', champions))).toBe('Wukong');
    expect(exact(resolveAnswer('monkeyking', champions))).toBe('Wukong');
    expect(exact(resolveAnswer('ie', items))).toBe('Infinity Edge');
    expect(exact(resolveAnswer('ward', items))).toBe('Stealth Ward');
    expect(exact(resolveAnswer('pink', items))).toBe('Control Ward');
  });
});

describe('resolveAnswer: "Did you mean" for near misses', () => {
  it('asks about a misspelling', () => {
    expect(guess(resolveAnswer('dr mndo', champions))).toBe('Dr. Mundo');
    expect(guess(resolveAnswer('jinxx', champions))).toBe('Jinx');
    expect(guess(resolveAnswer('yasou', champions))).toBe('Yasuo');
  });
  it('asks about a partial name only one answer starts with', () => {
    expect(guess(resolveAnswer('dar', champions))).toBe('Darius');
    expect(guess(resolveAnswer('malphit', champions))).toBe('Malphite');
    expect(guess(resolveAnswer('drea', items))).toBe('Dream Maker');
  });
  it('prefers a name that starts with the input over a nickname that does', () => {
    expect(guess(resolveAnswer('hor', items))).toBe('Horizon Focus');
  });
  it('prefers the entry whose name is closest', () => {
    expect(guess(resolveAnswer('ami', champions))).toBe('Nami');
    expect(guess(resolveAnswer('nass', champions))).toBe('Nasus');
  });
});

describe('resolveAnswer: ambiguous and empty input', () => {
  it('asks for more letters when several names start with the input', () => {
    expect(resolveAnswer('ka', champions).kind).toBe('ambiguous');
    expect(options(resolveAnswer('ka', champions))).toEqual(expect.arrayContaining(["Kai'Sa", 'Karma']));
  });
  it('lists the options when two spellings are equally close', () => {
    expect(options(resolveAnswer('jnx', champions))).toEqual(expect.arrayContaining(['Jinx', 'Jax']));
    expect(options(resolveAnswer('kaista', champions))).toEqual(expect.arrayContaining(["Kai'Sa", 'Kalista']));
  });
  it('finds nothing for gibberish or empty input', () => {
    expect(resolveAnswer('zzzzzzzz', champions).kind).toBe('none');
    expect(resolveAnswer('  ', champions).kind).toBe('none');
    expect(resolveAnswer("'''", champions).kind).toBe('none');
  });
  it('only searches the pool it is given', () => {
    expect(resolveAnswer('infinity edge', champions).kind).toBe('none');
  });
});
