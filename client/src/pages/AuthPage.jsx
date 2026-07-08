import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, Zap } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slowRequest, setSlowRequest] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const { login, register, demoLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Client-side validation (instant feedback before API call) ─────────────
    if (mode === 'register') {
      if (!form.name.trim()) return toast.error('Please enter your full name.');
      if (form.password.length < 8) return toast.error('Password must be at least 8 characters.');
    }
    if (!form.email.includes('@')) return toast.error('Please enter a valid email address.');

    setLoading(true);
    setSlowRequest(false);
    const slowTimer = setTimeout(() => setSlowRequest(true), 3000);
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password);
        toast.success(`Welcome back, ${user.name}! 👋`);
        navigate(user.onboardingCompleted ? '/dashboard' : '/onboarding');
      } else {
        const user = await register(form.name, form.email, form.password);
        toast.success('Account created! Let\'s set up your first goal. 🎉');
        navigate('/onboarding');
      }
    } catch (err) {
      const data = err.response?.data;
      // Server returns validation errors as an array under `errors`
      if (data?.errors && Array.isArray(data.errors)) {
        toast.error(data.errors[0]);
      } else {
        toast.error(data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      clearTimeout(slowTimer);
      setSlowRequest(false);
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    const slowTimer = setTimeout(() => setSlowRequest(true), 3000);
    try {
      const user = await demoLogin();
      toast.success('Welcome! Exploring as Demo User 👋');
      navigate(user.onboardingCompleted ? '/dashboard' : '/onboarding');
    } catch {
      toast.error('Could not load demo. Please try again.');
    } finally {
      clearTimeout(slowTimer);
      setSlowRequest(false);
      setDemoLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, background: 'var(--gradient)', borderRadius: 'var(--radius-lg)', marginBottom: 16, boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}>
            <Zap size={26} color="white" />
          </div>
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {mode === 'login' ? 'Sign in to your Goal OS' : 'Start building your roadmap'}
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 28, border: '1px solid var(--border)' }}>
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 'calc(var(--radius-md) - 2px)', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'var(--transition)',
                background: mode === m ? 'var(--gradient)' : 'transparent',
                color: mode === m ? 'white' : 'var(--text-secondary)',
                boxShadow: mode === m ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {mode === 'register' && (
            <div className="input-wrapper">
              <label className="input-label">Full Name</label>
              <input id="name" className="input" placeholder="Alex Johnson" value={form.name} onChange={set('name')} required />
            </div>
          )}
          <div className="input-wrapper">
            <label className="input-label">Email</label>
            <input id="email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="password" type={showPw ? 'text' : 'password'} className="input" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={8} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: -8 }}>
              Password must be at least 8 characters
            </p>
          )}

          <button id={`btn-${mode}`} type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '14px' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {slowRequest && (
            <p style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: 2,
              lineHeight: 1.5,
              animation: 'fadeIn 0.5s ease',
            }}>
              ☕ First load may take ~30 seconds while our server wakes up. Thanks for your patience!
            </p>
          )}
        </form>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button
            id="btn-demo"
            type="button"
            onClick={handleDemo}
            disabled={demoLoading || loading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16,185,129,0.3)',
              background: 'rgba(16,185,129,0.06)',
              color: '#10b981',
              fontSize: 14,
              fontWeight: 600,
              cursor: demoLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
              opacity: demoLoading ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!demoLoading) e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; }}
          >
            {demoLoading
              ? <span className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(16,185,129,0.3)', borderTopColor: '#10b981' }} />
              : '🚀'}
            {demoLoading ? 'Loading demo...' : 'Try Demo — No sign up needed'}
          </button>

          {slowRequest && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
              ☕ First load may take ~30 seconds while our server wakes up.
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--indigo)', fontWeight: 600, fontSize: 13 }}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
