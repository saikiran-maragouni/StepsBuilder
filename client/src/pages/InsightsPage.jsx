import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import { BarChart2, TrendingUp, Flame, Target, RefreshCw, ChevronRight, Sparkles } from 'lucide-react';

function SparklineBar({ value, max = 10 }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
      <div style={{ height: 48, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{ width: '60%', height: `${pct}%`, minHeight: pct > 0 ? 4 : 0, background: 'var(--gradient)', borderRadius: '3px 3px 0 0', transition: 'height 0.6s var(--ease)' }} />
      </div>
    </div>
  );
}

function MomentumRing({ score, size = 72 }) {
  const radius = (size - 8) / 2;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 100) * circ;
  const color = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ - fill} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', fontFamily: 'Outfit', fontWeight: 800, fontSize: size * 0.23, color }}>{score}</div>
    </div>
  );
}

export default function InsightsPage() {
  const toast = useToast();
  const [weekly, setWeekly] = useState(null);
  const [goals, setGoals] = useState([]);
  const [goalInsights, setGoalInsights] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const load = async () => {
    try {
      const [weeklyRes, goalsRes] = await Promise.all([
        api.get('/insights/weekly'),
        api.get('/goals'),
      ]);
      setWeekly(weeklyRes.data);
      setGoals(goalsRes.data.goals || []);
    } catch { toast.error('Failed to load insights.'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const loadGoalInsight = async (goalId) => {
    if (goalInsights[goalId]) { setSelectedGoal(goalId); return; }
    try {
      const { data } = await api.get(`/insights/goal/${goalId}`);
      setGoalInsights((prev) => ({ ...prev, [goalId]: data }));
      setSelectedGoal(goalId);
    } catch { toast.error('Failed to load goal insights.'); }
  };

  useEffect(() => { load(); }, []);

  const refresh = () => { setRefreshing(true); load(); };

  if (loading) return <div className="app-layout"><Sidebar /><main className="main-content"><div className="loading-screen"><div className="spinner" style={{ width: 40, height: 40 }} /></div></main></div>;

  const ins = weekly?.insights;
  const goalsActive = goals.filter(g => g.status === 'active');

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <div>
            <h1 className="topbar-title">Insights</h1>
            <p className="topbar-sub">Your weekly performance snapshot</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {!ins ? (
          <div className="card empty-state">
            <div className="empty-icon"><BarChart2 size={28} /></div>
            <div className="empty-title">No insights yet</div>
            <div className="empty-sub">Complete tasks and journal entries to see your weekly insights.</div>
          </div>
        ) : (
          <>
            {/* Weekly stats row */}
            <div className="grid-4" style={{ marginBottom: 28 }}>
              {[
                { label: 'Tasks This Week', value: ins.totalTasksCompleted, icon: Target, color: 'var(--success)' },
                { label: 'Journal Entries', value: ins.journalEntriesCount, icon: BarChart2, color: 'var(--indigo)' },
                { label: 'Active Goals', value: goalsActive.length, icon: TrendingUp, color: 'var(--violet)' },
                { label: 'Best Streak', value: `${Math.max(0, ...(ins.streaks?.map(s => s.streak) || [0]))}d`, icon: Flame, color: 'var(--warning)' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card stat-card" style={{ padding: '20px 22px' }}>
                  <div className="stat-icon" style={{ background: `${color}1a`, color, width: 38, height: 38 }}><Icon size={18} /></div>
                  <div className="stat-value" style={{ color }}>{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>

            {/* AI Narrative */}
            {ins.narrative && (
              <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Sparkles size={18} color="var(--indigo)" />
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Gemini's Weekly Summary</h3>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{ins.narrative}</p>
                {ins.topRecommendation && (
                  <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--gradient-soft)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-md)', fontSize: 14, color: 'var(--indigo)', fontWeight: 500 }}>
                    💡 {ins.topRecommendation}
                  </div>
                )}
              </div>
            )}

            {/* Goal momentum grid */}
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Per-Goal Breakdown</h2>
            <div className="grid-2" style={{ marginBottom: 28 }}>
              {goalsActive.map((goal) => {
                const streak = ins.streaks?.find(s => s.goalId === goal._id.toString())?.streak || 0;
                const gi = goalInsights[goal._id];
                return (
                  <div key={goal._id} className="card" style={{ padding: '20px 22px', cursor: 'pointer' }} onClick={() => loadGoalInsight(goal._id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <MomentumRing score={goal.momentumScore} size={64} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{goal.title}</div>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ fontSize: 12, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 4 }}><Flame size={11} /> {streak}d streak</span>
                          <span style={{ fontSize: 12, color: 'var(--indigo)', textTransform: 'capitalize' }}>{goal.category}</span>
                        </div>
                        {gi && (
                          <div style={{ marginTop: 8 }}>
                            <div className="progress-bar" style={{ height: 4 }}>
                              <div className="progress-fill" style={{ width: `${gi.progress?.progressPercent || 0}%` }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{gi.progress?.progressPercent || 0}% complete · {gi.streak || 0}d streak</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected goal drill-down */}
            {selectedGoal && goalInsights[selectedGoal] && (() => {
              const gi = goalInsights[selectedGoal];
              const days = Object.entries(gi.dailyActivity || {}).slice(-7);
              const maxVal = Math.max(1, ...days.map(([, v]) => v));
              return (
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{gi.goal?.title}</h3>
                    <button onClick={() => setSelectedGoal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}>×</button>
                  </div>
                  <div className="grid-3" style={{ marginBottom: 20 }}>
                    <div><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)', fontFamily: 'Outfit' }}>{gi.tasks?.completedTasks || 0}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tasks Completed</div></div>
                    <div><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--warning)', fontFamily: 'Outfit' }}>{gi.streak || 0}d</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current Streak</div></div>
                    <div><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--indigo)', fontFamily: 'Outfit' }}>{gi.progress?.progressPercent || 0}%</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Roadmap Done</div></div>
                  </div>
                  {days.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Last 7 Days Activity</div>
                      <div style={{ display: 'flex', gap: 4, height: 64, alignItems: 'flex-end' }}>
                        {days.map(([date, count]) => (
                          <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: '100%', height: `${(count / maxVal) * 48}px`, minHeight: count > 0 ? 4 : 0, background: 'var(--gradient)', borderRadius: '3px 3px 0 0', transition: 'height 0.6s var(--ease)' }} />
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </>
        )}
      </main>
    </div>
  );
}
