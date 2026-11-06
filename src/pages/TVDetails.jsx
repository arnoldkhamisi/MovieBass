import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  getTVDetails,
  getTVSeasonDetails,
  getTVCredits,
  getTVVideos,
  getTVRecommendations,
} from "../services/api";
import { STREAMING_SERVERS } from "../services/streaming";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import "../css/MovieDetails.css";

function TVDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoPlay = searchParams.get("play") === "true";

  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const favorite = isFavorite(Number(id));

  const [tvShow, setTvShow] = useState(null);
  const [credits, setCredits] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Season & Episode state
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [loadingSeason, setLoadingSeason] = useState(false);

  // Player state
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [serverIndex, setServerIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);

  const playerRef = useRef(null);
  const cinemaSectionRef = useRef(null);

  useEffect(() => {
    const fetchTVData = async () => {
      setLoading(true);
      setError(null);
      setIsPlaying(autoPlay);
      setServerIndex(0);

      try {
        const [details, castData, videos, recs] = await Promise.all([
          getTVDetails(id),
          getTVCredits(id).catch(() => ({ cast: [] })),
          getTVVideos(id).catch(() => []),
          getTVRecommendations(id).catch(() => []),
        ]);

        setTvShow(details);
        setCredits(castData);
        setRecommendations(recs);

        if (details.seasons && details.seasons.length > 0) {
          const firstSeason =
            details.seasons.find((s) => s.season_number > 0) || details.seasons[0];
          setSelectedSeason(firstSeason.season_number);
          setSelectedEpisode(1);
        }

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
        console.error("Failed to load TV details:", err);
        setError("Failed to load TV details. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchTVData();
    window.scrollTo(0, 0);
  }, [id, autoPlay]);

  useEffect(() => {
    const fetchSeason = async () => {
      if (!id || selectedSeason === null) return;
      setLoadingSeason(true);
      try {
        const data = await getTVSeasonDetails(id, selectedSeason);
        setSeasonData(data);
      } catch (err) {
        console.error("Failed to load season data", err);
      } finally {
        setLoadingSeason(false);
      }
    };
    fetchSeason();
  }, [id, selectedSeason]);

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

  const handleEpisodeSelect = (epNumber) => {
    setSelectedEpisode(epNumber);
    setIsPlaying(true);
    setIsPlayerLoading(true);
    setTimeout(() => setIsPlayerLoading(false), 500);
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
    if (!tvShow) return;
    if (favorite) {
      removeFromFavorites(tvShow.id);
    } else {
      addToFavorites({ ...tvShow, media_type: "tv" });
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
        <span>Loading TV Series...</span>
      </div>
    );
  }

  if (error || !tvShow) {
    return (
      <div className="netflix-error-view">
        <h2>{error || "TV Series not found"}</h2>
        <button onClick={() => navigate("/")} className="netflix-btn-secondary">
          Return to Home
        </button>
      </div>
    );
  }

  const releaseYear = tvShow.first_air_date?.split("-")[0] || "N/A";
  const matchScore = tvShow.vote_average
    ? Math.min(99, Math.round(tvShow.vote_average * 10))
    : 95;
  const currentEmbedUrl = STREAMING_SERVERS[serverIndex].getUrl(
    true,
    tvShow.id,
    selectedSeason,
    selectedEpisode
  );

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
              tvShow.backdrop_path
                ? `https://image.tmdb.org/t/p/original${tvShow.backdrop_path}`
                : `https://image.tmdb.org/t/p/original${tvShow.poster_path}`
            })
          `,
        }}
      >
        <button onClick={() => navigate(-1)} className="netflix-back-nav">
          ← Back
        </button>

        <div className="netflix-hero-content">
          <div className="netflix-type-badge">
            <span className="netflix-n-badge">N</span> SERIES
          </div>

          <h1 className="netflix-title">{tvShow.name}</h1>

          {tvShow.tagline && (
            <p className="netflix-tagline">"{tvShow.tagline}"</p>
          )}

          {/* Metadata badges row */}
          <div className="netflix-meta-row">
            <span className="netflix-match">{matchScore}% Match</span>
            <span className="netflix-year">{releaseYear}</span>
            <span className="netflix-maturity-badge">TV-MA</span>
            <span className="netflix-runtime">
              {tvShow.number_of_seasons} Season{tvShow.number_of_seasons !== 1 ? "s" : ""}
            </span>
            <span className="netflix-quality-badge">Ultra HD 4K</span>
            <span className="netflix-quality-badge">5.1 Audio</span>
          </div>

          {/* Plot Overview */}
          <p className="netflix-overview">{tvShow.overview}</p>

          {/* Genres row */}
          {tvShow.genres?.length > 0 && (
            <div className="netflix-genres">
              <span className="netflix-genres-label">Genres:</span>
              {tvShow.genres.map((g) => (
                <span key={g.id} className="netflix-genre-pill">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="netflix-actions-row">
            <button onClick={handlePlayClick} className="netflix-btn-play">
              <span className="play-icon">▶</span> Play S{selectedSeason}:E{selectedEpisode}
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
              <h2>
                Now Playing: {tvShow.name} (S{selectedSeason}:E{selectedEpisode})
              </h2>
            </div>

            {/* Server Switcher */}
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
                <span>Loading Season {selectedSeason} Episode {selectedEpisode}...</span>
              </div>
            )}

            {isPlaying ? (
              <iframe
                src={currentEmbedUrl}
                title={`${tvShow.name} S${selectedSeason} E${selectedEpisode}`}
                className="cinema-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="origin"
              />
            ) : (
              <div className="cinema-player-placeholder" onClick={handlePlayClick}>
                <img
                  src={
                    tvShow.backdrop_path
                      ? `https://image.tmdb.org/t/p/w1280${tvShow.backdrop_path}`
                      : `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
                  }
                  alt={tvShow.name}
                  className="placeholder-bg"
                />
                <div className="placeholder-overlay">
                  <div className="large-play-button">▶</div>
                  <h3>Stream Season {selectedSeason} Episode {selectedEpisode}</h3>
                  <p>Instant HD playback • Multiple high-speed servers</p>
                </div>
              </div>
            )}
          </div>

          <div className="cinema-footer-tip">
            <p>
              💡 <strong>Streaming Tip:</strong> Episodes stream in HD. Select any episode below to switch episodes instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Netflix Episodes Picker Section */}
      <div className="netflix-content-section episodes-section">
        <div className="netflix-section-container">
          <div className="episodes-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 className="section-heading" style={{ margin: 0 }}>Episodes</h3>

            {tvShow.seasons?.length > 1 && (
              <div className="season-select-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label htmlFor="season-picker" style={{ color: '#aaa', fontWeight: '600', fontSize: '0.95rem' }}>Season:</label>
                <select
                  id="season-picker"
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(Number(e.target.value));
                    setSelectedEpisode(1);
                  }}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: '#222222',
                    color: '#ffffff',
                    border: '1px solid #444444',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {tvShow.seasons
                    ?.filter((s) => s.season_number > 0)
                    .map((s) => (
                      <option key={s.id} value={s.season_number}>
                        {s.name} ({s.episode_count} Episodes)
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {loadingSeason ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
              Loading episodes...
            </div>
          ) : (
            <div
              className="netflix-episodes-list"
              style={{
                display: 'grid',
                gap: '1rem',
              }}
            >
              {seasonData?.episodes?.map((ep) => {
                const isCurrentEp = selectedEpisode === ep.episode_number;
                return (
                  <div
                    key={ep.id}
                    onClick={() => handleEpisodeSelect(ep.episode_number)}
                    className={`episode-row-card ${isCurrentEp ? 'is-active-ep' : ''}`}
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      background: isCurrentEp ? 'rgba(255, 107, 0, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                      border: isCurrentEp ? '1px solid #ff6b00' : '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      className="ep-thumbnail-box"
                      style={{
                        position: 'relative',
                        width: '160px',
                        height: '90px',
                        flexShrink: 0,
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: '#111',
                      }}
                    >
                      <img
                        src={
                          ep.still_path
                            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                            : `https://image.tmdb.org/t/p/w300${tvShow.backdrop_path}`
                        }
                        alt={ep.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          color: '#fff',
                        }}
                      >
                        ▶
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: isCurrentEp ? '#ff6b00' : '#ffffff' }}>
                          {ep.episode_number}. {ep.name}
                        </h4>
                        {ep.runtime && (
                          <span style={{ fontSize: '0.85rem', color: '#999999' }}>
                            {ep.runtime}m
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#bbbbbb', lineHeight: '1.4' }}>
                        {ep.overview || "No episode overview available."}
                      </p>
                    </div>

                    {isCurrentEp && (
                      <span
                        style={{
                          background: '#ff6b00',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(255, 107, 0, 0.4)',
                        }}
                      >
                        Playing
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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

      {/* Netflix "More Like This" Recommendations */}
      {recommendations.length > 0 && (
        <div className="netflix-content-section">
          <div className="netflix-section-container">
            <h3 className="section-heading">More Like This</h3>
            <div className="movies-grid">
              {recommendations.slice(0, 10).map((rec) => (
                <MovieCard key={rec.id} movie={{ ...rec, media_type: "tv" }} />
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
              <h3>{tvShow.name} - Official Trailer</h3>
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
                title={`${tvShow.name} Trailer`}
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

export default TVDetails;
