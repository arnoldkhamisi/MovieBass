import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getMovieVideos, getMovieDetails } from "../services/api";
import "../css/MovieDetails.css";

function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [videos, details] = await Promise.all([
          getMovieVideos(id).catch(() => []),
          getMovieDetails(id).catch(() => null),
        ]);

        setMovie(details);
        const trailer =
          videos.find(
            (v) =>
              v.site === "YouTube" &&
              (v.type === "Trailer" || v.type === "Teaser")
          ) || videos.find((v) => v.site === "YouTube");

        setVideo(trailer || videos[0]);
      } catch {
        setError("Failed to load trailer...");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="netflix-loading">
        <div className="netflix-spinner"></div>
        <span>Loading Trailer...</span>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="netflix-error-view">
        <h2>{error || "No trailer found for this movie."}</h2>
        <button onClick={() => navigate(`/movie/${id}`)} className="netflix-btn-secondary">
          Return to Movie Details
        </button>
      </div>
    );
  }

  return (
    <div className="netflix-movie-page" style={{ paddingTop: "2rem" }}>
      <div className="netflix-section-container">
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
          <Link to={`/movie/${id}`} className="netflix-back-nav" style={{ position: "static" }}>
            ← Back to {movie?.title || "Movie"}
          </Link>

          <Link
            to={`/movie/${id}?play=true`}
            className="netflix-btn-play"
            style={{ fontSize: "0.95rem", padding: "0.5rem 1.25rem" }}
          >
            ▶ Play Full Movie
          </Link>
        </div>

        <div className="cinema-header">
          <div className="cinema-title-area">
            <h2>{movie?.title ? `${movie.title} - Official Trailer` : "Official Trailer"}</h2>
          </div>
        </div>

        <div className="cinema-player-container">
          <iframe
            src={`https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0`}
            title={movie?.title || "Trailer"}
            className="cinema-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

export default WatchPage;
