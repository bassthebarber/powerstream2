// frontend/src/data/tvStations.js
// Southern Power Network - TV Station Registry
// Production-ready configuration for all stations

export const TV_STATIONS = {
  // Parent Hub
  hub: {
    id: 'southern-power-network',
    slug: 'southernpower',
    name: 'Southern Power Network',
    tagline: 'The Voice of the South',
    description: 'Your home for Southern culture, music, entertainment, and community.',
    logo: '/logos/southernpowernetworklogo.png',
    coverImage: '/images/spn-hero.jpg',
    theme: 'hub',
    isHub: true,
  },

  // Individual Stations
  stations: [
    {
      id: 'nolimit-east-houston',
      slug: 'nolimit',
      route: '/tv/nolimit',
      name: 'No Limit East Houston TV',
      tagline: 'Where the Culture Lives',
      description: 'MTV-style urban music channel featuring the hottest videos, live performances, and exclusive content from Houston\'s finest.',
      logo: '/logos/nolimiteasthoustonlogo.png',
      coverImage: '/images/nolimit-hero.jpg',
      theme: 'nolimit',
      category: 'music',
      features: ['live', 'vod', 'upload', 'schedule'],
      style: {
        primary: '#ff0050',
        secondary: '#00ff88',
        accent: '#ffff00',
        background: '#0a0a0a',
      },
    },
    {
      id: 'nolimit-forever',
      slug: 'nolimit-forever',
      route: '/tv/nolimit-forever',
      name: 'No Limit Forever TV',
      tagline: 'Premium Documentaries & Films',
      description: 'Master P presents: The definitive destination for documentaries, films, series, and exclusive premieres from the No Limit legacy.',
      logo: '/logos/nolimit-forever.logo.png.png',
      coverImage: '/images/nlf-hero.jpg',
      theme: 'nolimit-forever',
      category: 'premium',
      isPremium: true,
      features: ['vod', 'upload', 'collections'],
      collections: [
        { id: 'documentaries', name: 'Documentaries', icon: '🎬' },
        { id: 'films', name: 'Films', icon: '🎥' },
        { id: 'series', name: 'Series', icon: '📺' },
        { id: 'classics', name: 'Classics', icon: '⭐' },
        { id: 'premieres', name: 'Premieres', icon: '🎭' },
      ],
      style: {
        primary: '#d4af37',
        secondary: '#1a1a1a',
        accent: '#ffd700',
        background: '#0d0d0d',
      },
    },
    {
      id: 'texas-got-talent',
      slug: 'texas-got-talent',
      route: '/tv/texas-got-talent',
      name: 'Texas Got Talent',
      tagline: 'Discover Tomorrow\'s Stars Today',
      description: 'The ultimate talent showcase. Submit your performance, vote for your favorites, and watch stars rise.',
      logo: '/logos/texasgottalentlogo.png',
      coverImage: '/images/tgt-hero.jpg',
      theme: 'talent',
      category: 'entertainment',
      features: ['live', 'vod', 'upload', 'vote', 'schedule'],
      style: {
        primary: '#ffd700',
        secondary: '#ff6b35',
        accent: '#00d4ff',
        background: '#0f0f15',
      },
    },
    {
      id: 'civic-connect',
      slug: 'civic-connect',
      route: '/tv/civic-connect',
      name: 'Civic Connect TV',
      tagline: 'Community. News. Action.',
      description: 'Stay informed with local news, community discussions, and civic engagement programming.',
      logo: '/logos/civicconnectlogo.png',
      coverImage: '/images/civic-hero.jpg',
      theme: 'civic',
      category: 'news',
      features: ['live', 'vod', 'upload', 'schedule'],
      style: {
        primary: '#1e88e5',
        secondary: '#ffffff',
        accent: '#43a047',
        background: '#0a1929',
      },
    },
    {
      id: 'worldwide',
      slug: 'worldwide',
      route: '/tv/worldwide',
      name: 'PowerStream Worldwide TV',
      tagline: 'Global Entertainment Hub',
      description: 'Curated channels and content from around the world. One platform, endless perspectives.',
      logo: '/logos/worldwidetvlogo.png',
      coverImage: '/images/worldwide-hero.jpg',
      theme: 'worldwide',
      category: 'global',
      features: ['vod', 'channels', 'schedule'],
      regions: [
        { id: 'americas', name: 'Americas', flag: '🌎' },
        { id: 'europe', name: 'Europe', flag: '🌍' },
        { id: 'asia', name: 'Asia', flag: '🌏' },
        { id: 'africa', name: 'Africa', flag: '🌍' },
      ],
      style: {
        primary: '#7c4dff',
        secondary: '#00bcd4',
        accent: '#ff4081',
        background: '#0d0d1a',
      },
    },
    {
      id: 'southern-power-music',
      slug: 'southern-power-music',
      route: '/tv/southern-power-music',
      name: 'Southern Power Music TV',
      tagline: '24/7 Music Videos',
      description: 'Non-stop music videos from the South. Hip-hop, R&B, gospel, and more.',
      logo: '/logos/powerstream-logo.png',
      coverImage: '/images/spm-hero.jpg',
      theme: 'music',
      category: 'music',
      features: ['live', 'vod', 'schedule'],
      genres: [
        { id: 'hiphop', name: 'Hip-Hop', color: '#ff5722' },
        { id: 'rnb', name: 'R&B', color: '#9c27b0' },
        { id: 'gospel', name: 'Gospel', color: '#ffc107' },
        { id: 'country', name: 'Southern Country', color: '#795548' },
        { id: 'electronic', name: 'Electronic', color: '#00bcd4' },
      ],
      style: {
        primary: '#e6b800',
        secondary: '#ff1744',
        accent: '#00e676',
        background: '#0a0a0a',
      },
    },
  ],
};

// Get station by slug
export const getStationBySlug = (slug) => {
  return TV_STATIONS.stations.find(s => s.slug === slug);
};

// Get station by ID
export const getStationById = (id) => {
  return TV_STATIONS.stations.find(s => s.id === id);
};

// Get all stations in a category
export const getStationsByCategory = (category) => {
  return TV_STATIONS.stations.filter(s => s.category === category);
};

// Get hub config
export const getHubConfig = () => TV_STATIONS.hub;

// Station categories for filtering
export const STATION_CATEGORIES = [
  { id: 'all', name: 'All Stations', icon: '📺' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'premium', name: 'Premium', icon: '⭐' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎭' },
  { id: 'news', name: 'News & Community', icon: '📰' },
  { id: 'global', name: 'Global', icon: '🌍' },
];

export default TV_STATIONS;

