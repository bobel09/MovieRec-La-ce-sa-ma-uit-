// src/components/About.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './About.css';

const About = () => {
    const { movieId } = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkM2E0MWE1YmVkNmJlNzYzN2FkN2NiZWQzNGViNTgxNyIsInN1YiI6IjY2NjQwMDcwOGIxZGE2ODY0ZDgyNTNmOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ikqZu7joUnUtcKameC0mltDZje4J22ZF0h09WO-dZ7o'
                }
            };

            try {
                const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, options);
                const data = await response.json();
                setMovie(data);
            } catch (error) {
                console.error('Error fetching movie details: ', error);
            }
        };

        fetchMovieDetails();
    }, [movieId]);

    if (!movie) {
        return <div>Loading...</div>;
    }

    return (
        <div className="about-page">
            <h1>{movie.title}</h1>
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
            <p>{movie.overview}</p>
            <p><strong>Genres:</strong> {movie.genres.map(genre => genre.name).join(', ')}</p>
            <p><strong>Release Date:</strong> {movie.release_date}</p>
            <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
            <p><strong>Average Vote:</strong> {movie.vote_average}</p>
            <p><strong>Vote Count:</strong> {movie.vote_count}</p>
            <p><strong>Production Companies:</strong> {movie.production_companies.map(company => company.name).join(', ')}</p>
        </div>
    );
};

export default About;
