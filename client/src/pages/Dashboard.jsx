import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import {
  CheckCircle, Clock, Target,
  BookOpen, Plus, TrendingUp, Bell,
  Zap, ArrowRight, Sparkles, ChevronRight,
} from 'lucide-react';

// ── Detect mobile ──────────────────────────────────────────────
function useMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

// ── Arc progress ring (desktop only) ──────────────────────────
function ArcRing({ score = 0, size = 110 }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'On fire 🔥' : score >= 40 ? 'Steady 💪' : 'Needs push ⚡';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ - (score/100)*circ} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Outfit', fontSize: size*0.26, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: size*0.1, color: 'var(--text-muted)', marginTop: 2 }}>score</span>
      </div>
      <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );
}

// ── Category colours ───────────────────────────────────────────
const catColor = { learning: '#3b82f6', career: '#6366f1', fitness: '#10b981', business: '#f59e0b', personal: '#06b6d4' };

// ════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const isMobile = useMobile();
  const [goals, setGoals] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [g, t, n] = await Promise.all([
          api.get('/goals'), api.get('/tasks/today'), api.get('/nudges'),
        ]);
        setGoals(g.data.goals || []);
        setTodayTasks(t.data.tasks || []);
        setNudges(n.data.nudges || []);
      } catch { toast.error('Failed to load dashboard.'); }
      finally { setLoading(false); }
    })();
  }, []);

  const completeTask = async (id) => {
    try {
      await api.patch(`/tasks/${id}/complete`);
      setTodayTasks(p => p.map(t => t._id === id ? { ...t, status: 'completed' } : t));
      toast.success('Task done! 🎉');
    } catch (err) { toast.error(err.response?.data?.message || 'Could not complete.'); }
  };

  const dismissNudge = async (id) => {
    try { await api.patch(`/nudges/${id}/dismiss`); setNudges(p => p.filter(n => n._id !== id)); }
    catch { /* silent */ }
  };

  const done    = todayTasks.filter(t => t.status === 'completed').length;
  const pending = todayTasks.filter(t => t.status === 'pending').length;
  const activeGoals = goals.filter(g => g.status === 'active');
  const avgMomentum = activeGoals.length
    ? Math.round(activeGoals.reduce((a, g) => a + g.momentumScore, 0) / activeGoals.length)
    : 0;
  const topTask = todayTasks.find(t => t.status === 'pending');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const progress = todayTasks.length ? Math.round((done / todayTasks.length) * 100) : 0;

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="loading-screen"><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      </main>
    </div>
  );

  // ── MOBILE LAYOUT ─────────────────────────────────────────────
  if (isMobile) return (
    <div className="app-layout">
      <Sidebar nudgeCount={nudges.length} />
      <main className="main-content" style={{ overflowX: 'hidden', boxSizing: 'border-box' }}>

        {/* Greeting row */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Sparkles size={13} color="var(--green)" />
            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>{dateStr}</span>
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>

        {/* Progress bar */}
        <div style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 14, padding: '14px 16px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Today's progress</span>
            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>{done}/{todayTasks.length} tasks</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gradient)', borderRadius: 99, boxShadow: '0 0 8px rgba(16,185,129,0.5)', transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
            {[
              { label: 'Goals', value: activeGoals.length, color: '#10b981' },
              { label: 'Pending', value: pending, color: '#f59e0b' },
              { label: 'Score', value: avgMomentum, color: '#34d399' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Nudge */}
        {nudges[0] && (
          <div style={{
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 12, padding: '12px 14px', marginBottom: 16,
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <Bell size={15} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, margin: 0, wordBreak: 'break-word' }}>
              {nudges[0].message}
            </p>
            <button onClick={() => dismissNudge(nudges[0]._id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, flexShrink: 0, padding: 0, lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Focus Now */}
        {topTask && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
            border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: '16px',
            marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={18} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Focus Now</div>
              <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{topTask.title}</div>
              {topTask.estimatedMinutes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>⏱ {topTask.estimatedMinutes} min</div>}
            </div>
            <button onClick={() => completeTask(topTask._id)} className="btn btn-primary btn-sm" style={{ flexShrink: 0, fontSize: 12, padding: '8px 12px' }}>
              Done <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* Tasks */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={15} color="var(--green)" /> Today's Tasks
            </h2>
            <Link to="/tasks" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              All <ChevronRight size={13} />
            </Link>
          </div>
          {todayTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>No tasks yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayTasks.slice(0, 5).map(task => (
                <div key={task._id}
                  className={`task-item${task.status === 'completed' ? ' completed' : ''}`}
                  onClick={() => task.status === 'pending' && completeTask(task._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`task-check${task.status === 'completed' ? ' checked' : ''}`}>
                    {task.status === 'completed' && <CheckCircle size={11} color="white" />}
                  </div>
                  <span className="task-title" style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                  {task.estimatedMinutes && <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{task.estimatedMinutes}m</span>}
                </div>
              ))}
              {todayTasks.length > 5 && (
                <Link to="/tasks" style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '6px', textDecoration: 'none' }}>
                  +{todayTasks.length - 5} more →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Goals compact */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={15} color="var(--green)" /> Active Goals
            </h2>
            <Link to="/goals" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
              All <ChevronRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeGoals.slice(0, 3).map(goal => {
              const color = catColor[goal.category] || '#10b981';
              return (
                <Link key={goal._id} to={`/goals/${goal._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                    borderLeft: `3px solid ${color}`, borderRadius: '0 12px 12px 0',
                    padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.title}</div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 99, marginTop: 6, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(goal.momentumScore,100)}%`, background: color, borderRadius: 99 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>{goal.momentumScore}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Link to="/journal" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}><BookOpen size={14} /> Journal</Link>
          <Link to="/goals/new" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}><Plus size={14} /> New Goal</Link>
        </div>

      </main>
    </div>
  );

  // ── DESKTOP LAYOUT ────────────────────────────────────────────
  return (
    <div className="app-layout">
      <div className="bg-orbs" style={{ opacity: 0.08 }}><div className="orb orb-1" /><div className="orb orb-2" /></div>
      <Sidebar nudgeCount={nudges.length} />
      <main className="main-content">

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.06) 100%)',
          border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20,
          padding: '28px 32px', marginBottom: 20, backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Sparkles size={16} color="var(--green)" />
              <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>{dateStr}</span>
            </div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: 28, fontWeight: 800, marginBottom: 10, lineHeight: 1.2 }}>
              {greeting}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Today's progress</span>
                <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>{done}/{todayTasks.length} tasks</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--gradient)', borderRadius: 99, transition: 'width 0.8s ease', boxShadow: '0 0 10px rgba(16,185,129,0.5)' }} />
              </div>
            </div>

            {/* Inline stats row inside hero */}
            <div style={{
              display: 'flex', gap: 0,
              marginBottom: 18,
              background: 'rgba(0,0,0,0.15)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.07)',
              overflow: 'hidden',
            }}>
              {[
                { label: 'Active Goals',  value: activeGoals.length,             color: '#10b981' },
                { label: 'Done Today',    value: `${done}/${todayTasks.length}`, color: '#34d399' },
                { label: 'Momentum',      value: avgMomentum,                    color: '#f59e0b' },
                { label: 'Pending',       value: pending,                        color: '#06b6d4' },
              ].map(({ label, value, color }, i, arr) => (
                <div key={label} style={{
                  flex: 1, padding: '10px 0', textAlign: 'center',
                  borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}>
                  <div style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/journal" className="btn btn-ghost btn-sm"><BookOpen size={14} /> Journal</Link>
              <Link to="/goals/new" className="btn btn-primary btn-sm"><Plus size={14} /> New Goal</Link>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingBottom: 24 }}>
            <ArcRing score={avgMomentum} size={110} />
          </div>
        </div>

        {/* Nudge */}
        {nudges[0] && (
          <div className="nudge-banner" style={{ marginBottom: 20 }}>
            <div className="nudge-icon"><Bell size={16} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="nudge-message"><strong>{nudges[0].type === 'warning' ? '⚠️ ' : '💡 '}</strong>{nudges[0].message}</p>
            </div>
            <button onClick={() => dismissNudge(nudges[0]._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, padding: 4 }}>×</button>
          </div>
        )}

        {/* Focus card */}
        {topTask && (
          <div style={{
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 16, padding: '20px 24px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}>
              <Zap size={20} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Focus Now</div>
              <div style={{ fontSize: 16, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{topTask.title}</div>
              {topTask.estimatedMinutes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>⏱ {topTask.estimatedMinutes} min</div>}
            </div>
            <button onClick={() => completeTask(topTask._id)} className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
              Mark Done <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* Two-column */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>

          {/* Tasks */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={16} color="var(--green)" /> Today's Tasks
              </h2>
              <Link to="/tasks" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>All <ChevronRight size={13} /></Link>
            </div>
            {todayTasks.length === 0 ? (
              <div className="card empty-state" style={{ padding: 36 }}>
                <div className="empty-icon"><CheckCircle size={22} /></div>
                <div className="empty-title" style={{ fontSize: 15 }}>No tasks yet</div>
                <Link to="/tasks" className="btn btn-primary btn-sm"><Zap size={13} /> Generate</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayTasks.slice(0, 6).map(task => (
                  <div key={task._id}
                    className={`task-item${task.status === 'completed' ? ' completed' : ''}`}
                    onClick={() => task.status === 'pending' && completeTask(task._id)}
                  >
                    <div className={`task-check${task.status === 'completed' ? ' checked' : ''}`}>
                      {task.status === 'completed' && <CheckCircle size={11} color="white" />}
                    </div>
                    <span className="task-title">{task.title}</span>
                    {task.estimatedMinutes && <span className="task-time"><Clock size={11} />{task.estimatedMinutes}m</span>}
                  </div>
                ))}
                {todayTasks.length > 6 && (
                  <Link to="/tasks" style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0', textDecoration: 'none' }}>
                    +{todayTasks.length - 6} more tasks →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Goals */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={16} color="var(--green)" /> Active Goals
              </h2>
              <Link to="/goals" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>All <ChevronRight size={13} /></Link>
            </div>
            {activeGoals.length === 0 ? (
              <div className="card empty-state" style={{ padding: 36 }}>
                <div className="empty-title" style={{ fontSize: 15 }}>No active goals</div>
                <Link to="/goals/new" className="btn btn-primary btn-sm"><Plus size={13} /> Create Goal</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeGoals.slice(0, 4).map(goal => {
                  const color = catColor[goal.category] || '#10b981';
                  const pct = Math.min(goal.momentumScore, 100);
                  return (
                    <Link key={goal._id} to={`/goals/${goal._id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                        borderLeft: `3px solid ${color}`, borderRadius: '0 14px 14px 0',
                        padding: '14px 18px', transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, paddingRight: 8 }}>{goal.title}</div>
                          <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>{pct}%</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, boxShadow: `0 0 6px ${color}80` }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <TrendingUp size={11} /> {goal.category}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
