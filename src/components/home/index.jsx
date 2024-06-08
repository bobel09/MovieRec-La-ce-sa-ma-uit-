import React, { useState, useEffect } from 'react';
import './MovieCard.css';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkM2E0MWE1YmVkNmJlNzYzN2FkN2NiZWQzNGViNTgxNyIsInN1YiI6IjY2NjQwMDcwOGIxZGE2ODY0ZDgyNTNmOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ikqZu7joUnUtcKameC0mltDZje4J22ZF0h09WO-dZ7o';

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchMovies = async () => {
            try {
                const options = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkM2E0MWE1YmVkNmJlNzYzN2FkN2NiZWQzNGViNTgxNyIsInN1YiI6IjY2NjQwMDcwOGIxZGE2ODY0ZDgyNTNmOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ikqZu7joUnUtcKameC0mltDZje4J22ZF0h09WO-dZ7o'
                    }
                };
                const response = await fetch('https://api.themoviedb.org/3/trending/movie/day?language=en-US', options);
                const data = await response.json();
                setMovies(data.results || []); 
            } catch (error) {
                console.error(error);
                setMovies([]);
            }
        };

        fetchMovies();
    }, [currentUser, navigate]);

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            console.log('User signed out');
            navigate('/login');
        }).catch((error) => {
            console.error('Error signing out: ', error);
        });
    };

    const handleReviewRedirect = (movieId) => {
        navigate(`/review/${movieId}`);
    };

    const handleAboutRedirect = (movieId) => {
        navigate(`/about/${movieId}`);
    };

    const handleSearch = async () => {
        if (!searchTerm) return;

        try {
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkM2E0MWE1YmVkNmJlNzYzN2FkN2NiZWQzNGViNTgxNyIsInN1YiI6IjY2NjQwMDcwOGIxZGE2ODY0ZDgyNTNmOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ikqZu7joUnUtcKameC0mltDZje4J22ZF0h09WO-dZ7o'
                }
            };
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${searchTerm}&include_adult=false&language=en-US&page=1`, options);
            const data = await response.json();
            setMovies(data.results || []);
        } catch (error) {
            console.error(error);
            setMovies([]);
        }
    };

    return (
        <div>
            {}
            <nav className="navbar">
                <div className="navbar-container">
                    <span className="navbar-brand">{currentUser ? `Welcome, ${currentUser.email}` : 'Welcome'}</span>
                    <div className="navbar-links">
                        <a className="nav-link" href="/feed">Feed</a>
                        <a className="nav-link" href="/friends">Friends</a>
                        <a className="nav-link" href="/friend-requests">Friend Requests</a>
                        <a className="nav-link" href="/Groups">Groups</a>
                        {currentUser && <button className="nav-link sign-out-button" onClick={handleSignOut}>Sign Out</button>}
                    </div>
                </div>
            </nav>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search for a movie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            <div className="container">
                <h1>Trending Movies</h1>
                <div className="movies-grid">
                    {movies.length > 0 ? (
                        movies.map(movie => (
                            <div key={movie.id} className="movie-card">
                                <div className="card">
                                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="card-img-top" />
                                    <div className="card-body">
                                        <h5 className="card-title">{movie.title}</h5>
                                        <p className="card-text">Vote Average: {movie.vote_average}</p>
                                    </div>
                                    <div className="card-hover">
                                        <p>{movie.overview}</p>
                                        <p><strong>Release Date:</strong> {movie.release_date}</p>
                                        <button className="about-button" onClick={() => handleAboutRedirect(movie.id)}>About the Film</button>
                                        <button className="review-button" onClick={() => handleReviewRedirect(movie.id)}>Leave a Review</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No movies found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
