// src/components/FriendRequests.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/authContext'; 
import { db } from '../../firebase/firebase'; 
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './FriendRequests.css';

const FriendRequests = () => {
  const { currentUser, userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);

  useEffect(() => {
    if (!userLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchUsersAndRequests = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const sentRequestsQuery = query(collection(db, 'friendRequests'), where('from', '==', currentUser.uid));
        const sentRequestsSnapshot = await getDocs(sentRequestsQuery);
        const sentRequests = sentRequestsSnapshot.docs.map(doc => doc.data().to);

        const receivedRequestsQuery = query(collection(db, 'friendRequests'), where('to', '==', currentUser.uid));
        const receivedRequestsSnapshot = await getDocs(receivedRequestsQuery);
        const receivedRequests = receivedRequestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const incomingRequestsWithUserInfo = await Promise.all(receivedRequests.map(async request => {
          const userDoc = await getDoc(doc(db, 'users', request.from));
          return { ...request, fromUser: userDoc.data() };
        }));

        const filteredUsers = allUsers.filter(user => 
          user.id !== currentUser.uid &&
          !sentRequests.includes(user.id) &&
          !receivedRequests.map(req => req.from).includes(user.id)
        );

        setUsers(filteredUsers);
        setIncomingRequests(incomingRequestsWithUserInfo);
      } catch (error) {
        console.error('Error fetching users or requests:', error);
      }
    };

    fetchUsersAndRequests();
  }, [currentUser, userLoggedIn, navigate]);

  const sendFriendRequest = async (userId) => {
    try {
      await setDoc(doc(collection(db, 'friendRequests')), {
        from: currentUser.uid,
        to: userId,
        status: 'pending'
      });
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const acceptFriendRequest = async (requestId, fromUserId) => {
    try {
      const userFriendsRef = collection(db, 'friends', currentUser.uid, 'userFriends');
      const friendDocRef = doc(userFriendsRef, fromUserId);
      const friendDoc = await getDoc(friendDocRef);

      if (!friendDoc.exists()) {
        await setDoc(friendDocRef, {
          friendId: fromUserId
        });

        const requesterFriendsRef = collection(db, 'friends', fromUserId, 'userFriends');
        await setDoc(doc(requesterFriendsRef, currentUser.uid), {
          friendId: currentUser.uid
        });
      }

      await deleteDoc(doc(db, 'friendRequests', requestId));

      
      setIncomingRequests(incomingRequests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, 'friendRequests', requestId));

      setIncomingRequests(incomingRequests.filter(request => request.id !== requestId));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  if (!userLoggedIn) {
    return <p>Loading...</p>;
  }

  return (
    <div className="friend-requests">
      <h2>Send Friend Requests</h2>
      {users.length > 0 ? (
        users.map(user => (
          <div key={user.id} className="user-card">
            <p>{user.name} ({user.email})</p>
            <button className="send-request-button" onClick={() => sendFriendRequest(user.id)}>Send Friend Request</button>
          </div>
        ))
      ) : (
        <p>No users available to send friend requests.</p>
      )}

      <h2>Incoming Friend Requests</h2>
      {incomingRequests.length > 0 ? (
        incomingRequests.map(request => (
          <div key={request.id} className="request-card">
            <p>{request.fromUser.email}</p>
            <button className="accept-button" onClick={() => acceptFriendRequest(request.id, request.from)}>Accept</button>
            <button className="reject-button" onClick={() => rejectFriendRequest(request.id)}>Reject</button>
          </div>
        ))
      ) : (
        <p>No incoming friend requests.</p>
      )}
    </div>
  );
};

export default FriendRequests;
