import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand navbar-light glass-nav mb-4">
      <div className="container">
        <Link className="navbar-brand brand" to="/">🍑 Sunday<em>Plate</em></Link>
        <ul className="navbar-nav ms-auto align-items-center gap-2">
          {!user && (
            <>
              <li className="nav-item"><NavLink className="nav-link" to="/login">Login</NavLink></li>
              <li className="nav-item"><NavLink className="nav-link" to="/register">Sign up</NavLink></li>
            </>
          )}
          {user?.role === 'CUSTOMER' && (
            <>
              <li className="nav-item"><NavLink className="nav-link" to="/" end>Menu</NavLink></li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/cart">
                  Cart {count > 0 && <span className="badge bg-danger">{count}</span>}
                </NavLink>
              </li>
              <li className="nav-item"><NavLink className="nav-link" to="/orders">My Orders</NavLink></li>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <li className="nav-item"><NavLink className="nav-link" to="/admin">Dashboard</NavLink></li>
          )}
          {user && (
            <>
              <li className="nav-item text-muted small">Hi, {user.name}</li>
              <li className="nav-item">
                <button className="btn btn-sm btn-outline-secondary" onClick={handleLogout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
