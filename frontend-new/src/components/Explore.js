import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPosts, getLikesByPostId, createLike, deleteLike, getCommentsByPostId, createComment, updateComment, deleteComment } from '../services/api';
import './Explore.css';

const Explore = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({}); // { postId: [{ userId, username }] }
  const [comments, setComments] = useState({}); // { postId: [{ id, userId, username, content, createdAt }] }
  const [commentContent, setCommentContent] = useState({}); // { postId: string }
  const [editingComment, setEditingComment] = useState(null); // Comment being edited
  const [editContent, setEditContent] = useState(''); // Content for editing comment
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = await getAllPosts();
        setPosts(allPosts);

        // Fetch likes and comments for each post
        const likesData = {};
        const commentsData = {};
        for (const post of allPosts) {
          const postLikes = await getLikesByPostId(post.id); // Assuming { userId, username }
          likesData[post.id] = postLikes;
          const postComments = await getCommentsByPostId(post.id); // Assuming { id, userId, username, content, createdAt }
          commentsData[post.id] = postComments;
        }
        setLikes(likesData);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const postLikes = likes[postId] || [];
      const hasLiked = postLikes.some(like => like.userId === currentUserId);
      if (hasLiked) {
        await deleteLike(currentUserId, postId);
      } else {
        await createLike(currentUserId, postId);
      }
      const updatedLikes = await getLikesByPostId(postId);
      setLikes(prev => ({ ...prev, [postId]: updatedLikes }));
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleComment = async (postId) => {
    try {
      if (commentContent[postId]?.trim()) {
        await createComment(currentUserId, postId, commentContent[postId]);
        const updatedComments = await getCommentsByPostId(postId);
        setComments(prev => ({ ...prev, [postId]: updatedComments }));
        setCommentContent(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (postId, commentId) => {
    try {
      if (editContent.trim()) {
        await updateComment(commentId, editContent);
        const updatedComments = await getCommentsByPostId(postId);
        setComments(prev => ({ ...prev, [postId]: updatedComments }));
        setEditingComment(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await deleteComment(commentId);
      const updatedComments = await getCommentsByPostId(postId);
      setComments(prev => ({ ...prev, [postId]: updatedComments }));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleBackToHome = () => navigate('/home');

  const handleUserProfile = (targetUserId) => {
    navigate(`/profile/${targetUserId}`);
  };

  return (
    <div className="explore-wrapper">
      <header className="explore-header">
        <div className="header-logo">
          <span className="logo-icon">🍳</span>
          <h1 className="logo-text">CookSphere</h1>
        </div>
        <nav className="header-nav">
          <button className="nav-btn back" onClick={handleBackToHome}>
            Back to Home
          </button>
        </nav>
      </header>

      <section className="posts-section">
        <h3 className="posts-title">Explore Skill-Sharing Posts</h3>
        <div className="posts-list">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="post-item">
                {/* Post Header with Username */}
                <div className="post-header">
                  <span 
                    className="clickable-username" 
                    onClick={() => handleUserProfile(post.userId)}
                  >
                    {post.username || 'Unknown'}
                  </span>
                  <span className="post-date">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown Date'}
                  </span>
                </div>

                {/* Post Image */}
                {post.image ? (
                  <img src={post.image} alt={post.title} className="post-image" />
                ) : (
                  <div className="no-image-placeholder">No Image Available</div>
                )}

                {/* Post Content */}
                <div className="post-content">
                  <h4 className="post-title">{post.title}</h4>
                  <p className="post-description">{post.description}</p>
                </div>

                {/* Like/Unlike Section with Instagram-style Likes Display */}
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
                          {like.username}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comment Section */}
                <div className="comment-form">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentContent[post.id] || ''}
                    onChange={(e) => setCommentContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                  />
                  <button className="comment-btn" onClick={() => handleComment(post.id)}>
                    Comment
                  </button>
                </div>

                {/* Display Comments */}
                <div className="comments-list">
                  {comments[post.id]?.length > 0 ? (
                    comments[post.id].map(comment => (
                      <div key={comment.id} className="comment-item">
                        {editingComment === comment.id ? (
                          <div className="edit-comment-form">
                            <input
                              type="text"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />
                            <button onClick={() => handleUpdateComment(post.id, comment.id)}>Save</button>
                            <button onClick={() => setEditingComment(null)}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <div className="comment-header">
                              <span 
                                className="clickable-username" 
                                onClick={() => handleUserProfile(comment.userId)}
                              >
                                {comment.userId === currentUserId ? 'You' : comment.username || 'User'}
                              </span>
                              <span className="comment-date">
                                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Unknown Date'}
                              </span>
                            </div>
                            <p className="comment-content">{comment.content}</p>
                            {comment.userId === currentUserId && (
                              <div className="comment-actions">
                                <button onClick={() => handleEditComment(comment)}>Edit</button>
                                <button onClick={() => handleDeleteComment(post.id, comment.id)}>Delete</button>
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
        <p>© 2025 CookSphere - Fueling Culinary Creativity</p>
      </footer>
    </div>
  );
};

export default Explore;