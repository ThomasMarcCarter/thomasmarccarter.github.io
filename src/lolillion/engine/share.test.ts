import { describe, expect, it } from 'vitest';
import { buildShareString } from './share';

describe('buildShareString', () => {
  it('shows the score, one square per prompt and the link, without answers', () => {
    expect(
      buildShareString(
        { number: 42, tiers: ['Gold', 'Platinum', 'Silver', 'Master', null, 'Diamond', 'Challenger'] },
        'https://example.com/lolillion/',
      ),
    ).toBe('Lolillion #42  295 LP\n🟨🟩⬜🟪❌🟦🟥\nhttps://example.com/lolillion/');
  });
});
