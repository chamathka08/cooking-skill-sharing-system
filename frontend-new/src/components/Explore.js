import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAllPosts, getLikesByPostId, createLike, deleteLike, getCommentsByPostId, createComment, updateComment, deleteComment } from '../services/api';
import './Explore.css';

const Explore = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState({}); // { postId: [likes] }
  const [comments, setComments] = useState({}); // { postId: [comments] }
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
          const postLikes = await getLikesByPostId(post.id);
          likesData[post.id] = postLikes;
          const postComments = await getCommentsByPostId(post.id);
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
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2ecc71',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteComment(commentId);
          const updatedComments = await getCommentsByPostId(postId);
          setComments(prev => ({ ...prev, [postId]: updatedComments }));
          Swal.fire('Deleted!', 'Your comment has been deleted.', 'success');
        } catch (error) {
          console.error('Error deleting comment:', error);
          Swal.fire('Error', 'Failed to delete comment.', 'error');
        }
      }
    });
  };

  const handleBackToHome = () => navigate('/home');

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
        <h3 className="posts-title">Explore Skill-Sharing Posts</h3>
        <div className="posts-list">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="post-item">
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt={post.title} className="post-image" />
                ) : (
                  <div className="no-image-placeholder">No Image Available</div>
                )}
                <h4 className="post-title">{post.title}</h4>
                <p className="post-description">{post.description}</p>
                <p className="post-author">By: {post.username || 'Unknown'}</p>

                {/* Like/Unlike Section */}
                <button
                  className={`like-btn ${likes[post.id]?.some(l => l.userId === currentUserId) ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  {likes[post.id]?.some(l => l.userId === currentUserId) ? 'Unlike' : 'Like'}
                </button>
                <p className="like-count">Likes: {likes[post.id]?.length || 0}</p>

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
                            <p className="comment-content">{comment.content}</p>
                            <p className="comment-author">By: {comment.userId === currentUserId ? 'You' : 'User'}</p>
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