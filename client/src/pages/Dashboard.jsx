import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import { CheckCircle, Circle, Clock, Target, Flame, BookOpen, Plus, TrendingUp, Bell, ChevronRight, Zap } from 'lucide-react';

// Momentum Ring SVG component
function MomentumRing({ score, size = 80 }) {
  const radius = (size - 10) / 2;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 100) * circ;
  const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="momentum-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circ} strokeDashoffset={circ - fill} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="momentum-value" style={{ fontSize: size * 0.22, color }}>{score}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [goalsRes, tasksRes, nudgesRes] = await Promise.all([
          api.get('/goals'),
          api.get('/tasks/today'),
          api.get('/nudges'),
        ]);
        setGoals(goalsRes.data.goals || []);
        setTodayTasks(tasksRes.data.tasks || []);
        setNudges(nudgesRes.data.nudges || []);
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const completeTask = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/complete`);
      setTodayTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, status: 'completed' } : t));
      toast.success('Task completed! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not complete task.');
    }
  };

  const dismissNudge = async (nudgeId) => {
    try {
      await api.patch(`/nudges/${nudgeId}/dismiss`);
      setNudges((prev) => prev.filter((n) => n._id !== nudgeId));
    } catch { /* silent */ }
  };

  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;
  const pendingCount = todayTasks.filter((t) => t.status === 'pending').length;
  const avgMomentum = goals.length > 0 ? Math.round(goals.reduce((a, g) => a + g.momentumScore, 0) / goals.length) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content"><div className="loading-screen"><div className="spinner" style={{ width: 40, height: 40 }} /><p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p></div></main>
    </div>
  );

  return (
    <div className="app-layout">
      <div className="bg-orbs" style={{ opacity: 0.06 }}><div className="orb orb-1" /><div className="orb orb-2" /></div>
      <Sidebar nudgeCount={nudges.length} />
      <main className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <h1 className="topbar-title">{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="topbar-sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/journal" className="btn btn-ghost btn-sm"><BookOpen size={15} /> Journal</Link>
            <Link to="/goals/new" className="btn btn-primary btn-sm"><Plus size={15} /> New Goal</Link>
          </div>
        </div>

        {/* Nudge banners */}
        {nudges.slice(0, 2).map((nudge) => (
          <div key={nudge._id} className="nudge-banner" style={{ marginBottom: 16 }}>
            <div className="nudge-icon"><Bell size={18} /></div>
            <div style={{ flex: 1 }}>
              <p className="nudge-message"><strong>{nudge.type === 'encouragement' ? '💪 ' : nudge.type === 'warning' ? '⚠️ ' : '💡 '}</strong>{nudge.message}</p>
            </div>
            <button onClick={() => dismissNudge(nudge._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
          </div>
        ))}

        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'Active Goals', value: goals.filter(g => g.status === 'active').length, icon: Target, color: 'var(--blue)' },
            { label: 'Tasks Today', value: `${completedCount}/${todayTasks.length}`, icon: CheckCircle, color: 'var(--success)' },
            { label: 'Avg Momentum', value: avgMomentum, icon: Flame, color: 'var(--warning)' },
            { label: 'Pending Tasks', value: pendingCount, icon: Clock, color: 'var(--cyan)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card stat-card" style={{ padding: '20px 22px' }}>
              <div className="stat-icon" style={{ background: `${color}1a`, color }}><Icon size={20} /></div>
              <div className="stat-value" style={{ color, fontSize: 36 }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Two-column layout — responsive */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {/* Today's tasks */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Today's Tasks</h2>
              <Link to="/tasks" className="btn btn-ghost btn-sm">View all <ChevronRight size={14} /></Link>
            </div>

            {todayTasks.length === 0 ? (
              <div className="card empty-state" style={{ padding: 40 }}>
                <div className="empty-icon"><CheckCircle size={28} /></div>
                <div className="empty-title">No tasks yet</div>
                <div className="empty-sub">Generate today's tasks from your active goals</div>
                <Link to="/tasks" className="btn btn-primary btn-sm"><Zap size={14} /> Generate Tasks</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {todayTasks.map((task) => (
                  <div key={task._id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                    <div className={`priority-dot priority-${task.priority}`} />
                    <div onClick={() => task.status === 'pending' && completeTask(task._id)}
                      className={`task-check ${task.status === 'completed' ? 'checked' : ''}`}>
                      {task.status === 'completed' && <CheckCircle size={12} color="white" />}
                    </div>
                    <span className="task-title">{task.title}</span>
                    {task.estimatedMinutes && (
                      <span className="task-time"><Clock size={12} />{task.estimatedMinutes}m</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active goals */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Active Goals</h2>
              <Link to="/goals" className="btn btn-ghost btn-sm">All <ChevronRight size={14} /></Link>
            </div>

            {goals.filter(g => g.status === 'active').length === 0 ? (
              <div className="card empty-state" style={{ padding: 32 }}>
                <div className="empty-title" style={{ fontSize: 15 }}>No active goals</div>
                <Link to="/goals/new" className="btn btn-primary btn-sm"><Plus size={14} /> Create Goal</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {goals.filter(g => g.status === 'active').slice(0, 4).map((goal) => (
                  <Link key={goal._id} to={`/goals/${goal._id}`} className={`card cat-${goal.category}`}
                    style={{ padding: '16px 18px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div className="cat-bar" style={{ height: 40 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TrendingUp size={12} color="var(--text-muted)" />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{goal.momentumScore}/100</span>
                      </div>
                    </div>
                    <MomentumRing score={goal.momentumScore} size={52} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
