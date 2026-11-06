import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getMovieRecommendations,
} from "../services/api";
import { STREAMING_SERVERS } from "../services/streaming";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import "../css/MovieDetails.css";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoPlay = searchParams.get("play") === "true";

  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const favorite = isFavorite(Number(id));

  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [serverIndex, setServerIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);

  const playerRef = useRef(null);
  const cinemaSectionRef = useRef(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      setError(null);
      setIsPlaying(autoPlay);
      setServerIndex(0);

      try {
        const [details, castData, videos, recs] = await Promise.all([
          getMovieDetails(id),
          getMovieCredits(id).catch(() => ({ cast: [] })),
          getMovieVideos(id).catch(() => []),
          getMovieRecommendations(id).catch(() => []),
        ]);

        setMovie(details);
        setCredits(castData);
        setRecommendations(recs);

        const officialTrailer =
          videos.find(
            (v) =>
              v.site === "YouTube" &&
              (v.type === "Trailer" || v.type === "Teaser")
          ) || videos.find((v) => v.site === "YouTube");

        if (officialTrailer) {
          setTrailerKey(officialTrailer.key);
        } else {
          setTrailerKey(null);
        }
      } catch (err) {
        console.error("Failed to load movie details:", err);
        setError("Failed to load movie details. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
    window.scrollTo(0, 0);
  }, [id, autoPlay]);

  // Handle auto-scroll if autoPlay is triggered
  useEffect(() => {
    if (isPlaying && cinemaSectionRef.current) {
      cinemaSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isPlaying]);

  const handlePlayClick = () => {
    setIsPlaying(true);
    setTimeout(() => {
      cinemaSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleServerChange = (index) => {
    setIsPlayerLoading(true);
    setServerIndex(index);
    setTimeout(() => setIsPlayerLoading(false), 600);
  };

  const handleFavoriteToggle = () => {
    if (!movie) return;
    if (favorite) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  };

  const toggleFullScreen = () => {
    const elem = playerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => setIsFullScreen(true));
      } else {
        setIsFullScreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => setIsFullScreen(false));
      } else {
        setIsFullScreen(false);
      }
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  if (loading) {
    return (
      <div className="netflix-loading">
        <div className="netflix-spinner"></div>
        <span>Loading Movie...</span>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="netflix-error-view">
        <h2>{error || "Movie not found"}</h2>
        <button onClick={() => navigate("/")} className="netflix-btn-secondary">
          Return to Home
        </button>
      </div>
    );
  }

  const releaseYear = movie.release_date?.split("-")[0] || "N/A";
  const isUpcoming = movie.release_date
    ? new Date(movie.release_date) > new Date()
    : false;
  const matchScore = movie.vote_average
    ? Math.min(99, Math.round(movie.vote_average * 10))
    : 95;
  const runtimeHours = movie.runtime ? Math.floor(movie.runtime / 60) : 0;
  const runtimeMins = movie.runtime ? movie.runtime % 60 : 0;
  const runtimeFormatted =
    movie.runtime > 0
      ? `${runtimeHours > 0 ? `${runtimeHours}h ` : ""}${runtimeMins}m`
      : null;

  const currentEmbedUrl = STREAMING_SERVERS[serverIndex].getUrl(false, movie.id);

  return (
    <div className="netflix-movie-page">
      {/* Cinematic Hero Section */}
      <div
        className="netflix-hero"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(20, 20, 20, 0.98) 0%, rgba(20, 20, 20, 0.85) 35%, rgba(20, 20, 20, 0.4) 65%, rgba(20, 20, 20, 0.9) 100%),
            linear-gradient(to bottom, rgba(20, 20, 20, 0.2) 0%, rgba(20, 20, 20, 0.7) 70%, #141414 100%),
            url(${
              movie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                : `https://image.tmdb.org/t/p/original${movie.poster_path}`
            })
          `,
        }}
      >
        <button onClick={() => navigate(-1)} className="netflix-back-nav">
          ← Back
        </button>

        <div className="netflix-hero-content">
          <div className="netflix-type-badge">
            <span className="netflix-n-badge">N</span> FILM
          </div>

          <h1 className="netflix-title">{movie.title}</h1>

          {movie.tagline && (
            <p className="netflix-tagline">"{movie.tagline}"</p>
          )}

          {/* Metadata badges row */}
          <div className="netflix-meta-row">
            <span className="netflix-match">{matchScore}% Match</span>
            <span className="netflix-year">{releaseYear}</span>
            <span className="netflix-maturity-badge">
              {movie.adult ? "18+" : "PG-13"}
            </span>
            {runtimeFormatted && (
              <span className="netflix-runtime">{runtimeFormatted}</span>
            )}
            <span className="netflix-quality-badge">Ultra HD 4K</span>
            <span className="netflix-quality-badge">5.1 Audio</span>
          </div>

          {/* Plot Overview */}
          <p className="netflix-overview">{movie.overview}</p>

          {/* Genres row */}
          {movie.genres?.length > 0 && (
            <div className="netflix-genres">
              <span className="netflix-genres-label">Genres:</span>
              {movie.genres.map((g) => (
                <span key={g.id} className="netflix-genre-pill">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="netflix-actions-row">
            <button onClick={handlePlayClick} className="netflix-btn-play">
              <span className="play-icon">▶</span> Play Movie
            </button>

            {trailerKey && (
              <button
                onClick={() => setShowTrailerModal(true)}
                className="netflix-btn-secondary"
              >
                🎬 Watch Trailer
              </button>
            )}

            <button
              onClick={handleFavoriteToggle}
              className={`netflix-btn-secondary ${favorite ? "is-favorite" : ""}`}
              title={favorite ? "Remove from My List" : "Add to My List"}
            >
              {favorite ? "✓ In My List" : "+ My List"}
            </button>
          </div>
        </div>
      </div>

      {/* Direct Cinema Player Section */}
      <div ref={cinemaSectionRef} className="netflix-cinema-section">
        <div className="netflix-section-container">
          <div className="cinema-header">
            <div className="cinema-title-area">
              <span className="live-indicator"></span>
              <h2>Now Playing: {movie.title}</h2>
            </div>

            {/* Straightforward Server Switcher */}
            <div className="cinema-servers-wrapper">
              <span className="server-label">Server:</span>
              <div className="cinema-server-pills">
                {STREAMING_SERVERS.map((server, idx) => (
                  <button
                    key={server.id}
                    onClick={() => handleServerChange(idx)}
                    className={`cinema-server-pill ${
                      serverIndex === idx ? "active" : ""
                    }`}
                  >
                    {server.name}
                    {server.tag && (
                      <span className="server-tag">{server.tag}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={toggleFullScreen}
              className="cinema-fullscreen-btn"
              title="Toggle Fullscreen"
            >
              {isFullScreen ? "↙ Exit Fullscreen" : "⛶ Fullscreen"}
            </button>
          </div>

          {/* Video Player Frame */}
          <div
            ref={playerRef}
            className={`cinema-player-container ${
              isFullScreen ? "fullscreen" : ""
            }`}
          >
            {isPlayerLoading && (
              <div className="player-loading-overlay">
                <div className="netflix-spinner"></div>
                <span>Switching to {STREAMING_SERVERS[serverIndex].name}...</span>
              </div>
            )}

            {isPlaying ? (
              <iframe
                src={currentEmbedUrl}
                title={movie.title}
                className="cinema-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="origin"
              />
            ) : (
              <div className="cinema-player-placeholder" onClick={handlePlayClick}>
                <img
                  src={
                    movie.backdrop_path
                      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
                      : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  }
                  alt={movie.title}
                  className="placeholder-bg"
                />
                <div className="placeholder-overlay">
                  <div className="large-play-button">▶</div>
                  <h3>Click to Stream "{movie.title}"</h3>
                  <p>Instant HD playback • Multiple high-speed servers</p>
                </div>
              </div>
            )}
          </div>

          <div className="cinema-footer-tip">
            <p>
              💡 <strong>Streaming Tip:</strong> Video streams immediately in HD. If you experience buffering, simply click any other server above.
            </p>
          </div>
        </div>
      </div>

      {/* Netflix Top Cast Section */}
      {credits?.cast?.length > 0 && (
        <div className="netflix-content-section">
          <div className="netflix-section-container">
            <h3 className="section-heading">Top Cast</h3>
            <div className="netflix-cast-grid">
              {credits.cast.slice(0, 8).map((actor) => (
                <div key={actor.id} className="netflix-cast-card">
                  <div className="cast-photo-wrapper">
                    {actor.profile_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                        alt={actor.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="cast-photo-placeholder">
                        {actor.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="cast-actor-name">{actor.name}</span>
                  <span className="cast-character-name">{actor.character}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Netflix Movie Specs & Info */}
      <div className="netflix-content-section specs-section">
        <div className="netflix-section-container">
          <h3 className="section-heading">About {movie.title}</h3>
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Original Language:</span>
              <span className="spec-value">
                {movie.original_language?.toUpperCase() || "English"}
              </span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Release Date:</span>
              <span className="spec-value">{movie.release_date || "Unknown"}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">User Rating:</span>
              <span className="spec-value">
                ⭐ {movie.vote_average?.toFixed(1)} / 10 ({movie.vote_count} votes)
              </span>
            </div>
            {movie.production_companies?.length > 0 && (
              <div className="spec-item full-width">
                <span className="spec-label">Production:</span>
                <span className="spec-value">
                  {movie.production_companies.map((p) => p.name).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Netflix "More Like This" Recommendations */}
      {recommendations.length > 0 && (
        <div className="netflix-content-section">
          <div className="netflix-section-container">
            <h3 className="section-heading">More Like This</h3>
            <div className="movies-grid">
              {recommendations.slice(0, 10).map((rec) => (
                <MovieCard key={rec.id} movie={rec} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Official YouTube Trailer Modal */}
      {showTrailerModal && trailerKey && (
        <div
          className="netflix-modal-backdrop"
          onClick={() => setShowTrailerModal(false)}
        >
          <div
            className="netflix-trailer-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{movie.title} - Official Trailer</h3>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>
            <div className="modal-video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title={`${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetails;
