import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authApi from '../../services/authApi';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { toast } from '../../components/common/Toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password updated.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Could not update password.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-extrabold">Profile</h1>

      <section className="card p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-canteen-primary text-xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </span>
          <div>
            <p className="font-display text-lg font-bold">{user?.name}</p>
            <p className="text-sm text-canteen-muted">{user?.email}</p>
            {user?.phone && <p className="text-sm text-canteen-muted">{user.phone}</p>}
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-base font-bold">Change password</h2>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label htmlFor="currentPassword" className="mb-1 block text-xs font-semibold text-canteen-muted">
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              value={form.currentPassword}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="mb-1 block text-xs font-semibold text-canteen-muted">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              value={form.newPassword}
              onChange={handleChange}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-xs font-semibold text-canteen-muted">
              Confirm new password
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
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>

      <button type="button" onClick={() => setConfirmLogoutOpen(true)} className="btn-danger w-full">
        Log out
      </button>

      <ConfirmDialog
        open={confirmLogoutOpen}
        title="Log out of Campus Eats?"
        description="You'll need to sign in again to place or track orders."
        confirmLabel="Log out"
        danger
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogoutOpen(false)}
      />
    </div>
  );
}
