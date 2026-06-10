import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import UpgradeModal from '../components/UpgradeModal';
import { Plus, Target, Pause, Play, Trash2, TrendingUp, Clock, ChevronRight, Search, Crown, Zap } from 'lucide-react';

const categoryColors = { learning: '#3b82f6', career: '#6366f1', fitness: '#10b981', business: '#f59e0b', personal: '#06b6d4' };

export default function GoalsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active');
  const [deleting, setDeleting] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPro = user?.plan === 'pro';
  const activeGoalCount = goals.filter(g => g.status === 'active').length;
  const atFreeLimit = !isPro && activeGoalCount >= 3;

  useEffect(() => {
    api.get('/goals').then(({ data }) => setGoals(data.goals || [])).catch(() => toast.error('Failed to load goals.')).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (goal) => {
    const newStatus = goal.status === 'active' ? 'paused' : 'active';
    try {
      const { data } = await api.patch(`/goals/${goal._id}/status`, { status: newStatus });
      setGoals((prev) => prev.map((g) => g._id === goal._id ? data.goal : g));
      toast.success(`Goal ${newStatus === 'paused' ? 'paused' : 'reactivated'}.`);
    } catch { toast.error('Failed to update status.'); }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Delete this goal? This will also remove its roadmap and tasks.')) return;
    setDeleting(id);
    try {
      await api.delete(`/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g._id !== id));
      toast.success('Goal deleted.');
    } catch { toast.error('Failed to delete goal.'); }
    finally { setDeleting(null); }
  };

  const filtered = goals.filter((g) => {
    const matchStatus = filter === 'all' || g.status === filter;
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (loading) return <div className="app-layout"><Sidebar /><main className="main-content"><div className="loading-screen"><div className="spinner" style={{ width: 40, height: 40 }} /></div></main></div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <div>
            <h1 className="topbar-title">My Goals</h1>
            <p className="topbar-sub">{goals.filter(g => g.status === 'active').length} active · {goals.length} total</p>
          </div>
          {atFreeLimit ? (
            <button onClick={() => setShowUpgrade(true)} className="btn btn-primary">
              <Crown size={15} /> Upgrade for More
            </button>
          ) : (
            <Link to="/goals/new" className="btn btn-primary"><Plus size={16} /> New Goal</Link>
          )}
        </div>

        {/* Free plan limit banner */}
        {atFreeLimit && (
          <div style={{ marginBottom: 20, padding: '14px 18px', background: 'var(--gradient-soft)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Crown size={16} color="var(--blue)" />
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                You've reached the <strong>3 goal limit</strong> on the Free plan.
              </span>
            </div>
            <button onClick={() => setShowUpgrade(true)} className="btn btn-primary btn-sm">
              <Zap size={13} /> Upgrade to Pro
            </button>
          </div>
        )}

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingLeft: 40 }} placeholder="Search goals..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="filter-tabs-container" style={{ flexShrink: 0, maxWidth: '100%' }}>
            <div style={{ display: 'flex', background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 4, minWidth: 'max-content' }}>
              {['active', 'paused', 'completed', 'all'].map((s) => (
                <button key={s} onClick={() => setFilter(s)}
                  style={{ padding: '7px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'var(--transition)', borderRadius: 'calc(var(--radius-md) - 2px)',
                    background: filter === s ? 'var(--gradient)' : 'transparent',
                    color: filter === s ? 'white' : 'var(--text-muted)' }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card empty-state" style={{ padding: 60 }}>
            <div className="empty-icon"><Target size={28} /></div>
            <div className="empty-title">{search ? 'No goals match your search' : 'No goals yet'}</div>
            <div className="empty-sub">Create your first goal and let AI build your personalized roadmap</div>
            <Link to="/goals/new" className="btn btn-primary"><Plus size={15} /> Create Goal</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((goal) => {
              const color = categoryColors[goal.category] || '#6366f1';
              return (
                <div key={goal._id} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  {/* Category bar (hidden on very small screens to save space) */}
                  <div className="hide-xs" style={{ width: 4, height: 56, borderRadius: 'var(--radius-full)', background: color, flexShrink: 0 }} />

                  {/* Info */}
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <Link to={`/goals/${goal._id}`} style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}
                        className="hover:text-blue">{goal.title}</Link>
                      <span className={`badge badge-${goal.status === 'active' ? 'success' : goal.status === 'paused' ? 'warning' : 'muted'}`}>
                        {goal.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px 16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {goal.timeframe || 'No timeframe'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TrendingUp size={12} /> Momentum: {goal.momentumScore}/100
                      </span>
                      <span style={{ fontSize: 12, color, fontWeight: 600, textTransform: 'capitalize' }}>{goal.category}</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="progress-bar" style={{ marginTop: 10, height: 4 }}>
                      <div className="progress-fill" style={{ width: `${goal.momentumScore}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => toggleStatus(goal)} className="btn btn-ghost btn-icon" title={goal.status === 'active' ? 'Pause' : 'Resume'}>
                      {goal.status === 'active' ? <Pause size={15} /> : <Play size={15} />}
                    </button>
                    <button onClick={() => deleteGoal(goal._id)} disabled={deleting === goal._id} className="btn btn-danger btn-icon" title="Delete">
                      <Trash2 size={15} />
                    </button>
                    <Link to={`/goals/${goal._id}`} className="btn btn-ghost btn-sm">
                      View <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
