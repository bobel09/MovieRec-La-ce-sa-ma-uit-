import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/authContext';
import './ReviewPage.css'; 
import { useNavigate } from 'react-router-dom';
const ReviewPage = () => {
    const { movieId } = useParams();
    const { currentUser } = useAuth();
    const [movie, setMovie] = useState(null);
    const [reviewText, setReviewText] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const options = {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkM2E0MWE1YmVkNmJlNzYzN2FkN2NiZWQzNGViNTgxNyIsInN1YiI6IjY2NjQwMDcwOGIxZGE2ODY0ZDgyNTNmOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ikqZu7joUnUtcKameC0mltDZje4J22ZF0h09WO-dZ7o'
                    }
                };
                const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, options);
                const data = await response.json();
                setMovie(data);
            } catch (error) {
                console.error('Error fetching movie details:', error);
            }
        };

        fetchMovieDetails();
    }, [movieId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            console.error('User not authenticated');
            return;
        }

        try {
            await addDoc(collection(db, 'reviews'), {
                movieId: movieId,
                review: reviewText,
                userEmail: currentUser.email,
                timestamp: new Date()
            });
            console.log('Review submitted');
            setReviewText('');
            navigate('/home')
        } catch (error) {
            console.error('Error submitting review: ', error);
        }
    };

    return (
        <div className="review-page">
            {movie ? (
                <>
                    <h1>Leave a Review for {movie.title}</h1>
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                    <form onSubmit={handleSubmit} className="review-form">
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Write your review here"
                            required
                        ></textarea>
                        <button type="submit">Submit Review</button>
                    </form>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default ReviewPage;
