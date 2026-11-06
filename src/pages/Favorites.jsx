import { useNavigate } from "react-router-dom";
import "../css/Favorites.css";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";

function Favorites() {
  const { favorites } = useMovieContext();
  const navigate = useNavigate();

  return (
    <div className="netflix-favorites-page">
      <div className="netflix-section-container">
        <h1 className="favorites-heading">My List</h1>
        <p className="favorites-subheading">
          Titles you've saved to watch anytime.
        </p>

        {favorites && favorites.length > 0 ? (
          <div className="movies-grid">
            {favorites.map((movie) => (
              <MovieCard movie={movie} key={movie.id} />
            ))}
          </div>
        ) : (
          <div className="favorites-empty-netflix">
            <div className="empty-icon">📺</div>
            <h2>Your list is empty</h2>
            <p>
              Explore popular movies and TV series, and click "+ My List" or the heart icon to save titles here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="netflix-btn-play"
              style={{ marginTop: "1.5rem" }}
            >
              Explore Titles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
