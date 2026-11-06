import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMovieDetails, getTVDetails } from "../services/api";
import { STREAMING_SERVERS } from "../services/streaming";
import "../css/MovieDetails.css";

function WatchMovie() {
  const { id, mediaType, season, episode } = useParams();
  const navigate = useNavigate();

  // Determine if TV based on route params or URL
  const isTv = mediaType === "tv" || window.location.pathname.includes("/tv/");
  const currentSeason = season ? Number(season) : 1;
  const currentEpisode = episode ? Number(episode) : 1;

  const [media, setMedia] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [serverIndex, setServerIndex] = useState(0);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    const fetchMediaData = async () => {
      setLoading(true);
      try {
        const data = isTv ? await getTVDetails(id) : await getMovieDetails(id);
        setMedia(data);
      } catch (err) {
        console.error(`Error fetching ${isTv ? "TV" : "Movie"} data:`, err);
        setError("Failed to load information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMediaData();
    window.scrollTo(0, 0);
  }, [id, isTv]);

  const handleServerChange = (index) => {
    setIsPlayerLoading(true);
    setServerIndex(index);
    setTimeout(() => setIsPlayerLoading(false), 500);
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
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  if (loading) {
    return (
      <div className="netflix-loading">
        <div className="netflix-spinner"></div>
        <span>Loading Player...</span>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="netflix-error-view">
        <h2>{error || "Media not found"}</h2>
        <button onClick={() => navigate("/")} className="netflix-btn-secondary">
          Return to Home
        </button>
      </div>
    );
  }

  const title = media.title || media.name;
  const currentEmbedUrl = STREAMING_SERVERS[serverIndex].getUrl(
    isTv,
    id,
    currentSeason,
    currentEpisode
  );

  return (
    <div className="netflix-movie-page" style={{ paddingTop: "2rem" }}>
      <div className="netflix-section-container">
        {/* Navigation Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <Link
            to={`/${isTv ? "tv" : "movie"}/${id}`}
            className="netflix-back-nav"
            style={{ position: "static" }}
          >
            ← Back to {title} Overview
          </Link>

          <span style={{ color: "#aaa", fontSize: "0.95rem" }}>
            {isTv
              ? `Season ${currentSeason} • Episode ${currentEpisode}`
              : "Feature Film"}
          </span>
        </div>

        {/* Cinema Section */}
        <div className="netflix-cinema-section" style={{ padding: 0, border: "none" }}>
          <div className="cinema-header">
            <div className="cinema-title-area">
              <span className="live-indicator"></span>
              <h2>
                Now Playing: {title}{" "}
                {isTv && `(S${currentSeason}:E${currentEpisode})`}
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
                <span>
                  Switching to {STREAMING_SERVERS[serverIndex].name}...
                </span>
              </div>
            )}

            <iframe
              src={currentEmbedUrl}
              title={title}
              className="cinema-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="origin"
            />
          </div>

          <div className="cinema-footer-tip">
            <p>
              💡 <strong>Streaming Tip:</strong> Video streams immediately in HD.
              If you experience buffering, simply click any other server above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WatchMovie;
