const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) ? import.meta.env.VITE_API_KEY : "c45a857c193f6302f2b5061c3b85e743";
const BASE_URL = "https://api.themoviedb.org/3";
const JUSTWATCH_API_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_JUSTWATCH_API_KEY : "";
const JUSTWATCH_BASE_URL = "https://apis.justwatch.com/content"; // Note: JustWatch doesn't require API key for basic usage
const YOUTUBE_API_KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_YOUTUBE_API_KEY : "";

export const getPopularMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch popular movies');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

export const searchMovies = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        query
      )}`
    );
    if (!response.ok) throw new Error('Failed to search movies');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const getMovieVideos = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch movie videos');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching movie videos:', error);
    throw error;
  }
};

export const getMovieRecommendations = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

export const getMovieCredits = async (movieId) => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch credits');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching credits:', error);
    throw error;
  }
};

export const getMovieStreamingProviders = async (movieId) => {
  try {
    // First get movie details to get the title
    const movieDetails = await getMovieDetails(movieId);
    const movieTitle = movieDetails.title;

    // JustWatch API call (no API key required for basic usage)
    const response = await fetch(`${JUSTWATCH_BASE_URL}/titles/en_US/popular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_types: ["movie"],
        query: movieTitle,
        page: 1,
        page_size: 1
      })
    });

    if (!response.ok) throw new Error('Failed to fetch streaming providers');
    const data = await response.json();

    // Extract streaming information from the first result
    if (data.items && data.items.length > 0) {
      const movie = data.items[0];
      return {
        title: movie.title,
        streaming_providers: movie.offers || [],
        justwatch_url: movie.full_path ? `https://www.justwatch.com${movie.full_path}` : null
      };
    }

    return { streaming_providers: [], justwatch_url: null };
  } catch (error) {
    console.error('Error fetching streaming providers:', error);
    // Return empty result instead of throwing to avoid breaking the app
    return { streaming_providers: [], justwatch_url: null };
  }
};

export const searchYouTubeMovies = async (movieTitle) => {
  try {
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured. Please add VITE_YOUTUBE_API_KEY to your .env file.');
    }

    const query = `${movieTitle} full movie`;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=relevance&maxResults=5&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('YouTube API quota exceeded or invalid API key. Please check your YouTube API key.');
      }
      throw new Error('Failed to search YouTube');
    }
    const data = await response.json();

    return data.items?.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    })) || [];
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw error; // Re-throw so the component can handle it
  }
};

export const getUpcomingMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch upcoming movies');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
};

export const getGenres = async () => {
  try {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch genres');
    const data = await response.json();
    return data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

export const getPopularTV = async () => {
  try {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch popular TV series');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching popular TV series:', error);
    throw error;
  }
};

export const getTrendingTV = async () => {
  try {
    const response = await fetch(`${BASE_URL}/trending/tv/day?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch trending TV series');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching trending TV series:', error);
    throw error;
  }
};

export const searchMulti = async (query) => {
  try {
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Failed to search');
    const data = await response.json();
    // Filter out person results
    return data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

export const getTVDetails = async (tvId) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch TV details');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching TV details:', error);
    throw error;
  }
};

export const getTVSeasonDetails = async (tvId, seasonNumber) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch season details');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching season details:', error);
    throw error;
  }
};

export const getTVVideos = async (tvId) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/videos?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch TV videos');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching TV videos:', error);
    return [];
  }
};

export const getTVCredits = async (tvId) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/credits?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch TV credits');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching TV credits:', error);
    return { cast: [], crew: [] };
  }
};

export const getTVRecommendations = async (tvId) => {
  try {
    const response = await fetch(`${BASE_URL}/tv/${tvId}/recommendations?api_key=${API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch TV recommendations');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching TV recommendations:', error);
    return [];
  }
};