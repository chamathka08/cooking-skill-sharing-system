import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getUser, updateUser, deleteUser, getFollowers, getFollowing, getPostsByUserId, getLikesByPostId, getCommentsByPostId } from '../services/api';
import FollowButton from './FollowButton';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const currentUserId = localStorage.getItem('userId');
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    bio: '', 
    profilePicture: ''
  });
  const [preview, setPreview] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postInteractions, setPostInteractions] = useState({}); // Store likes and comments with usernames
  const isOwnProfile = !userId || userId === currentUserId;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const targetId = userId || currentUserId;
        if (!targetId) throw new Error('No user ID');
        const userData = await getUser(targetId);
        setUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email,
          password: '',
          bio: userData.bio || '',
          profilePicture: userData.profilePicture || '',
        });
        setPreview(userData.profilePicture || null);
        setFollowers(await getFollowers(targetId));
        setFollowing(await getFollowing(targetId));
        const userPosts = await getPostsByUserId(targetId);
        setPosts(userPosts);

        // Fetch likes and comments with usernames for each post
        const interactions = {};
        for (const post of userPosts) {
          const likes = await getLikesByPostId(post.id); // Assuming { id, username, postId }
          const comments = await getCommentsByPostId(post.id); // Assuming { id, username, comment }
          interactions[post.id] = {
            likes: likes.map(like => like.username),
            comments: comments
          };
        }
        setPostInteractions(interactions);
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Fetch Failed', text: 'User not found or please log in.' });
        navigate('/login');
      }
    };
    fetchUserData();
  }, [navigate, userId, currentUserId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Please upload an image under 1MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage = reader.result;
        setFormData({ ...formData, profilePicture: newImage });
        setPreview(newImage);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    try {
      const updatedUser = await updateUser(user.id, formData);
      setUser({
        ...updatedUser,
        profilePicture: updatedUser.profilePicture || formData.profilePicture
      });
      setIsEditing(false);
      setFormData({
        username: updatedUser.username,
        email: updatedUser.email,
        password: '',
        bio: updatedUser.bio || '',
        profilePicture: updatedUser.profilePicture || formData.profilePicture
      });
      setPreview(updatedUser.profilePicture || formData.profilePicture);
      Swal.fire({ icon: 'success', title: 'Updated!', text: 'Profile updated.', timer: 1500 });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: 'Something went wrong.' });
      console.error('Update error:', error);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'This will delete your profile!',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    });
    if (result.isConfirmed) {
      try {
        await deleteUser(user.id);
        localStorage.removeItem('userId');
        Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Profile deleted.', timer: 1500 });
        navigate('/');
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Delete Failed', text: 'Something went wrong.' });
      }
    }
  };

  const handleHome = () => navigate('/home');
  const handleCreateWorkPlan = () => navigate('/workplan/create');
  const handleViewWorkPlanList = () => navigate('/workplan/list');
  const handleAddPost = () => navigate('/post/create');
  const handleViewPosts = () => navigate('/post/list');

  // Handle navigation to user profile
  const handleUserProfile = (targetUserId) => {
    navigate(`/profile/${targetUserId}`);
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="Profile" className="profile-image" />
          ) : (
            <span>{user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="profile-info">
          <div className="profile-top-row">
            <h2>{user.username}</h2>
            {isOwnProfile ? (
              <button className="profile-btn edit" onClick={handleUpdate}>
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
            ) : (
              <FollowButton currentUserId={currentUserId} targetUserId={user.id} />
            )}
          </div>
          <div className="profile-stats">
            <div className="stat">
              <span>{posts.length}</span> Posts
            </div>
            <div className="stat">
              <span>{followers.length}</span> Followers
            </div>
            <div className="stat">
              <span>{following.length}</span> Following
            </div>
          </div>
          {isOwnProfile && isEditing ? (
            <div className="profile-edit-form">
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="profile-input"
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="profile-input"
              />
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="New Password (optional)"
                className="profile-input"
              />
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                className="profile-textarea"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="profile-file-input"
              />
              {preview && (
                <img src={preview} alt="Preview" className="profile-image-preview" />
              )}
            </div>
          ) : (
            <div className="profile-bio">
              <p>{user.bio || 'No bio yet'}</p>
              <p className="profile-email">{user.email}</p>
            </div>
          )}
        </div>
      </div>
      {isOwnProfile && (
        <div className="profile-actions">
          <button className="profile-btn create-workplan" onClick={handleCreateWorkPlan}>
            Create Work Plan
          </button>
          <button className="profile-btn view-workplan" onClick={handleViewWorkPlanList}>
            View Work Plans
          </button>
          <button className="profile-btn add-post" onClick={handleAddPost}>
            Add Post
          </button>
          <button className="profile-btn view-posts" onClick={handleViewPosts}>
            View My Posts
          </button>
          <button className="profile-btn delete" onClick={handleDelete}>
            Delete Profile
          </button>
          <button className="profile-btn home" onClick={handleHome}>
            Home
          </button>
        </div>
      )}
      <div className="profile-posts">
        <div className="posts-grid">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="post-item">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="post-image" />
                ) : (
                  <div className="post-placeholder">{post.title.charAt(0).toUpperCase()}</div>
                )}
                <div className="post-interactions">
                  <div className="interaction">
                    <span className="icon like-icon">❤️</span>
                    <span>{postInteractions[post.id]?.likes.length || 0} Likes</span>
                    {postInteractions[post.id]?.likes.length > 0 && (
                      <div className="likes-list">
                        {postInteractions[post.id].likes.map((username, index) => (
                          <span 
                            key={index} 
                            className="like-username" 
                            onClick={() => handleUserProfile(username)} // Navigate to user profile
                          >
                            {username}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="interaction">
                    <span className="icon comment-icon">💬</span>
                    <span>{postInteractions[post.id]?.comments.length || 0} Comments</span>
                    {postInteractions[post.id]?.comments.length > 0 && (
                      <div className="comments-list">
                        {postInteractions[post.id].comments.map((comment, index) => (
                          <div key={index} className="comment">
                            <span 
                              className="comment-username" 
                              onClick={() => handleUserProfile(comment.username)} // Navigate to user profile
                            >
                              {comment.username}
                            </span>
                            : <span className="comment-text">{comment.comment}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-posts">No posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;