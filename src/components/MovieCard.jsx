import { memo } from "react";
import { useNavigate } from "react-router-dom";
import "../css/MovieCard.css";
import { useMovieContext } from "../contexts/MovieContext";

const MovieCard = memo(function MovieCard({ movie }) {
  const { isFavorite, addToFavorites, removeFromFavorites, getGenreNames } = useMovieContext();
  const favorite = isFavorite(movie.id);
  const navigate = useNavigate();

  const title = movie.title || movie.name;
  const date = movie.release_date || movie.first_air_date;
  const releaseYear = date?.split("-")[0];
  const mediaType = movie.media_type || (movie.name ? "tv" : "movie");
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  function onFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) removeFromFavorites(movie.id);
    else addToFavorites(movie);
  }

  function handleCardClick() {
    navigate(`/${mediaType}/${movie.id}`);
  }

  function handleQuickPlay(e) {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/${mediaType}/${movie.id}?play=true`);
  }

  return (
    <div className="movie-card-link" onClick={handleCardClick}>
      <div className="movie-card">
        <div className="movie-poster">
          <img src={posterUrl} alt={title} loading="lazy" />
          
          <div className="movie-overlay">
            <button
              className="quick-play-btn"
              onClick={handleQuickPlay}
              title="Play Now"
              aria-label={`Play ${title}`}
            >
              ▶
            </button>

            <button
              className={`favorite-btn ${favorite ? "active" : ""}`}
              onClick={onFavoriteClick}
              aria-label={
                favorite
                  ? `Remove ${title} from favorites`
                  : `Add ${title} to favorites`
              }
              title={favorite ? "Remove from My List" : "Add to My List"}
            >
              ♥
            </button>
          </div>

          {rating && (
            <div className="card-rating-badge">
              ⭐ {rating}
            </div>
          )}
        </div>

        <div className="movie-info">
          <h3 title={title}>{title}</h3>
          <div className="card-meta">
            {releaseYear && <span>{releaseYear}</span>}
            <span className="card-type-tag">{mediaType === "tv" ? "TV" : "Movie"}</span>
          </div>
          {movie.genre_ids && (
            <p className="movie-genre">{getGenreNames(movie.genre_ids)}</p>
          )}
        </div>
      </div>
    </div>
  );
});

export default MovieCard;
