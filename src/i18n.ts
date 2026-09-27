// Everything that changes between the English and the French site lives here:
// URLs, topic names, interface labels and the home page copy.

export const LANGS = ['en', 'fr'] as const;
export type Lang = (typeof LANGS)[number];

export const TOPICS = ['culture', 'money', 'settling-in', 'getting-here'] as const;
export type Topic = (typeof TOPICS)[number];

export const SITE_NAME = 'Pas de Panique';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix a root relative path with the configured base path. */
export function withBase(path: string): string {
  return `${base}${path}`;
}

const prefix: Record<Lang, string> = { en: '', fr: '/fr' };

const segments = {
  en: { articles: 'articles', topics: 'topics', about: 'about', disclaimer: 'disclaimer' },
  fr: { articles: 'articles', topics: 'themes', about: 'a-propos', disclaimer: 'avertissement' },
} as const;

export const topicSlugs: Record<Lang, Record<Topic, string>> = {
  en: { culture: 'culture', money: 'money', 'settling-in': 'settling-in', 'getting-here': 'getting-here' },
  fr: { culture: 'culture', money: 'argent', 'settling-in': 's-installer', 'getting-here': 'y-arriver' },
};

export const routes = {
  home: (lang: Lang) => withBase(`${prefix[lang]}/`),
  article: (lang: Lang, slug: string) => withBase(`${prefix[lang]}/${segments[lang].articles}/${slug}/`),
  topics: (lang: Lang) => withBase(`${prefix[lang]}/${segments[lang].topics}/`),
  topic: (lang: Lang, topic: Topic) =>
    withBase(`${prefix[lang]}/${segments[lang].topics}/${topicSlugs[lang][topic]}/`),
  about: (lang: Lang) => withBase(`${prefix[lang]}/${segments[lang].about}/`),
  disclaimer: (lang: Lang) => withBase(`${prefix[lang]}/${segments[lang].disclaimer}/`),
  rss: (lang: Lang) => withBase(`${prefix[lang]}/rss.xml`),
};

export type Alternates = Partial<Record<Lang, string>>;

/** Same page in both languages, for pages that exist in both. */
export function alternatesFor(route: (lang: Lang) => string): Alternates {
  return { en: route('en'), fr: route('fr') };
}

export const topicNames: Record<Lang, Record<Topic, string>> = {
  en: { culture: 'Culture', money: 'Money', 'settling-in': 'Settling in', 'getting-here': 'Getting here' },
  fr: { culture: 'Culture', money: 'Argent', 'settling-in': "S'installer", 'getting-here': 'Y arriver' },
};

export const topicBlurbs: Record<Lang, Record<Topic, string>> = {
  en: {
    culture: 'How people think, work and make friends.',
    money: 'Salaries, credit scores and tipping.',
    'settling-in': 'Housing and health insurance in your first months.',
    'getting-here': 'Visas and finding a job that sponsors you.',
  },
  fr: {
    culture: 'Comment les gens pensent, travaillent et se font des amis.',
    money: 'Salaires, credit score et pourboires.',
    'settling-in': 'Le logement et l’assurance santé pendant les premiers mois.',
    'getting-here': 'Les visas et trouver un employeur qui te sponsorise.',
  },
};

