// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext'; 
import { db } from '../../firebase/firebase'; 
import { useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';

const UserProfile = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUser(userDoc.data());

          const friendsQuery = query(collection(db, 'friends', currentUser.uid, 'userFriends'), where('friendId', '==', userId));
          const friendSnapshot = await getDocs(friendsQuery);
          setIsFriend(!friendSnapshot.empty);

          const requestQuery = query(collection(db, 'friendRequests'), where('from', '==', currentUser.uid), where('to', '==', userId));
          const requestSnapshot = await getDocs(requestQuery);
          setRequestSent(!requestSnapshot.empty);
        } else {
          console.log('No such user!');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [userId, currentUser]);

  const sendFriendRequest = async () => {
    if (!currentUser || !userId) return;

    try {
      await setDoc(doc(collection(db, 'friendRequests')), {
        from: currentUser.uid,
        to: userId,
        status: 'pending'
      });
      setRequestSent(true);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {user ? (
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          {!isFriend && !requestSent && (
            <button onClick={sendFriendRequest}>Send Friend Request</button>
          )}
          {isFriend && <p>Already friends</p>}
          {requestSent && !isFriend && <p>Request Sent</p>}
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default UserProfile;
