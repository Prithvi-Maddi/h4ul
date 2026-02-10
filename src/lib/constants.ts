export const PREDEFINED_TAGS = {
  categories: [
    'tops',
    'bottoms',
    'outerwear',
    'shoes',
    'accessories',
    'dresses',
    'bags'
  ],
  vibes: [
    'casual',
    'formal',
    'streetwear',
    'vintage',
    'minimalist',
    'maximalist',
    'athleisure',
    'preppy'
  ],
  seasons: [
    'spring',
    'summer',
    'fall',
    'winter',
    'all-season'
  ]
};

export const ALL_TAGS = [
  ...PREDEFINED_TAGS.categories,
  ...PREDEFINED_TAGS.vibes,
  ...PREDEFINED_TAGS.seasons
];

export const LIMITS = {
  CAPTION_MAX_LENGTH: 500,
  BIO_MAX_LENGTH: 200,
  COLLECTION_NAME_MAX_LENGTH: 50,
  USERNAME_MAX_LENGTH: 30,
  POSTS_PER_PAGE: 20,
  IMAGE_MAX_SIZE_MB: 10,
  IMAGE_COMPRESSED_SIZE_MB: 2
};

export const DEFAULT_PROFILE_PHOTO = '/default-avatar.svg';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SETUP_PROFILE: '/setup-profile',
  FEED: '/feed',
  EXPLORE: '/explore',
  CREATE: '/create',
  WARDROBE: '/wardrobe',
  COLLECTIONS: '/collections',
  SETTINGS: '/settings',
  ADMIN: '/admin'
};
