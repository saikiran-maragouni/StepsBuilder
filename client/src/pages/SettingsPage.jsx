import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import UpgradeModal from '../components/UpgradeModal';
import api from '../utils/api';
import { User, Bell, Shield, LogOut, Save, Crown, Zap } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    hoursPerDay: user?.hoursPerDay || 1,
    checkInPreference: user?.checkInPreference || 'evening',
  });
  const [saving, setSaving] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'number' ? +e.target.value : e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', form);
      updateUser(data.user);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <div>
            <h1 className="topbar-title">Settings</h1>
            <p className="topbar-sub">Manage your account and preferences</p>
          </div>
        </div>

        <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Plan Card */}
          <div className="card" style={{ padding: 28, background: user?.plan === 'pro' ? 'var(--gradient-soft)' : undefined, border: user?.plan === 'pro' ? '1px solid rgba(59,130,246,0.3)' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Crown size={18} color={user?.plan === 'pro' ? 'var(--blue)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Your Plan</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    {user?.plan === 'pro' ? 'You have access to all Pro features' : 'Upgrade to unlock unlimited goals & AI features'}
                  </div>
                </div>
              </div>
              {user?.plan === 'pro' ? (
                <span className="badge-pro"><Crown size={10} /> Pro</span>
              ) : (
                <button onClick={() => setShowUpgrade(true)} className="btn btn-primary btn-sm">
                  <Zap size={14} /> Upgrade to Pro
                </button>
              )}
            </div>
          </div>

          {/* Profile */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <User size={18} color="var(--blue)" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Profile</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: '16px 20px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</div>
                <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600, marginTop: 2 }}>
                  {user?.plan === 'pro' ? '✦ Pro Plan' : 'Free Plan'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-wrapper">
                <label className="input-label">Display Name</label>
                <input id="settings-name" className="input" value={form.name} onChange={set('name')} />
              </div>
              <div className="grid-2">
                <div className="input-wrapper">
                  <label className="input-label">Hours Available Per Day</label>
                  <input id="settings-hours" type="number" className="input" min={0.5} max={12} step={0.5} value={form.hoursPerDay} onChange={set('hoursPerDay')} />
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Check-In Preference</label>
                  <select id="settings-checkin" className="input" value={form.checkInPreference} onChange={set('checkInPreference')}>
                    {['morning', 'evening', 'both'].map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Account info */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Shield size={18} color="var(--blue)" />
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Account</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Email', user?.email],
                ['Plan', user?.plan === 'pro' ? 'Pro' : 'Free'],
                ['Member Since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button id="btn-save-settings" className="btn btn-primary" onClick={save} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Save size={15} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="btn btn-danger" onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>
      </main>

      {/* Upgrade modal */}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
