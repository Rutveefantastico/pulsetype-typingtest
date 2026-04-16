import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

function Navbar({ theme, onToggleTheme }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <motion.header
      className="navbar"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link className="brand" to="/">
        <span className="brand-mark">
          <img src="/app-logo.png" alt="PulseType logo" className="brand-logo" />
        </span>
        <div>
          <strong>PulseType</strong>
          <p>Precision typing analytics</p>
        </div>
      </Link>

      <nav className="nav-links">
        <NavLink to="/">Test</NavLink>
        {isAuthenticated ? <NavLink to="/leaderboard">Leaderboard</NavLink> : null}
        {isAuthenticated ? <NavLink to="/dashboard">Dashboard</NavLink> : null}
        {isAuthenticated ? <NavLink to="/games">Games</NavLink> : null}
        {isAuthenticated ? <NavLink to="/profile">Profile</NavLink> : null}
        {!isAuthenticated ? <NavLink to="/login">Login</NavLink> : null}
      </nav>

      <div className="nav-actions">
        <button className="theme-toggle" type="button" onClick={onToggleTheme}>
          Theme: {theme}
        </button>
        {isAuthenticated ? (
          <div className="profile-chip">
            {user?.profile_pic ? (
              <img className="profile-avatar" src={user.profile_pic} alt={user.name} />
            ) : (
              <div className="profile-avatar fallback-avatar">
                {user?.name?.slice(0, 1) || "U"}
              </div>
            )}
            <span>{user?.name}</span>
            <button className="button secondary inline-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </motion.header>
  );
}

export default Navbar;
