/**
 * Image utilities for food courts and food items.
 *
 * Uses free Unsplash source images — no API key required.
 * Images are mapped by food court name keywords and food item category/name
 * so the UI shows relevant pictures without any DB changes.
 */

// ─── Food Court Images ────────────────────────────────────────────────────────
// Curated Unsplash photo IDs for each food court type.
// Format: https://images.unsplash.com/photo-<ID>?w=600&q=80&fit=crop
const FOOD_COURT_IMAGES = {
  'bh-1':         'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80&fit=crop',
  'bh':           'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80&fit=crop',
  'hostel':       'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80&fit=crop',
  'central':      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80&fit=crop',
  'mess':         'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80&fit=crop',
  'engineering':  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&fit=crop',
  'library':      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80&fit=crop',
  'cafe':         'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80&fit=crop',
  'mba':          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80&fit=crop',
  'medical':      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&fit=crop',
  'nk':           'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=80&fit=crop',
  'new campus':   'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80&fit=crop',
  'new':          'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80&fit=crop',
  'research':     'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80&fit=crop',
  'sports':       'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80&fit=crop',
  'canteen':      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80&fit=crop',
  'cafeteria':    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80&fit=crop',
};

const FOOD_COURT_DEFAULT =
  'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&q=80&fit=crop';

/**
 * Returns an image URL for a food court based on its name.
 * Falls back to a generic food-hall photo.
 * @param {string} name - food court name
 * @returns {string} image URL
 */
export function getFoodCourtImage(name = '') {
  const lower = name.toLowerCase();
  for (const [keyword, url] of Object.entries(FOOD_COURT_IMAGES)) {
    if (lower.includes(keyword)) return url;
  }
  return FOOD_COURT_DEFAULT;
}

// ─── Food Item Images ─────────────────────────────────────────────────────────
// Mapped by category first, then by name keyword.
const CATEGORY_IMAGES = {
  'north indian':   'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80&fit=crop',
  'south indian':   'https://images.unsplash.com/photo-1630409346824-4f0e7b080087?w=400&q=80&fit=crop',
  'chinese':        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80&fit=crop',
  'fast food':      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80&fit=crop',
  'burger':         'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80&fit=crop',
  'pizza':          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80&fit=crop',
  'sandwich':       'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&q=80&fit=crop',
  'snacks':         'https://images.unsplash.com/photo-1601050690117-94f5f7a17f0c?w=400&q=80&fit=crop',
  'snack':          'https://images.unsplash.com/photo-1601050690117-94f5f7a17f0c?w=400&q=80&fit=crop',
  'beverages':      'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80&fit=crop',
  'beverage':       'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80&fit=crop',
  'drinks':         'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80&fit=crop',
  'tea':            'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80&fit=crop',
  'coffee':         'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80&fit=crop',
  'dessert':        'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80&fit=crop',
  'sweet':          'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80&fit=crop',
  'breakfast':      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80&fit=crop',
  'lunch':          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80&fit=crop',
  'dinner':         'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80&fit=crop',
  'thali':          'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&q=80&fit=crop',
  'rice':           'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80&fit=crop',
  'biryani':        'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&q=80&fit=crop',
  'roti':           'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80&fit=crop',
  'noodles':        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80&fit=crop',
  'pasta':          'https://images.unsplash.com/photo-1551183053-bf91798d792b?w=400&q=80&fit=crop',
  'salad':          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80&fit=crop',
  'healthy':        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80&fit=crop',
  'veg':            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80&fit=crop',
  'dal':            'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80&fit=crop',
  'curry':          'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80&fit=crop',
  'dosa':           'https://images.unsplash.com/photo-1630409346824-4f0e7b080087?w=400&q=80&fit=crop',
  'idli':           'https://images.unsplash.com/photo-1630409346824-4f0e7b080087?w=400&q=80&fit=crop',
  'samosa':         'https://images.unsplash.com/photo-1601050690117-94f5f7a17f0c?w=400&q=80&fit=crop',
  'juice':          'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80&fit=crop',
  'shake':          'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80&fit=crop',
  'ice cream':      'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80&fit=crop',
  'wrap':           'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80&fit=crop',
  'rolls':          'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80&fit=crop',
  'soup':           'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80&fit=crop',
};

const FOOD_ITEM_DEFAULT =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80&fit=crop';

/**
 * Returns an image URL for a food item based on its category and/or name.
 * If the item already has image_url from the DB, that takes priority.
 * @param {Object} item - food item object with { image_url, category, name }
 * @returns {string} image URL
 */
export function getFoodItemImage(item = {}) {
  if (item.image_url) return item.image_url;

  const haystack = `${item.category || ''} ${item.name || ''}`.toLowerCase();
  for (const [keyword, url] of Object.entries(CATEGORY_IMAGES)) {
    if (haystack.includes(keyword)) return url;
  }
  return FOOD_ITEM_DEFAULT;
}