export const ui = {
  en: {
    locale: 'en_US',
    dateLocale: 'en-US',
    tagline: 'Moving to the US from France? Here is what nobody tells you.',
    homeTitle: 'Moving to the US from France',
    description:
      'Honest notes from a young French guy a couple of years into American life. How people think, how you make friends, and how money, housing and health actually work here.',
    skip: 'Skip to content',
    navLabel: 'Main',
    topics: 'Topics',
    allTopics: 'All topics',
    about: 'About',
    disclaimer: 'Disclaimer',
    rss: 'RSS',
    home: 'Home',
    switchTo: 'Français',
    switchToLabel: 'Lire en français',
    startHere: 'Start here',
    byTopic: 'By topic',
    minRead: (n: number) => `${n} min read`,
    published: 'Published',
    keepReading: 'Keep reading',
    articlesIn: (topic: string) => `Articles about ${topic.toLowerCase()}`,
    articleCount: (n: number) => (n === 1 ? '1 article' : `${n} articles`),
    filterLabel: 'Filter by topic',
    all: 'All',
    topicsIntro: 'Every article, grouped by topic. Culture first, paperwork second.',
    topicMeta: 'Honest notes for young French people moving to the US.',
    notAdvice:
      'This is my own experience, not legal, tax, medical or financial advice.',
    readDisclaimer: 'Read the disclaimer',
    footer: 'Written by a French guy living in Florida. Personal experience, not professional advice.',
    notFoundTitle: 'Page not found',
    notFoundText: 'This page does not exist, or it moved. Nobody told you, and nobody told me either.',
    backHome: 'Back to the home page',
    rssTitle: 'All articles',
  },
  fr: {
    locale: 'fr_FR',
    dateLocale: 'fr-FR',
    tagline: 'Tu pars vivre aux États-Unis ? Voici ce que personne ne te dit.',
    homeTitle: 'Partir vivre aux États-Unis',
    description:
      'Des notes honnêtes d’un jeune Français installé aux États-Unis depuis deux ans. Comment les gens pensent, comment on se fait des amis, et comment l’argent, le logement et la santé fonctionnent vraiment ici.',
    skip: 'Aller au contenu',
    navLabel: 'Principal',
    topics: 'Thèmes',
    allTopics: 'Tous les thèmes',
    about: 'À propos',
    disclaimer: 'Avertissement',
    rss: 'RSS',
    home: 'Accueil',
    switchTo: 'English',
    switchToLabel: 'Read in English',
    startHere: 'Par où commencer',
    byTopic: 'Par thème',
    minRead: (n: number) => `${n} min de lecture`,
    published: 'Publié le',
    keepReading: 'À lire aussi',
    articlesIn: (topic: string) => `Articles : ${topic}`,
    articleCount: (n: number) => (n === 1 ? '1 article' : `${n} articles`),
    filterLabel: 'Filtrer par thème',
    all: 'Tous',
    topicsIntro: 'Tous les articles, classés par thème. La culture d’abord, la paperasse ensuite.',
    topicMeta: 'Des notes honnêtes pour les jeunes Français qui partent vivre aux États-Unis.',
    notAdvice:
      'C’est mon expérience personnelle, pas un conseil juridique, fiscal, médical ou financier.',
    readDisclaimer: 'Lire l’avertissement',
    footer:
      'Écrit par un Français qui vit en Floride. Une expérience personnelle, pas un conseil professionnel.',
    notFoundTitle: 'Page introuvable',
    notFoundText: 'Cette page n’existe pas, ou elle a bougé. Personne ne te l’a dit, et à moi non plus.',
    backHome: 'Retour à l’accueil',
    rssTitle: 'Tous les articles',
  },
} as const;

// Type check: the French labels must cover every English label (and the reverse).
ui.fr satisfies Record<keyof typeof ui.en, unknown>;
ui.en satisfies Record<keyof typeof ui.fr, unknown>;

/** Home page copy. Featured posts are listed by key, in display order. */
export const home = {
  en: {
    headline: 'Moving to the US from France? Here is what nobody tells you.',
    subhead:
      'Honest notes from a young French guy a couple of years into American life. How people think, how you make friends, and how money, housing and health actually work here.',
    intro:
      'I spent most of my life in France before moving to the US for work. The paperwork was hard, but it was not the part that surprised me. What surprised me was how differently people think, how friendships form, and how many small systems (credit, tipping, health insurance, leases) run on rules nobody explains to you. This site is what I wish someone had told me before I landed.',
    featured: [
      { key: 'americans-run-on-momentum', label: 'Americans run on momentum' },
      { key: 'making-friends-find-your-community', label: 'Making friends: find your community' },
      { key: 'finding-a-place-to-live', label: 'Finding a place to live when you have no credit history' },
    ],
  },
  fr: {
    headline: 'Tu pars vivre aux États-Unis ? Voici ce que personne ne te dit.',
    subhead:
      'Des notes honnêtes d’un jeune Français installé aux États-Unis depuis deux ans. Comment les gens pensent, comment on se fait des amis, et comment l’argent, le logement et la santé fonctionnent vraiment ici.',
    intro:
      'J’ai passé la plus grande partie de ma vie en France avant de partir aux États-Unis pour le travail. La paperasse a été difficile, mais ce n’est pas ce qui m’a surpris. Ce qui m’a surpris, c’est à quel point les gens pensent différemment, comment les amitiés se forment, et combien de petits systèmes (le crédit, le pourboire, l’assurance santé, les baux) reposent sur des règles que personne ne t’explique. Ce site, c’est ce que j’aurais aimé qu’on me dise avant d’atterrir.',
    featured: [
      { key: 'americans-run-on-momentum', label: 'Les Américains carburent à l’élan' },
      { key: 'making-friends-find-your-community', label: 'Se faire des amis : trouve ta communauté' },
      { key: 'finding-a-place-to-live', label: 'Trouver un logement quand tu n’as aucun historique de crédit' },
    ],
  },
} as const;

export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(ui[lang].dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
