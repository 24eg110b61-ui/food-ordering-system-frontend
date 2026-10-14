import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** role: 'CUSTOMER' | 'ADMIN' */
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />;
  }
  return children;
}
