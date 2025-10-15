import { useEffect, useState } from "react";
import { useDebounce } from 'react-use'
import Search from "./components/Search";
import Component from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { updateSearchCount, getTrendingMovies } from "./appwrite";

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  // HOOKS
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingError, setTrendingError] = useState(null)
  // HOOKS

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])
  // Debounces the search term to prevent to many API requests
  // by waiting for user to stop typing for 500ms.

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage(null);

    try {

      const endPoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endPoint, API_OPTIONS); // fetch built in func in JS to make https requests.
      // removing the await will result in returning a promise object without the real response

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)

      } else {
        const data = await response.json();

        const results = Array.isArray(data.results) ? data.results : [];

        setMovieList(results);

        if (query && results.length > 0) {
          await updateSearchCount(query, results[0]);
        }
      }

    } catch (error) {

      console.log(`Error fetching movies: ${error}`);
      setErrorMessage(`Error fetching movies, please try again later.`);

    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(Array.isArray(movies) ? movies : [])
      setTrendingError(null)
    } catch (error) {
      setTrendingError(error instanceof Error ? error.message : 'Failed to load trending movies')
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm])

  useEffect(() => {
    loadTrendingMovies();
  }, [])

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="/hero-img.png" alt="hero bg" />
          <h1>Find the <span className="text-gradient">Movies</span> you like without the hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingError ? (<p className="text-red-500">{trendingError}</p>) : trendingMovies.map((movie, index) => (<li key={movie.$id}
              >
                <p>{index + 1}</p>
                <img src={movie.poster_url} alt={movie.title} />
              </li>))}
            </ul>
          </section>
        )}

        <div className="all-movies">
          <h2>all Movies</h2>

          {isLoading ? (
            <Component /> /*Our Spinner*/
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) =>
                (<MovieCard key={movie.id} movie={movie} />))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}

export default App;