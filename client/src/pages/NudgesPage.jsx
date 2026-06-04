import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import { Bell, BellOff, MessageSquare, Lightbulb, AlertTriangle, Heart } from 'lucide-react';

const typeConfig = {
  suggestion: { icon: Lightbulb, color: 'var(--indigo)', label: 'Suggestion' },
  warning: { icon: AlertTriangle, color: 'var(--warning)', label: 'Check-In' },
  encouragement: { icon: Heart, color: 'var(--success)', label: 'Encouragement' },
  breakdown: { icon: MessageSquare, color: 'var(--cyan)', label: 'Step Breakdown' },
};

export default function NudgesPage() {
  const toast = useToast();
  const [nudges, setNudges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/nudges').then(({ data }) => setNudges(data.nudges || [])).catch(() => toast.error('Failed to load nudges.')).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/nudges/${id}/read`);
      setNudges((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
  };

  const dismiss = async (id) => {
    try {
      await api.patch(`/nudges/${id}/dismiss`);
      setNudges((prev) => prev.filter((n) => n._id !== id));
    } catch { toast.error('Failed to dismiss nudge.'); }
  };

  const unread = nudges.filter((n) => !n.isRead);
  const read = nudges.filter((n) => n.isRead);

  return (
    <div className="app-layout">
      <Sidebar nudgeCount={unread.length} />
      <main className="main-content">
        <div className="topbar">
          <div>
            <h1 className="topbar-title">AI Nudges</h1>
            <p className="topbar-sub">{unread.length} unread · {nudges.length} total</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto', width: 36, height: 36 }} /></div>
        ) : nudges.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon"><BellOff size={28} /></div>
            <div className="empty-title">No nudges yet</div>
            <div className="empty-sub">Gemini monitors your progress and sends smart nudges when you need them. Keep working on your goals!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {nudges.map((nudge) => {
              const { icon: Icon, color, label } = typeConfig[nudge.type] || typeConfig.suggestion;
              return (
                <div key={nudge._id} className="card" style={{ padding: '20px 24px', borderLeft: `3px solid ${color}`, opacity: nudge.isRead ? 0.65 : 1 }}
                  onClick={() => !nudge.isRead && markRead(nudge._id)}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }}>
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span className={`badge`} style={{ background: `${color}1a`, color, border: `1px solid ${color}33` }}>{label}</span>
                        {!nudge.isRead && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--indigo)', flexShrink: 0 }} />}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {new Date(nudge.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{nudge.message}</p>

                      {nudge.suggestBreakdown && nudge.newSteps?.length > 0 && (
                        <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Suggested Micro-steps</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {nudge.newSteps.map((step, i) => (
                              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${color}1a`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{step.title}</div>
                                  {step.estimatedMinutes && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>~{step.estimatedMinutes} min</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); dismiss(nudge._id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, alignSelf: 'flex-start', fontSize: 18 }}>×</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
