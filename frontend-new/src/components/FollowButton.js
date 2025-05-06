import React, { useState, useEffect } from 'react';
import { followUser, unfollowUser, getFollowing } from '../services/api';
import Swal from 'sweetalert2';
import './FollowButton.css';

const FollowButton = ({ currentUserId, targetUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const following = await getFollowing(currentUserId);
        const isAlreadyFollowing = following.some(user => user.id === targetUserId);
        setIsFollowing(isAlreadyFollowing);
      } catch (error) {
        console.error('Error checking following status:', error);
      }
    };
    if (currentUserId && targetUserId) {
      checkFollowingStatus();
    }
  }, [currentUserId, targetUserId]);

  const handleFollow = async () => {
    try {
      await followUser(currentUserId, targetUserId);
      setIsFollowing(true);
      Swal.fire('Success', 'You are now following this user!', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to follow user.', 'error');
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUser(currentUserId, targetUserId);
      setIsFollowing(false);
      Swal.fire('Success', 'You have unfollowed this user.', 'success');
    } catch (error) {
      Swal.fire('Error', 'Failed to unfollow user.', 'error');
    }
  };

  return (
    <button
      className={`follow-btn ${isFollowing ? 'unfollow' : 'follow'}`}
      onClick={isFollowing ? handleUnfollow : handleFollow}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;