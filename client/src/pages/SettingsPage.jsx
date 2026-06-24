import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import UpgradeModal from '../components/UpgradeModal';
import api from '../utils/api';
import {
  User, Bell, Shield, LogOut, Save,
  Crown, Zap, Clock, Sun, Moon, Settings as SettingsIcon,
} from 'lucide-react';

/* ── Section card ──────────────────────────────────────────────── */
function Section({ icon: Icon, title, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 18,
      overflow: 'hidden',
      backdropFilter: 'blur(16px)',
    }}>
      <div style={{
        padding: '16px 22px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'rgba(16,185,129,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color="var(--green)" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{title}</span>
      </div>
      <div style={{ padding: '20px 22px' }}>{children}</div>
    </div>
  );
}

/* ── Info row ──────────────────────────────────────────────────── */
function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
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

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'number' ? +e.target.value : e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', form);
      updateUser(data.user);
      toast.success('Settings saved! ✓');
    } catch { toast.error('Failed to save settings.'); }
    finally { setSaving(false); }
  };

  const checkInOptions = [
    { value: 'morning', label: 'Morning', icon: Sun },
    { value: 'evening', label: 'Evening', icon: Moon },
    { value: 'both',    label: 'Both',    icon: Bell },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">

        {/* ── Page header ──────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <SettingsIcon size={14} color="var(--green)" />
            <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Account</span>
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Manage your profile and preferences</p>
        </div>

        {/* ── Profile hero (full width) ─────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.13) 0%, rgba(5,150,105,0.06) 100%)',
          border: '1px solid rgba(16,185,129,0.22)',
          borderRadius: 20, padding: '24px 28px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: 'var(--gradient)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800, color: 'white',
            boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
              background: user?.plan === 'pro' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)',
              color: user?.plan === 'pro' ? 'var(--green)' : 'var(--text-muted)',
              border: `1px solid ${user?.plan === 'pro' ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.1)'}`,
            }}>
              <Crown size={10} />{user?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </span>
          </div>
          {user?.plan !== 'pro' && (
            <button onClick={() => setShowUpgrade(true)} className="btn btn-primary">
              <Zap size={15} /> Upgrade to Pro
            </button>
          )}
        </div>

        {/* ── Two-column grid (desktop) / single column (mobile) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}>

          {/* LEFT: Profile form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Section icon={User} title="Profile">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="input-wrapper">
                  <label className="input-label">Display Name</label>
                  <input
                    id="settings-name"
                    className="input"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Your name"
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} /> Hours Available Per Day
                  </label>
                  <input
                    id="settings-hours"
                    type="number"
                    className="input"
                    min={0.5} max={12} step={0.5}
                    value={form.hoursPerDay}
                    onChange={set('hoursPerDay')}
                  />
                </div>

                <div className="input-wrapper">
                  <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Bell size={12} /> Check-In Preference
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    {checkInOptions.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setForm(f => ({ ...f, checkInPreference: value }))}
                        style={{
                          flex: 1,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                          padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                          border: form.checkInPreference === value
                            ? '1.5px solid rgba(16,185,129,0.6)'
                            : '1px solid rgba(255,255,255,0.1)',
                          background: form.checkInPreference === value
                            ? 'rgba(16,185,129,0.12)'
                            : 'rgba(255,255,255,0.04)',
                          color: form.checkInPreference === value ? 'var(--green)' : 'var(--text-muted)',
                          transition: 'all 0.2s', fontSize: 12, fontWeight: 600,
                        }}
                      >
                        <Icon size={16} />{label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Save + Sign Out */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                id="btn-save-settings"
                className="btn btn-primary"
                onClick={save}
                disabled={saving}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {saving
                  ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving…</>
                  : <><Save size={15} /> Save Changes</>}
              </button>
              <button
                className="btn btn-danger"
                onClick={logout}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>

          {/* RIGHT: Account info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Section icon={Shield} title="Account Info">
              <InfoRow label="Email"        value={user?.email} />
              <InfoRow label="Plan"         value={user?.plan === 'pro' ? '✦ Pro' : 'Free'} />
              <InfoRow
                label="Member Since"
                value={user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                  : '—'}
                last
              />
            </Section>

            {/* Usage tips card */}
            <div style={{
              background: 'rgba(16,185,129,0.06)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 16, padding: '18px 20px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={14} /> Tips to get the most out of StepsBuilder
              </div>
              {[
                '🎯 Create specific, measurable goals for better AI tasks',
                '📓 Journal daily — it boosts your momentum score',
                '⚡ Complete tasks in order for streak bonuses',
              ].map((tip, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
