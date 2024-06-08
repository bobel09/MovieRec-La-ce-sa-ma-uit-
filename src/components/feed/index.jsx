// src/components/FeedPage.js

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase'; 
import { collection, getDocs, updateDoc, doc, arrayUnion, arrayRemove, addDoc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../contexts/authContext'; 
import './FeedPage.css'; 

const FeedPage = () => {
    const { currentUser } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [newComment, setNewComment] = useState({});
    const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkM2E0MWE1YmVkNmJlNzYzN2FkN2NiZWQzNGViNTgxNyIsInN1YiI6IjY2NjQwMDcwOGIxZGE2ODY0ZDgyNTNmOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ikqZu7joUnUtcKameC0mltDZje4J22ZF0h09WO-dZ7o';

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'reviews'));
                const reviewsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Fetch movie details for each review
                const detailedReviews = await Promise.all(reviewsList.map(async review => {
                    const options = {
                        method: 'GET',
                        headers: {
                            accept: 'application/json',
                            Authorization: `Bearer ${API_KEY}`
                        }
                    };
                    const response = await fetch(`https://api.themoviedb.org/3/movie/${review.movieId}?language=en-US`, options);
                    const movieData = await response.json();
                    
                    // Fetch comments for each review
                    const commentsSnapshot = await getDocs(query(collection(db, 'reviews', review.id, 'comments'), orderBy('timestamp', 'asc')));
                    const comments = commentsSnapshot.docs.map(doc => doc.data());

                    return {
                        ...review,
                        movie: movieData,
                        comments: comments
                    };
                }));

                setReviews(detailedReviews);
            } catch (error) {
                console.error('Error fetching reviews: ', error);
            }
        };

        fetchReviews();
    }, []);

    const handleLike = async (reviewId) => {
        if (!currentUser) return;

        const reviewRef = doc(db, 'reviews', reviewId);

        // Check if the current user has already liked the review
        const review = reviews.find(r => r.id === reviewId);
        const isLiked = review.likes && review.likes.includes(currentUser.uid);

        try {
            if (isLiked) {
                // Unlike the review
                await updateDoc(reviewRef, {
                    likes: arrayRemove(currentUser.uid)
                });
            } else {
                // Like the review
                await updateDoc(reviewRef, {
                    likes: arrayUnion(currentUser.uid)
                });
            }

            // Update local state
            setReviews(reviews.map(r =>
                r.id === reviewId
                    ? { ...r, likes: isLiked ? r.likes.filter(uid => uid !== currentUser.uid) : [...(r.likes || []), currentUser.uid] }
                    : r
            ));
        } catch (error) {
            console.error('Error updating likes: ', error);
        }
    };

    const handleCommentChange = (reviewId, value) => {
        setNewComment({
            ...newComment,
            [reviewId]: value
        });
    };

    const handleCommentSubmit = async (reviewId) => {
        if (!currentUser || !newComment[reviewId]) return;

        const comment = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            text: newComment[reviewId],
            timestamp: new Date()
        };

        try {
            await addDoc(collection(db, 'reviews', reviewId, 'comments'), comment);

            // Update local state
            setReviews(reviews.map(r =>
                r.id === reviewId
                    ? { ...r, comments: [...r.comments, comment] }
                    : r
            ));
            setNewComment({
                ...newComment,
                [reviewId]: ''
            });
        } catch (error) {
            console.error('Error adding comment: ', error);
        }
    };

    return (
        <div className="feed-page">
            <h1>Review Feed</h1>
            <div className="reviews-list">
                {reviews.map(review => (
                    <div key={review.id} className="review-card">
                        {review.movie && (
                            <>
                                <h2>{review.movie.title}</h2>
                                <img src={`https://image.tmdb.org/t/p/w500${review.movie.poster_path}`} alt={review.movie.title} />
                                <p><strong>Reviewed by:</strong> {review.userEmail}</p>
                                <p>{review.review}</p>
                                <small>{new Date(review.timestamp.seconds * 1000).toLocaleDateString()}</small>
                                <div className="likes-section">
                                    <button onClick={() => handleLike(review.id)}>
                                        {review.likes && review.likes.includes(currentUser.uid) ? 'Unlike' : 'Like'}
                                    </button>
                                    <span>{review.likes ? review.likes.length : 0} likes</span>
                                </div>
                                <div className="comments-section">
                                    <h3>Comments</h3>
                                    {review.comments.map((comment, index) => (
                                        <div key={index} className="comment">
                                            <p><strong>{comment.userEmail}:</strong> {comment.text}</p>
                                            <small>{new Date(comment.timestamp.seconds * 1000).toLocaleDateString()}</small>
                                        </div>
                                    ))}
                                    <textarea
                                        value={newComment[review.id] || ''}
                                        onChange={(e) => handleCommentChange(review.id, e.target.value)}
                                        placeholder="Write a comment..."
                                    ></textarea>
                                    <button onClick={() => handleCommentSubmit(review.id)}>Submit</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeedPage;
