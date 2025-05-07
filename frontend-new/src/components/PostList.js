import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPostsByUserId, deletePost } from '../services/api';
import Swal from 'sweetalert2';
import './PostList.css';

const PostList = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate('/login');
          return;
        }
        const data = await getPostsByUserId(userId);
        setPosts(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load posts.');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  const handleDelete = async (id) => {
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
          await deletePost(id);
          setPosts(posts.filter((post) => post.id !== id));
          Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
        } catch (err) {
          Swal.fire('Error', 'Failed to delete post.', 'error');
        }
      }
    });
  };

  const handleEdit = (id) => {
    navigate(`/post/edit/${id}`);
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="post-list-container">
      <h2>Your Posts</h2>
      {posts.length > 0 ? (
        <div className="posts-grid">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <h4>{post.title}</h4>
              {post.image && <img src={post.image} alt={post.title} className="post-image" />}
              <p>{post.description}</p>
              <p><small>Created: {new Date(post.createdAt).toLocaleDateString()}</small></p>
              <div className="post-actions">
                <button onClick={() => handleEdit(post.id)} className="edit-btn">Edit</button>
                <button onClick={() => handleDelete(post.id)} className="delete-btn">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-posts">No posts yet.</p>
      )}
    </div>
  );
};

export default PostList;