import { getFeaturedCategoryForToday } from './featured';
import { featuredCategories } from '../data/categories';

describe('getFeaturedCategoryForToday', () => {
  test('returns one of the featured categories', () => {
    const cat = getFeaturedCategoryForToday(new Date('2026-06-15T12:00:00Z'));
    expect(featuredCategories).toContain(cat);
  });

  test('is stable within a single UTC day', () => {
    const morning = getFeaturedCategoryForToday(new Date('2026-06-15T00:30:00Z'));
    const night = getFeaturedCategoryForToday(new Date('2026-06-15T23:30:00Z'));
    expect(morning).toBe(night);
  });

  test('rotates daily — covers every category over a full cycle', () => {
    const seen = new Set();
    for (let i = 0; i < featuredCategories.length; i++) {
      seen.add(getFeaturedCategoryForToday(new Date(Date.UTC(2026, 0, 1 + i))).id);
    }
    expect(seen.size).toBe(featuredCategories.length);
  });

  test('defaults to the current date when called with no argument', () => {
    expect(featuredCategories).toContain(getFeaturedCategoryForToday());
  });
});
