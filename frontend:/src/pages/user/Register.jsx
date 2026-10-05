import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../components/common/Toast';

const INITIAL_FORM = { name: '', email: '', phone: '', password: '', confirmPassword: '' };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...payload } = form;
      void confirmPassword;
      await register(payload);
      toast.success('Account created. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canteen-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-extrabold text-canteen-primary">Campus Eats</p>
          <p className="mt-1 text-sm text-canteen-muted">Pre-book your food, skip the queue</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <h1 className="font-display text-lg font-bold">Create your account</h1>

          {error && <p className="rounded-lg bg-canteen-warnLight px-3 py-2 text-xs text-canteen-warn">{error}</p>}

          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-semibold text-canteen-muted">
              Full name
            </label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} className="input-field" />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-canteen-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="you@university.edu"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-xs font-semibold text-canteen-muted">
              Phone <span className="font-normal">(optional)</span>
            </label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} className="input-field" />
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
              minLength={8}
              value={form.password}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-xs font-semibold text-canteen-muted">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-canteen-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-canteen-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
