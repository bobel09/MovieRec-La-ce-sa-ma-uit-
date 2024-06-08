// src/components/FriendsList.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext'; 
import { db } from '../../firebase/firebase'; 
import { collection, query, getDocs, doc, getDoc, addDoc, where } from 'firebase/firestore';
import './FriendList.css';

const FriendsList = () => {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [movieId, setMovieId] = useState('');
  const [userEmails, setUserEmails] = useState({});

  const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkM2E0MWE1YmVkNmJlNzYzN2FkN2NiZWQzNGViNTgxNyIsInN1YiI6IjY2NjQwMDcwOGIxZGE2ODY0ZDgyNTNmOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ikqZu7joUnUtcKameC0mltDZje4J22ZF0h09WO-dZ7o';

  useEffect(() => {
    const fetchFriends = async () => {
      const friendsQuery = query(collection(db, 'friends', currentUser.uid, 'userFriends'));
      const friendsSnapshot = await getDocs(friendsQuery);
      const friendIds = friendsSnapshot.docs.map(doc => doc.data().friendId);

      const friendsData = [];
      for (let friendId of friendIds) {
        const friendDoc = await getDoc(doc(db, 'users', friendId));
        friendsData.push({ id: friendDoc.id, ...friendDoc.data() });
      }
      setFriends(friendsData);
    };

    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const emails = {};
      usersSnapshot.forEach(doc => {
        emails[doc.id] = doc.data().email;
      });
      setUserEmails(emails);
    };

    const fetchRecommendations = async () => {
      const recommendationsQuery = query(collection(db, 'recommendations'), where('to', '==', currentUser.uid));
      const recommendationsSnapshot = await getDocs(recommendationsQuery);
      const recommendationsData = await Promise.all(recommendationsSnapshot.docs.map(async doc => {
        const data = doc.data();
        try {
          const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${data.movieId}?language=en-US`, {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${API_KEY}`
            }
          });
          if (!movieResponse.ok) {
            throw new Error(`HTTP error! status: ${movieResponse.status}`);
          }
          const movie = await movieResponse.json();
          return { ...data, movie };
        } catch (error) {
          console.error(`Error fetching movie data for movie ID ${data.movieId}:`, error);
          return null;
        }
      }));
      setRecommendations(recommendationsData.filter(recommendation => recommendation !== null));
    };

    fetchFriends();
    fetchUsers();
    fetchRecommendations();
  }, [currentUser.uid]);

  const handleRecommendClick = (friend) => {
    setSelectedFriend(friend);
    setShowModal(true);
  };

  const handleRecommendSubmit = async () => {
    if (!movieId) return;

    try {
      await addDoc(collection(db, 'recommendations'), {
        from: currentUser.uid,
        to: selectedFriend.id,
        movieId: movieId,
        timestamp: new Date()
      });
      setShowModal(false);
      setMovieId('');
      setSelectedFriend(null);
    } catch (error) {
      console.error('Error sending recommendation:', error);
    }
  };

  return (
    <div className="friends-list">
      <h2>Friends</h2>
      {friends.length > 0 ? (
        friends.map(friend => (
          <div key={friend.id} className="friend-card">
            <p><strong>{friend.name}</strong> ({friend.email})</p>
            <button className="recommend-button" onClick={() => handleRecommendClick(friend)}>Recommend a Movie</button>
          </div>
        ))
      ) : (
        <p>No friends</p>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h2>Recommendations</h2>
          {recommendations.map((recommendation, index) => (
            <div key={index} className="recommendation-card">
              <p><strong>{recommendation.movie.title}</strong></p>
              <img src={`https://image.tmdb.org/t/p/w500${recommendation.movie.poster_path}`} alt={recommendation.movie.title} />
              <p><strong>Recommended by:</strong> {userEmails[recommendation.from]}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Recommend a Movie to {selectedFriend.name}</h2>
            <input
              type="text"
              value={movieId}
              onChange={(e) => setMovieId(e.target.value)}
              placeholder="Enter Movie ID"
            />
            <button onClick={handleRecommendSubmit} className="submit-button">Send Recommendation</button>
            <button onClick={() => setShowModal(false)} className="cancel-button">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
