import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getUser, updateUser, deleteUser, getFollowers, getFollowing } from '../services/api';
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
  const isOwnProfile = !userId || userId === currentUserId;

  useEffect(() => {
    const fetchUser = async () => {
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
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Fetch Failed', text: 'User not found or please log in.' });
        navigate('/login');
      }
    };
    fetchUser();
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

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="profile-image" />
            ) : (
              <span>{user.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <h2>{user.username}'s Profile</h2>
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
          <div className="profile-details">
            <p><span className="label">Email:</span> {user.email}</p>
            <p><span className="label">Bio:</span> {user.bio || 'No bio yet'}</p>
            <div className="follow-stats">
              <p><span className="label">Followers:</span> {followers.length}</p>
              <p><span className="label">Following:</span> {following.length}</p>
            </div>
            {!isOwnProfile && (
              <FollowButton currentUserId={currentUserId} targetUserId={user.id} />
            )}
          </div>
        )}
        <div className="profile-buttons">
          {isOwnProfile && (
            <>
              <button className={`profile-btn ${isEditing ? 'save' : 'edit'}`} onClick={handleUpdate}>
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </button>
              <button className="profile-btn delete" onClick={handleDelete}>Delete Profile</button>
              <button className="profile-btn create-workplan" onClick={handleCreateWorkPlan}>
                Create Work Plan
              </button>
              <button className="profile-btn view-workplan" onClick={handleViewWorkPlanList}>
                View Work Plan List
              </button>
            </>
          )}
          <button className="profile-btn home" onClick={handleHome}>Home</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;