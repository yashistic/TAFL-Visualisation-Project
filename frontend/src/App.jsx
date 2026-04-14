import { NavLink, Route, Routes } from 'react-router-dom';
import Playground from './pages/Playground.jsx';
import Concepts from './pages/Concepts.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">
          Regex <span>Language Explorer</span>
        </h1>
        <nav className="nav-links">
          <NavLink end className={({ isActive }) => (isActive ? 'active' : '')} to="/">
            Playground
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? 'active' : '')} to="/concepts">
            Concepts
          </NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Playground />} />
        <Route path="/concepts" element={<Concepts />} />
      </Routes>
    </div>
  );
}
