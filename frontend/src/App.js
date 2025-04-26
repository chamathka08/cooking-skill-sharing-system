import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserList from './components/UserList';
import UserForm from './components/UserForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-white text-lg font-bold">Cooking Skill Sharing</Link>
            <Link to="/create" className="text-white hover:text-gray-200">Create User</Link>
          </div>
        </nav>
        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<UserList />} />
            <Route path="/create" element={<UserForm />} />
            <Route path="/edit/:id" element={<UserForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;