import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, createUser, updateUser } from '../utils/api';

function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await getUserById(id);
          setUser({ name: response.data.name || '', email: response.data.email, password: '' });
          setError(null);
        } catch (err) {
          setError('Failed to fetch user. Please try again.');
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateUser(id, user);
      } else {
        await createUser(user);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Failed to save user. Please check your input.');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {id ? 'Edit User' : 'Create User'}
      </h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={id ? 'Leave blank to keep unchanged' : 'Enter password'}
            required={!id}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
        >
          {id ? 'Update User' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

export default UserForm;