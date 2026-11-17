import { describe, expect, it } from 'vitest';
import { champions, items, questions, validAnswers } from './questions';

const MIN_ANSWERS = 6;

describe('questions', () => {
  it('have unique ids', () => {
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
  });

  it(`each have at least ${MIN_ANSWERS} valid answers`, () => {
    const thin = questions
      .map((q) => `${q.id} (${validAnswers(q).length})`)
      .filter((_, i) => validAnswers(questions[i]).length < MIN_ANSWERS);
    expect(thin).toEqual([]);
  });

  it('never accept every answer in their pool', () => {
    const all = questions.filter((q) => validAnswers(q).length === (q.pool === 'champion' ? champions : items).length);
    expect(all.map((q) => q.id)).toEqual([]);
  });

  it('cover enough of each pool for daily variety', () => {
    expect(questions.filter((q) => q.pool === 'champion').length).toBeGreaterThanOrEqual(50);
    expect(questions.filter((q) => q.pool === 'item').length).toBeGreaterThanOrEqual(25);
  });

  it('list valid answers most popular first', () => {
    const answers = validAnswers(questions.find((q) => q.id === 'region-demacia')!);
    expect(answers.map((a) => a.popularity)).toEqual([...answers.map((a) => a.popularity)].sort((a, b) => a - b));
    expect(answers.map((a) => a.id)).toContain('Garen');
  });

  it('match items by stat, cost and build path', () => {
    const ids = (id: string) => validAnswers(questions.find((q) => q.id === id)!).map((a) => a.name);
    expect(ids('item-stat-lethality')).toContain("Youmuu's Ghostblade");
    expect(ids('item-cost-3000-plus')).toContain('Infinity Edge');
    expect(ids('item-from-long-sword')).toContain("Caulfield's Warhammer");
    expect(ids('item-from-long-sword')).not.toContain('Black Cleaver');
    expect(ids('item-from-long-sword')).not.toContain('Long Sword');
  });
});

describe('boots', () => {
  it('counts upgraded boots even when Data Dragon forgets the Boots tag', () => {
    const boots = validAnswers(questions.find((q) => q.id === 'item-boots')!).map((a) => a.name);
    expect(boots).toContain('Gunmetal Greaves');
    expect(boots).toContain('Boots');
  });
});
