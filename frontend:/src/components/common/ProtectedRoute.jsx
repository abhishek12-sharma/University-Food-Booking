import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';

/**
 * Guards routes that require a signed-in USER.
 *
 * This is a UX convenience, not a security boundary — the backend is
 * still the authority on every request (DEVELOPMENT_RULES.md
 * section 9, brief section 1). A user who is authenticated but not a
 * USER (e.g. an ADMIN or SHOPKEEPER account) is redirected away from
 * the user panel rather than shown it.
 */
export default function ProtectedRoute({ children }) {
  const { status, isAuthenticated, isUser } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <Loader fullPage label="Checking your session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isUser) {
    return <Navigate to="/login" replace state={{ wrongRole: true }} />;
  }

  return children;
}
