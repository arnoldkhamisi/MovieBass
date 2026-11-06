import { Suspense, lazy } from "react";
import "./css/App.css";
import { Routes, Route } from "react-router-dom";
import { MovieProvider } from "./contexts/MovieContext";
import NavBar from "./components/NavBar";

const Favorites = lazy(() => import("./pages/Favorites"));
const Home = lazy(() => import("./pages/Home"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const TVDetails = lazy(() => import("./pages/TVDetails"));
const WatchPage = lazy(() => import("./pages/WatchPage"));
const WatchMovie = lazy(() => import("./pages/WatchMovie"));

function App() {
  return (
    <MovieProvider>
      <NavBar />
      <main className="main-content">
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<TVDetails />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            {/* Unified Watch routing to the WatchMovie component */}
            <Route path="/watch-media/:mediaType/:id" element={<WatchMovie />} />
            <Route path="/watch-media/tv/:id/:season/:episode" element={<WatchMovie />} />
            {/* Legacy route */}
            <Route path="/watch-movie/:id" element={<WatchMovie />} />
            <Route path="/watch-movie/tv/:id/:season/:episode" element={<WatchMovie />} />
            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
    </MovieProvider>
  );
}

export default App;
