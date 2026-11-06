export const STREAMING_SERVERS = [
  {
    id: "autoembed",
    name: "Server 1 (AutoEmbed)",
    tag: "Primary",
    isRecommended: true,
    getUrl: (isTv, id, season = 1, episode = 1) =>
      isTv
        ? `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`
        : `https://autoembed.co/movie/tmdb/${id}`,
  },
  {
    id: "autoembed-mirror",
    name: "Server 2 (AutoEmbed Mirror)",
    tag: "Direct",
    getUrl: (isTv, id, season = 1, episode = 1) =>
      isTv
        ? `https://player.autoembed.me/embed/tv/${id}/${season}/${episode}`
        : `https://player.autoembed.me/embed/movie/${id}`,
  },
  {
    id: "smashystream",
    name: "Server 3 (SmashyStream)",
    tag: "HD Stream",
    getUrl: (isTv, id, season = 1, episode = 1) =>
      isTv
        ? `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${id}`,
  },
  {
    id: "vidlink",
    name: "Server 4 (VidLink)",
    tag: "Fast",
    getUrl: (isTv, id, season = 1, episode = 1) =>
      isTv
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=ff6b00`
        : `https://vidlink.pro/movie/${id}?primaryColor=ff6b00`,
  },
  {
    id: "vidsrc-su",
    name: "Server 5 (VidSrc SU)",
    tag: "Backup",
    getUrl: (isTv, id, season = 1, episode = 1) =>
      isTv
        ? `https://vidsrc.su/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.su/embed/movie/${id}`,
  },
  {
    id: "multiembed",
    name: "Server 6 (MultiEmbed)",
    tag: "Global Mirror",
    getUrl: (isTv, id, season = 1, episode = 1) =>
      isTv
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
];
