/**
 * Make landing pages (/inventory/make/[make]) give each brand in stock one
 * crawlable, indexable URL instead of relying on ?make= filter URLs, which
 * stay noindexed to avoid thousands of near-duplicate filter combinations.
 * A brand needs at least this many vehicles in stock to get a page.
 */
export const MIN_VEHICLES_FOR_MAKE_PAGE = 2;

export function makePagePath(makeSlug: string): string {
  return `/inventory/make/${makeSlug}`;
}
