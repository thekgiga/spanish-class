export type GuideRubric = 'study' | 'learn' | 'live' | 'experience' | 'camps' | 'insights';

export interface GuideArticleMeta {
  slug: string;
  rubric: GuideRubric;
  order: number;
  /** i18n key in elite-guide namespace for the title, e.g. "articles.upis-fakulteta.title" */
  titleKey: string;
  /** i18n key for the excerpt shown on hub cards */
  excerptKey: string;
  heroImage?: string;
  /** Which service page this article's CTA should link to */
  ctaTarget: 'studies' | 'language' | 'camps' | 'consultation';
  /** Slugs of related articles shown at the bottom */
  related: string[];
  /** Locales for which a body .md file exists; sr always present */
  availableLocales: string[];
}

export const GUIDE_ARTICLES: GuideArticleMeta[] = [
  {
    slug: 'upis-fakulteta',
    rubric: 'study',
    order: 1,
    titleKey: 'articles.upis-fakulteta.title',
    excerptKey: 'articles.upis-fakulteta.excerpt',
    heroImage: '/imgs/brand/service-card-02.webp',
    ctaTarget: 'studies',
    related: ['unedasiss', 'pce-priprema', 'troskovi-studija'],
    availableLocales: ['sr'],
  },
  {
    slug: 'unedasiss',
    rubric: 'study',
    order: 2,
    titleKey: 'articles.unedasiss.title',
    excerptKey: 'articles.unedasiss.excerpt',
    heroImage: '/imgs/brand/service-card-02.webp',
    ctaTarget: 'studies',
    related: ['upis-fakulteta', 'pce-priprema'],
    availableLocales: ['sr'],
  },
  {
    slug: 'pce-priprema',
    rubric: 'study',
    order: 3,
    titleKey: 'articles.pce-priprema.title',
    excerptKey: 'articles.pce-priprema.excerpt',
    heroImage: '/imgs/brand/service-card-02.webp',
    ctaTarget: 'studies',
    related: ['unedasiss', 'upis-fakulteta'],
    availableLocales: ['sr'],
  },
  {
    slug: 'troskovi-studija',
    rubric: 'live',
    order: 4,
    titleKey: 'articles.troskovi-studija.title',
    excerptKey: 'articles.troskovi-studija.excerpt',
    heroImage: '/imgs/brand/service-card-04.webp',
    ctaTarget: 'consultation',
    related: ['koji-grad', 'smestaj', 'upis-fakulteta'],
    availableLocales: ['sr'],
  },
  {
    slug: 'dele-ili-siele',
    rubric: 'learn',
    order: 5,
    titleKey: 'articles.dele-ili-siele.title',
    excerptKey: 'articles.dele-ili-siele.excerpt',
    heroImage: '/imgs/brand/service-card-01.webp',
    ctaTarget: 'language',
    related: ['nivo-spanskog'],
    availableLocales: ['sr'],
  },
  {
    slug: 'nivo-spanskog',
    rubric: 'learn',
    order: 6,
    titleKey: 'articles.nivo-spanskog.title',
    excerptKey: 'articles.nivo-spanskog.excerpt',
    heroImage: '/imgs/brand/service-card-01.webp',
    ctaTarget: 'language',
    related: ['dele-ili-siele'],
    availableLocales: ['sr'],
  },
  {
    slug: 'koji-grad',
    rubric: 'live',
    order: 7,
    titleKey: 'articles.koji-grad.title',
    excerptKey: 'articles.koji-grad.excerpt',
    heroImage: '/imgs/brand/spain-decorative-outline.webp',
    ctaTarget: 'consultation',
    related: ['troskovi-studija', 'smestaj'],
    availableLocales: ['sr'],
  },
  {
    slug: 'smestaj',
    rubric: 'live',
    order: 8,
    titleKey: 'articles.smestaj.title',
    excerptKey: 'articles.smestaj.excerpt',
    heroImage: '/imgs/brand/service-card-04.webp',
    ctaTarget: 'consultation',
    related: ['koji-grad', 'troskovi-studija'],
    availableLocales: ['sr'],
  },
  {
    slug: 'prvi-jezicki-kamp',
    rubric: 'camps',
    order: 9,
    titleKey: 'articles.prvi-jezicki-kamp.title',
    excerptKey: 'articles.prvi-jezicki-kamp.excerpt',
    heroImage: '/imgs/brand/service-card-03.webp',
    ctaTarget: 'camps',
    related: [],
    availableLocales: ['sr'],
  },
  {
    slug: 'pet-stvari-spanija',
    rubric: 'experience',
    order: 10,
    titleKey: 'articles.pet-stvari-spanija.title',
    excerptKey: 'articles.pet-stvari-spanija.excerpt',
    heroImage: '/imgs/brand/spain-decorative-outline.webp',
    ctaTarget: 'consultation',
    related: ['koji-grad', 'prvi-boravak-madrid'],
    availableLocales: ['sr'],
  },
  {
    slug: 'prvi-boravak-madrid',
    rubric: 'insights',
    order: 11,
    titleKey: 'articles.prvi-boravak-madrid.title',
    excerptKey: 'articles.prvi-boravak-madrid.excerpt',
    heroImage: '/imgs/brand/hero-background-cream.webp',
    ctaTarget: 'consultation',
    related: ['pet-stvari-spanija', 'zasto-elite-education'],
    availableLocales: ['sr'],
  },
  {
    slug: 'zasto-elite-education',
    rubric: 'insights',
    order: 12,
    titleKey: 'articles.zasto-elite-education.title',
    excerptKey: 'articles.zasto-elite-education.excerpt',
    heroImage: '/imgs/brand/logo-transparent.webp',
    ctaTarget: 'consultation',
    related: ['prvi-boravak-madrid'],
    availableLocales: ['sr'],
  },
];

export const GUIDE_RUBRIC_ORDER: GuideRubric[] = [
  'study',
  'learn',
  'live',
  'experience',
  'camps',
  'insights',
];
