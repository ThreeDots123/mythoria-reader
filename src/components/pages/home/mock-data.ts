export interface MockNewSeries {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  novelType: "NOVEL" | "COMIC";
  timeAgo: string;
  rating: number | null;
  views: number;
}

export interface MockOnSaleItem {
  id: string;
  title: string;
  slug: string;
  featuredImage: string;
  discountPercent: number;
  timeLeft: string;
  rating: number | null;
  views: number;
}

export interface MockCollection {
  id: string;
  name: string;
  emoji: string;
  description: string;
  genres: string[];
  novelCount: number;
  views: number;
  likes: number;
  badge: "NOVELS" | "COMICS";
}

export const mockNewSeries: MockNewSeries[] = [
  {
    id: "ns-1",
    title: "I Became the Leader of the Monster Circus",
    slug: "i-became-the-leader-of-the-monster-circus",
    featuredImage: "/placeholder.svg",
    novelType: "NOVEL",
    timeAgo: "3h ago",
    rating: 10.0,
    views: 109,
  },
  {
    id: "ns-2",
    title: "My Disciple Came to Kill Me",
    slug: "my-disciple-came-to-kill-me",
    featuredImage: "/placeholder.svg",
    novelType: "NOVEL",
    timeAgo: "4h ago",
    rating: null,
    views: 88,
  },
  {
    id: "ns-3",
    title: "The baseball manager awakens his hidden talent",
    slug: "the-baseball-manager-awakens",
    featuredImage: "/placeholder.svg",
    novelType: "NOVEL",
    timeAgo: "4h ago",
    rating: null,
    views: 6,
  },
  {
    id: "ns-4",
    title: "The Urban Legends Fear Me",
    slug: "the-urban-legends-fear-me",
    featuredImage: "/placeholder.svg",
    novelType: "NOVEL",
    timeAgo: "4h ago",
    rating: null,
    views: 0,
  },
  {
    id: "ns-5",
    title: "I Became the Obsessed-Over Target",
    slug: "i-became-the-obsessed-over-target",
    featuredImage: "/placeholder.svg",
    novelType: "NOVEL",
    timeAgo: "5h ago",
    rating: null,
    views: 0,
  },
  {
    id: "ns-6",
    title: "I'm a Barbarian, but I'm a Paladin",
    slug: "im-a-barbarian-but-im-a-paladin",
    featuredImage: "/placeholder.svg",
    novelType: "NOVEL",
    timeAgo: "6h ago",
    rating: null,
    views: 130,
  },
  {
    id: "ns-7",
    title: "It stood tall between my legs after I was reborn",
    slug: "it-stood-tall-between-my-legs",
    featuredImage: "/placeholder.svg",
    novelType: "NOVEL",
    timeAgo: "6h ago",
    rating: null,
    views: 0,
  },
  {
    id: "ns-8",
    title: "I Became the Genius Magician the Hero's Party Needed",
    slug: "i-became-the-genius-magician",
    featuredImage: "/placeholder.svg",
    novelType: "NOVEL",
    timeAgo: "6h ago",
    rating: null,
    views: 468,
  },
];

export const mockOnSaleItems: MockOnSaleItem[] = [
  {
    id: "os-1",
    title: "Surviving as a Black Market Merchant in the Demon Realm",
    slug: "surviving-as-a-black-market-merchant",
    featuredImage: "/placeholder.svg",
    discountPercent: 40,
    timeLeft: "1d 8h left",
    rating: 2.0,
    views: 2000,
  },
  {
    id: "os-2",
    title: "The Otherworldly Golden Sun Incubus",
    slug: "the-otherworldly-golden-sun-incubus",
    featuredImage: "/placeholder.svg",
    discountPercent: 40,
    timeLeft: "1d 8h left",
    rating: null,
    views: 2000,
  },
  {
    id: "os-3",
    title: "Overpowered Archmage Doesn't Hide His Talent",
    slug: "overpowered-archmage",
    featuredImage: "/placeholder.svg",
    discountPercent: 40,
    timeLeft: "4d 8h left",
    rating: null,
    views: 758,
  },
  {
    id: "os-4",
    title: "I Became the Leader of the Monster Circus",
    slug: "i-became-the-leader-of-the-monster-circus-sale",
    featuredImage: "/placeholder.svg",
    discountPercent: 40,
    timeLeft: "4d 8h left",
    rating: 10.0,
    views: 109,
  },
  {
    id: "os-5",
    title: "A Transcendent Gourmet's Daily Life",
    slug: "a-transcendent-gourmets-daily-life",
    featuredImage: "/placeholder.svg",
    discountPercent: 33,
    timeLeft: "63d 8h left",
    rating: null,
    views: 249,
  },
  {
    id: "os-6",
    title: "I Accidentally Installed a Cute Girl Mod in a Medieval Game",
    slug: "i-accidentally-installed-a-cute-girl-mod",
    featuredImage: "/placeholder.svg",
    discountPercent: 30,
    timeLeft: "38d 8h left",
    rating: 10.0,
    views: 5100,
  },
  {
    id: "os-7",
    title: "Healing Camping Stream",
    slug: "healing-camping-stream",
    featuredImage: "/placeholder.svg",
    discountPercent: 30,
    timeLeft: "15d 20h left",
    rating: 4.0,
    views: 1600,
  },
  {
    id: "os-8",
    title: "The Lord Who Can't Use Magic Worships the Stars",
    slug: "the-lord-who-cant-use-magic",
    featuredImage: "/placeholder.svg",
    discountPercent: 30,
    timeLeft: "38d 8h left",
    rating: 8.0,
    views: 1500,
  },
];

export const mockCollections: MockCollection[] = [
  {
    id: "col-1",
    name: "Born Invincible",
    emoji: "👑",
    description:
      "Some people are just built different. Overpowered from chapter one, and th...",
    genres: ["Action"],
    novelCount: 44,
    views: 3600,
    likes: 2,
    badge: "NOVELS",
  },
  {
    id: "col-2",
    name: "Pretend Until It's...",
    emoji: "🤝",
    description:
      "Fake dates, pretend marriages, and contract relationships where acting in...",
    genres: ["Romance"],
    novelCount: 26,
    views: 2900,
    likes: 1,
    badge: "NOVELS",
  },
  {
    id: "col-3",
    name: "Love Knows No Gender",
    emoji: "🌈",
    description:
      "When your gender changes, does your heart change too? Gender-bending...",
    genres: ["Gender Bender", "Romance"],
    novelCount: 6,
    views: 2800,
    likes: 2,
    badge: "NOVELS",
  },
  {
    id: "col-4",
    name: "Dystopia Now",
    emoji: "🏚️",
    description:
      "Totalitarian regimes, controlled populations, and the brave souls who...",
    genres: ["Sci-Fi"],
    novelCount: 23,
    views: 1900,
    likes: 4,
    badge: "NOVELS",
  },
  {
    id: "col-5",
    name: "War Drums",
    emoji: "🏴",
    description:
      "Armies clash, generals scheme, and nations burn. Grand-scale military...",
    genres: ["Military", "Action"],
    novelCount: 25,
    views: 1700,
    likes: 1,
    badge: "NOVELS",
  },
];

export function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}
