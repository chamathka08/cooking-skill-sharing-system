import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAllPosts, getLikesByPostId, createLike, deleteLike, getCommentsByPostId, createComment, updateComment, deleteComment } from '../services/api';
import './Explore.css';

const Explore = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [commentContent, setCommentContent] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await getAllPosts();
        setPosts(Array.isArray(allPosts) ? allPosts : []);

        const likesData = {};
        const commentsData = {};
        for (const post of allPosts || []) {
          const postLikes = await getLikesByPostId(post.id);
          likesData[post.id] = Array.isArray(postLikes) ? postLikes : [];
          const postComments = await getCommentsByPostId(post.id);
          commentsData[post.id] = Array.isArray(postComments) ? postComments : [];
        }
        setLikes(likesData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching posts:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load posts.',
          confirmButtonColor: '#8a9a5b',
        });
      }
    };
    fetchPosts();
  }, []);

  const validateComment = (content, postId) => {
    const errors = [];
    const trimmedContent = content?.trim() || '';

    // Required field
    if (!trimmedContent) {
      errors.push('Comment cannot be empty.');
    }

    // Length constraints
    if (trimmedContent.length < 3) {
      errors.push('Comment must be at least 3 characters long.');
    }
    if (trimmedContent.length > 500) {
      errors.push('Comment cannot exceed 500 characters.');
    }

    setCommentErrors(prev => ({ ...prev, [postId]: errors }));
    return errors.length === 0;
  };

  const handleLike = async (postId) => {
    if (!currentUserId) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'You must be logged in to like posts.',
        confirmButtonColor: '#8a9a5b',
      });
      return;
    }
    try {
      const postLikes = likes[postId] || [];
      const hasLiked = postLikes.some(like => like.userId === currentUserId);
      if (hasLiked) {
        await deleteLike(currentUserId, postId);
      } else {
        await createLike(currentUserId, postId);
      }
      const updatedLikes = await getLikesByPostId(postId);
      setLikes(prev => ({ ...prev, [postId]: Array.isArray(updatedLikes) ? updatedLikes : [] }));
    } catch (error) {
      console.error('Error handling like:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to handle like.',
        confirmButtonColor: '#8a9a5b',
      });
    }
  };

  const handleComment = async (postId) => {
    if (!currentUserId) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'You must be logged in to comment.',
        confirmButtonColor: '#8a9a5b',
      });
      return;
    }

    const content = commentContent[postId] || '';
    if (!validateComment(content, postId)) {
      return;
    }

    try {
      await createComment(currentUserId, postId, content.trim());
      const updatedComments = await getCommentsByPostId(postId);
      setComments(prev => ({ ...prev, [postId]: Array.isArray(updatedComments) ? updatedComments : [] }));
      setCommentContent(prev => ({ ...prev, [postId]: '' }));
      setCommentErrors(prev => ({ ...prev, [postId]: [] }));
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Comment added successfully.',
        confirmButtonColor: '#8a9a5b',
        timer: 3000,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add comment.',
        confirmButtonColor: '#8a9a5b',
      });
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content || '');
  };

  const handleUpdateComment = async (postId, commentId) => {
    if (!currentUserId) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'You must be logged in to update comments.',
        confirmButtonColor: '#8a9a5b',
      });
      return;
    }

    if (!validateComment(editContent, postId)) {
      return;
    }

    try {
      await updateComment(commentId, editContent.trim());
      const updatedComments = await getCommentsByPostId(postId);
      setComments(prev => ({ ...prev, [postId]: Array.isArray(updatedComments) ? updatedComments : [] }));
      setEditingComment(null);
      setEditContent('');
      setCommentErrors(prev => ({ ...prev, [postId]: [] }));
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Your comment has been updated successfully.',
        confirmButtonColor: '#8a9a5b',
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update comment.',
        confirmButtonColor: '#8a9a5b',
      });
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!currentUserId) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'You must be logged in to delete comments.',
        confirmButtonColor: '#8a9a5b',
      });
      return;
    }
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8a9a5b',
      cancelButtonColor: '#e74c3c',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await deleteComment(commentId);
        const updatedComments = await getCommentsByPostId(postId);
        setComments(prev => ({ ...prev, [postId]: Array.isArray(updatedComments) ? updatedComments : [] }));
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Your comment has been deleted.',
          confirmButtonColor: '#8a9a5b',
          timer: 3000,
        });
      } catch (error) {
        console.error('Error deleting comment:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete comment.',
          confirmButtonColor: '#8a9a5b',
        });
      }
    }
  };

  const handleBackToHome = () => navigate('/home');

  const handleUserProfile = (targetUserId) => {
    if (targetUserId) {
      navigate(`/profile/${targetUserId}`);
    }
  };

  return (
    <div className="explore-wrapper">
      <header className="explore-header">
        <div className="header-logo">
          <span className="logo-icon">👩‍🍳</span>
          <h1 className="logo-text">FlavorShare</h1>
        </div>
        <nav className="header-nav">
          <button className="nav-btn back" onClick={handleBackToHome}>
            Back to Home
          </button>
        </nav>
      </header>

      <section className="posts-section">
        <h3 className="posts-title">Explore Skill-Sharing Posts..</h3>
        <div className="posts-list">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="post-item">
                <div className="post-header">
                  {post.userId && post.username ? (
                    <span 
                      className="clickable-username" 
                      onClick={() => handleUserProfile(post.userId)}
                    >
                      {post.username}
                    </span>
                  ) : (
                    <span className="post-username-placeholder"></span>
                  )}
                  <span className="post-date">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                {post.image ? (
                  <img src={post.image} alt={post.title} className="post-image" />
                ) : (
                  <div className="no-image-placeholder">No Image Available</div>
                )}

                <div className="post-content">
                  <h4 className="post-title">{post.title}</h4>
                  <p className="post-description">{post.description}</p>
                </div>

                <div className="like-section">
                  <button
                    className={`like-btn ${likes[post.id]?.some(l => l.userId === currentUserId) ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    {likes[post.id]?.some(l => l.userId === currentUserId) ? 'Unlike' : 'Like'}
                  </button>
                  <p className="like-count">Likes: {likes[post.id]?.length || 0}</p>
                  {likes[post.id]?.length > 0 && (
                    <div className="likes-list">
                      {likes[post.id].map((like, index) => (
                        <span 
                          key={index} 
                          className="like-username" 
                          onClick={() => handleUserProfile(like.userId)}
                        >
                          {like.username || ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="comment-form">
                  <div className="comment-input-wrapper">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentContent[post.id] || ''}
                      onChange={(e) => {
                        setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }));
                        validateComment(e.target.value, post.id);
                      }}
                    />
                    {commentErrors[post.id]?.length > 0 && (
                      <div className="error-message">
                        {commentErrors[post.id].map((error, index) => (
                          <p key={index}>{error}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="comment-btn" onClick={() => handleComment(post.id)}>
                    Comment
                  </button>
                </div>

                <div className="comments-section">
                  {comments[post.id]?.length > 0 ? (
                    comments[post.id].map(comment => (
                      <div key={comment.id} className="comment-item">
                        {editingComment === comment.id ? (
                          <div className="edit-comment-form">
                            <div className="comment-input-wrapper">
                              <input
                                type="text"
                                value={editContent}
                                onChange={(e) => {
                                  setEditContent(e.target.value);
                                  validateComment(e.target.value, post.id);
                                }}
                              />
                              {commentErrors[post.id]?.length > 0 && (
                                <div className="error-message">
                                  {commentErrors[post.id].map((error, index) => (
                                    <p key={index}>{error}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button className="save-btn" onClick={() => handleUpdateComment(post.id, comment.id)}>Save</button>
                            <button className="cancel-btn" onClick={() => setEditingComment(null)}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <div className="comment-header">
                              {comment.userId && comment.username ? (
                                <span 
                                  className="clickable-username" 
                                  onClick={() => handleUserProfile(comment.userId)}
                                >
                                  {comment.username}
                                </span>
                              ) : (
                                <span className="comment-username-placeholder"></span>
                              )}
                              <span className="comment-date">
                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                            <p className="comment-content">{comment.content || ''}</p>
                            {comment.userId === currentUserId && (
                              <div className="comment-actions">
                                <button className="edit-btn" onClick={() => handleEditComment(comment)}>Edit</button>
                                <button className="delete-btn" onClick={() => handleDeleteComment(post.id, comment.id)}>Delete</button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No comments yet.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No posts available to explore.</p>
          )}
        </div>
      </section>

      <footer className="explore-footer">
        <p>© 2025 FlavorShare - Fueling Culinary Creativity</p>
      </footer>
    </div>
  );
};

export default Explore;