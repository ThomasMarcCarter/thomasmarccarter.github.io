import { describe, expect, it } from 'vitest';
import { questions, validAnswers, type Question } from '../data/questions';
import { rarestAnswer, scoreAnswer, tierForRank, tierOf } from './score';

const names = (n: number) => Array.from({ length: n }, (_, i) => tierForRank(i, n).name);

describe('tierForRank', () => {
  it('splits six answers with exactly one Challenger', () => {
    expect(names(6)).toEqual(['Silver', 'Silver', 'Gold', 'Platinum', 'Platinum', 'Challenger']);
  });
  it('splits twenty answers by the tier shares', () => {
    expect(names(20)).toEqual([
      ...Array(6).fill('Silver'),
      ...Array(5).fill('Gold'),
      ...Array(4).fill('Platinum'),
      ...Array(3).fill('Diamond'),
      'Master',
      'Challenger',
    ]);
  });
});

describe('scoring a question', () => {
  const question = questions.find((q) => q.id === 'region-demacia') as Question;
  const answers = validAnswers(question);

  it('gives the most popular answer Silver and the rarest Challenger', () => {
    expect(tierOf(question, answers[0].id)?.name).toBe('Silver');
    expect(tierOf(question, answers.at(-1)!.id)?.name).toBe('Challenger');
    expect(rarestAnswer(question)).toBe(answers.at(-1));
  });

  it('scores the tier points', () => {
    expect(scoreAnswer(question, answers.at(-1)!.id)).toMatchObject({ points: 100 });
  });

  it('scores 0 for a wrong answer or a timeout', () => {
    expect(scoreAnswer(question, 'Jinx')).toEqual({ tier: null, points: 0 });
    expect(scoreAnswer(question, null)).toEqual({ tier: null, points: 0 });
  });
});
