import { COLOR_PALETTE, NEUTRAL_COLOR } from '@/config/game';
import { textOn } from '@/lib/text-on';

describe('textOn', () => {
  it('picks dark text on the light palette colours', () => {
    for (const hex of ['#33DCFF', '#F0E442', '#D085AA', '#00A96F', '#FE4614']) {
      expect(textOn(hex)).toBe('#000000');
    }
  });

  it('picks dark text on the neutral colour', () => {
    expect(textOn(NEUTRAL_COLOR)).toBe('#000000');
  });

  it('picks white text on the dark blue', () => {
    expect(textOn('#1B6BAA')).toBe('#ffffff');
  });

  it('answers for every palette colour', () => {
    for (const hex of COLOR_PALETTE) {
      expect(['#000000', '#ffffff']).toContain(textOn(hex));
    }
  });
});
