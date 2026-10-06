import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../components/common/Toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const wrongRole = location.state?.wrongRole;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(form);
      toast.success('Welcome back!');
      const user = res.data?.user || res.data || res;
      if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user?.role === 'SHOPKEEPER') {
        navigate('/shopkeeper/dashboard', { replace: true });
      } else {
        const redirectTo = location.state?.from?.pathname || '/dashboard';
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Could not sign in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canteen-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-extrabold text-canteen-primary">Campus Eats</p>
          <p className="mt-1 text-sm text-canteen-muted">Pre-book your food, skip the queue</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <h1 className="font-display text-lg font-bold">Sign in</h1>

          {wrongRole && (
            <p className="rounded-lg bg-canteen-warnLight px-3 py-2 text-xs text-canteen-warn">
              That account isn't a student/staff account. Sign in with a user account to continue.
            </p>
          )}
          {error && <p className="rounded-lg bg-canteen-warnLight px-3 py-2 text-xs text-canteen-warn">{error}</p>}

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-canteen-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="you@university.edu"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-canteen-muted">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-canteen-muted">
            New here?{' '}
            <Link to="/register" className="font-semibold text-canteen-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
