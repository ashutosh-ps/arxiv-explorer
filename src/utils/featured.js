import { featuredCategories } from '../data/categories';

const MS_PER_DAY = 86_400_000;

/**
 * Pick the "topic of the day" for the Featured Papers section.
 *
 * Deterministic: the same calendar day (UTC) always maps to the same category,
 * so every visitor sees the same query that day and the edge cache stays warm.
 * Rotates one step per day, cycling through the full featuredCategories pool.
 *
 * @param {Date} [date=new Date()] - reference date (injectable for testing)
 * @returns {object|null} a featuredCategories entry, or null if the pool is empty
 */
export const getFeaturedCategoryForToday = (date = new Date()) => {
  const pool = featuredCategories;
  if (!pool.length) return null;

  const daysSinceEpoch = Math.floor(date.getTime() / MS_PER_DAY);
  // Guard against negative day numbers so the index is always in range.
  const index = ((daysSinceEpoch % pool.length) + pool.length) % pool.length;
  return pool[index];
};
