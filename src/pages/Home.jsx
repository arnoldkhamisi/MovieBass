import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import {
  searchMulti,
  getPopularMovies,
  getUpcomingMovies,
  getPopularTV,
  getTrendingTV,
} from "../services/api";
import "../css/Home.css";

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [popularMovies, setPopularMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [featured, setFeatured] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("movie"); // 'movie' or 'tv'

  const loadMedia = async () => {
    try {
      const [popMovies, upMovies, popTV, trendTV] = await Promise.all([
        getPopularMovies(),
        getUpcomingMovies().catch(() => []),
        getPopularTV().catch(() => []),
        getTrendingTV().catch(() => []),
      ]);
      setPopularMovies(popMovies);
      setUpcomingMovies(upMovies);
      setPopularTV(popTV);
      setTrendingTV(trendTV);

      if (popMovies && popMovies.length > 0) {
        // Pick top released movie with a valid backdrop for instant playback
        const today = new Date();
        const topReleased = popMovies.find(
          (m) => m.backdrop_path && (!m.release_date || new Date(m.release_date) <= today)
        );
        const topWithBackdrop = topReleased || popMovies.find((m) => m.backdrop_path) || popMovies[0];
        setFeatured(topWithBackdrop);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load content. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (loading) return;

    setLoading(true);
    setIsSearching(true);
    try {
      const results = await searchMulti(searchQuery);
      setSearchResults(results);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to search...");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
    setError(null);
  };

  return (
    <div className="home-netflix">
      {/* Netflix Billboard Hero (when not searching and featured is loaded) */}
      {!isSearching && featured && (
        <div
          className="netflix-billboard"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(20, 20, 20, 0.95) 0%, rgba(20, 20, 20, 0.7) 40%, rgba(20, 20, 20, 0.2) 70%, rgba(20, 20, 20, 0.9) 100%),
              linear-gradient(to bottom, rgba(20, 20, 20, 0.1) 0%, rgba(20, 20, 20, 0.6) 75%, #141414 100%),
              url(https://image.tmdb.org/t/p/original${featured.backdrop_path || featured.poster_path})
            `,
          }}
        >
          <div className="billboard-content">
            <div className="billboard-badge">
              <span className="n-logo">N</span> FEATURED SPOTLIGHT
            </div>

            <h1 className="billboard-title">{featured.title}</h1>

            <div className="billboard-meta">
              <span className="match-score">
                {featured.vote_average ? Math.min(99, Math.round(featured.vote_average * 10)) : 97}% Match
              </span>
              <span className="year">{featured.release_date?.split("-")[0]}</span>
              <span className="maturity">PG-13</span>
              <span className="quality">Ultra HD 4K</span>
            </div>

            <p className="billboard-overview">
              {featured.overview?.length > 200
                ? `${featured.overview.substring(0, 200)}...`
                : featured.overview}
            </p>

            <div className="billboard-actions">
              <button
                onClick={() => navigate(`/movie/${featured.id}?play=true`)}
                className="netflix-btn-play"
              >
                <span className="play-icon">▶</span> Play Now
              </button>

              <button
                onClick={() => navigate(`/movie/${featured.id}`)}
                className="netflix-btn-secondary"
              >
                ℹ More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="home-content-container">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="netflix-search-bar">
          <input
            type="text"
            placeholder="Search movies, TV shows, actors..."
            className="netflix-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="netflix-search-btn">
            Search
          </button>
          {isSearching && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="netflix-clear-btn"
            >
              Clear
            </button>
          )}
        </form>

        {/* Category Tabs */}
        {!isSearching && (
          <div className="netflix-tabs">
            <button
              className={`netflix-tab-btn ${activeTab === "movie" ? "active" : ""}`}
              onClick={() => setActiveTab("movie")}
            >
              Movies
            </button>
            <button
              className={`netflix-tab-btn ${activeTab === "tv" ? "active" : ""}`}
              onClick={() => setActiveTab("tv")}
            >
              TV Series
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="netflix-loading">
            <div className="netflix-spinner"></div>
            <span>Loading Content...</span>
          </div>
        ) : (
          <>
            {isSearching ? (
              <div className="netflix-section">
                <h2 className="shelf-title">
                  Search Results for "{searchQuery}"
                </h2>
                {searchResults.length > 0 ? (
                  <div className="movies-grid">
                    {searchResults.map((media) => (
                      <MovieCard movie={media} key={media.id} />
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>No results found for "{searchQuery}". Try another search term.</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {activeTab === "movie" ? (
                  <>
                    <div className="netflix-section">
                      <h2 className="shelf-title">Popular Movies</h2>
                      <div className="movies-grid">
                        {popularMovies.map((movie) => (
                          <MovieCard movie={movie} key={movie.id} />
                        ))}
                      </div>
                    </div>

                    {upcomingMovies.length > 0 && (
                      <div className="netflix-section">
                        <h2 className="shelf-title">Upcoming Releases</h2>
                        <div className="movies-grid">
                          {upcomingMovies.map((movie) => (
                            <MovieCard movie={movie} key={movie.id} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="netflix-section">
                      <h2 className="shelf-title">Popular TV Series</h2>
                      <div className="movies-grid">
                        {popularTV.map((tv) => (
                          <MovieCard
                            movie={{ ...tv, media_type: "tv" }}
                            key={tv.id}
                          />
                        ))}
                      </div>
                    </div>

                    {trendingTV.length > 0 && (
                      <div className="netflix-section">
                        <h2 className="shelf-title">Trending TV Series</h2>
                        <div className="movies-grid">
                          {trendingTV.map((tv) => (
                            <MovieCard
                              movie={{ ...tv, media_type: "tv" }}
                              key={tv.id}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
