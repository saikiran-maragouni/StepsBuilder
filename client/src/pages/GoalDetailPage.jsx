import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import RoadmapFlow from '../components/RoadmapFlow';
import {
  ArrowLeft, RefreshCw, TrendingUp, CheckCircle, Clock,
  Layers, MapPin, ChevronDown, ChevronUp, Calendar,
  Map, List, Circle, PlayCircle
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Given a phase's steps, classify the phase status */
const phaseStatus = (steps) => {
  if (!steps?.length) return 'not-started';
  if (steps.every(s => s.status === 'completed')) return 'completed';
  if (steps.some(s => s.status === 'in-progress' || s.status === 'completed')) return 'in-progress';
  return 'not-started';
};

/** Compute estimated start/end dates for each phase from today */
const computePhaseDates = (phases) => {
  const dates = [];
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const phase of phases) {
    const totalDays = phase.steps.reduce((acc, s) => acc + (s.estimatedDays || 7), 0);
    const start = new Date(cursor);
    const end = new Date(cursor);
    end.setDate(end.getDate() + totalDays - 1);
    dates.push({ start, end, totalDays });
    cursor.setDate(cursor.getDate() + totalDays);
  }
  return dates;
};

const fmtDate = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const STATUS_CONFIG = {
  completed:   { color: 'var(--success)',  bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  label: 'Done',        icon: CheckCircle },
  'in-progress': { color: 'var(--indigo)', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', label: 'In Progress', icon: PlayCircle },
  'not-started': { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)', border: 'var(--border)', label: 'Not Started', icon: Circle },
};

// ── Step Row ──────────────────────────────────────────────────────────────────

function StepRow({ step, isActive, goalId, onUpdated }) {
  const [updating, setUpdating] = useState(false);
  const toast = useToast();
  const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG['not-started'];
  const Icon = cfg.icon;

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await api.patch(`/goals/${goalId}/roadmap/steps/${step._id}`, { status });
      onUpdated();
      toast.success(`Step marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update step.');
    } finally { setUpdating(false); }
  };

  return (
    <div style={{
      padding: '16px 20px',
      background: isActive ? 'rgba(99,102,241,0.06)' : 'transparent',
      borderLeft: `3px solid ${isActive ? 'var(--indigo)' : cfg.color}`,
      borderRadius: '0 var(--radius-md) var(--radius-md) 0',
      marginBottom: 8,
      transition: 'var(--transition)',
      opacity: updating ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Status icon */}
        <div style={{ marginTop: 2, flexShrink: 0 }}>
          <Icon size={18} color={cfg.color} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {step.title}
            </span>
            {isActive && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: 'var(--indigo)',
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 'var(--radius-full)', padding: '2px 8px', letterSpacing: '0.04em',
              }}>
                📍 YOU ARE HERE
              </span>
            )}
          </div>

          {step.description && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
              {step.description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> ~{step.estimatedDays || 7} days
            </span>
            {step.startedAt && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Started {new Date(step.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {step.completedAt && (
              <span style={{ fontSize: 12, color: 'var(--success)' }}>
                ✓ Done {new Date(step.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexWrap: 'wrap' }}>
              {step.status !== 'in-progress' && step.status !== 'completed' && (
                <button onClick={() => updateStatus('in-progress')} disabled={updating}
                  className="btn btn-ghost btn-sm" style={{ fontSize: 12, padding: '4px 10px' }}>
                  <PlayCircle size={12} /> Start
                </button>
              )}
              {step.status !== 'completed' && (
                <button onClick={() => updateStatus('completed')} disabled={updating}
                  className="btn btn-success btn-sm" style={{ fontSize: 12, padding: '4px 10px' }}>
                  <CheckCircle size={12} /> Done
                </button>
              )}
              {step.status !== 'not-started' && (
                <button onClick={() => updateStatus('not-started')} disabled={updating}
                  className="btn btn-ghost btn-sm" style={{ fontSize: 12, padding: '4px 10px', opacity: 0.6 }}>
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Phase Accordion ───────────────────────────────────────────────────────────

function PhaseAccordion({ phase, phaseIndex, phaseDates, activeStepId, goalId, onUpdated, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const status = phaseStatus(phase.steps);
  const cfg = STATUS_CONFIG[status];
  const completedCount = phase.steps.filter(s => s.status === 'completed').length;
  const total = phase.steps.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const dates = phaseDates?.[phaseIndex];

  return (
    <div style={{
      border: `1px solid ${cfg.border}`,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: 12,
      background: cfg.bg,
      transition: 'var(--transition)',
    }}>
      {/* Phase Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {/* Phase number circle */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: cfg.color, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 13, fontWeight: 800,
          color: 'white', flexShrink: 0,
        }}>
          {phaseIndex + 1}
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              {phase.title}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: cfg.color,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {cfg.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {completedCount}/{total} steps
            </span>
            {dates && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={11} />
                {fmtDate(dates.start)} – {fmtDate(dates.end)}
              </span>
            )}
          </div>
        </div>

        {/* Progress + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: cfg.color, fontFamily: 'Outfit' }}>
              {pct}%
            </div>
          </div>
          {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </button>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', margin: '0 20px' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: cfg.color, borderRadius: 'var(--radius-full)',
          transition: 'width 0.6s var(--ease)',
        }} />
      </div>

      {/* Steps */}
      {open && (
        <div style={{ padding: '16px 20px 12px' }}>
          {phase.steps.map((step) => (
            <StepRow
              key={step._id}
              step={step}
              isActive={step._id === activeStepId}
              goalId={goalId}
              onUpdated={onUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GoalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [goal, setGoal] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [view, setView] = useState('map'); // 'timeline' | 'map'

  const load = async () => {
    try {
      const [goalRes, roadmapRes] = await Promise.all([
        api.get(`/goals/${id}`),
        api.get(`/goals/${id}/roadmap`),
      ]);
      setGoal(goalRes.data.goal);
      setRoadmap(roadmapRes.data.roadmap);
    } catch {
      toast.error('Goal not found.');
      navigate('/goals');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const { data } = await api.patch(`/goals/${id}/roadmap/regenerate`);
      setRoadmap(data.roadmap);
      toast.success('Roadmap regenerated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Regeneration failed.');
    } finally { setRegenerating(false); }
  };

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="loading-screen">
          <div className="spinner" style={{ width: 40, height: 40 }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading roadmap…</span>
        </div>
      </main>
    </div>
  );

  const totalSteps = roadmap?.phases?.reduce((a, p) => a + p.steps.length, 0) || 0;
  const completedSteps = roadmap?.phases?.reduce((a, p) => a + p.steps.filter(s => s.status === 'completed').length, 0) || 0;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Find the active step (first in-progress, or first not-started if none)
  let activeStepId = null;
  let activePhaseIndex = -1;
  if (roadmap?.phases) {
    outer: for (let pi = 0; pi < roadmap.phases.length; pi++) {
      for (const step of roadmap.phases[pi].steps) {
        if (step.status === 'in-progress') { activeStepId = step._id; activePhaseIndex = pi; break outer; }
      }
    }
    if (!activeStepId) {
      outer2: for (let pi = 0; pi < roadmap.phases.length; pi++) {
        for (const step of roadmap.phases[pi].steps) {
          if (step.status === 'not-started') { activeStepId = step._id; activePhaseIndex = pi; break outer2; }
        }
      }
    }
  }

  const phaseDates = roadmap?.phases ? computePhaseDates(roadmap.phases) : [];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">

        {/* Back button */}
        <Link to="/goals" className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
          <ArrowLeft size={15} /> All Goals
        </Link>

        {/* ── Header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, flex: 1, minWidth: 0, fontFamily: 'Outfit' }}>
              {goal?.title}
            </h1>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <span className={`badge badge-${goal?.status === 'active' ? 'success' : 'warning'}`}>{goal?.status}</span>
              <span className="badge badge-indigo" style={{ textTransform: 'capitalize' }}>{goal?.category}</span>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {goal?.timeframe} · {completedSteps}/{totalSteps} steps · {progressPct}% complete
            {activePhaseIndex >= 0 && (
              <span style={{ color: 'var(--indigo)', marginLeft: 8 }}>
                · Currently in Phase {activePhaseIndex + 1}
              </span>
            )}
          </p>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ marginBottom: 24 }}>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{completedSteps} steps completed</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo)' }}>{progressPct}%</span>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid-4" style={{ marginBottom: 28, gap: 12 }}>
          {[
            { label: 'Momentum', value: `${goal?.momentumScore || 0}/100`, icon: TrendingUp, color: 'var(--warning)' },
            { label: 'Phases', value: roadmap?.phases?.length || 0, icon: Layers, color: 'var(--indigo)' },
            { label: 'Steps Done', value: completedSteps, icon: CheckCircle, color: 'var(--success)' },
            { label: 'Remaining', value: totalSteps - completedSteps, icon: MapPin, color: 'var(--cyan)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="stat-icon" style={{ background: `${color}1a`, color, width: 34, height: 34 }}>
                <Icon size={16} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: 'Outfit' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar: View Toggle + Regenerate ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap', rowGap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Roadmap</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View toggle */}
            <div style={{
              display: 'flex', background: 'var(--glass-bg)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 3,
            }}>
              {[
                { key: 'timeline', icon: List,  label: 'Timeline' },
                { key: 'map',      icon: Map,   label: 'Visual Map' },
              ].map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setView(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 'calc(var(--radius-md) - 1px)',
                    border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    transition: 'var(--transition)',
                    background: view === key ? 'var(--gradient)' : 'transparent',
                    color: view === key ? 'white' : 'var(--text-muted)',
                    boxShadow: view === key ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                  }}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>

            <button onClick={regenerate} className="btn btn-ghost btn-sm" disabled={regenerating}>
              <RefreshCw size={13} className={regenerating ? 'spin' : ''} />
              <span className="hide-xs">{regenerating ? 'Regenerating…' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* ── Content: Timeline or Visual Map ── */}
        {!roadmap?.phases?.length ? (
          <div className="card empty-state">
            <div className="empty-title">No roadmap yet</div>
            <button onClick={regenerate} className="btn btn-primary btn-sm">
              <RefreshCw size={14} /> Generate Roadmap
            </button>
          </div>
        ) : view === 'timeline' ? (
          <div>
            {/* Active step banner */}
            {activeStepId && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 18px', marginBottom: 20,
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 'var(--radius-md)', fontSize: 13,
              }}>
                <MapPin size={15} color="var(--indigo)" />
                <span style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Currently working on:</strong>{' '}
                  {roadmap.phases.flatMap(p => p.steps).find(s => s._id === activeStepId)?.title}
                </span>
              </div>
            )}

            {roadmap.phases.map((phase, pi) => (
              <PhaseAccordion
                key={phase._id || pi}
                phase={phase}
                phaseIndex={pi}
                phaseDates={phaseDates}
                activeStepId={activeStepId}
                goalId={id}
                onUpdated={load}
                defaultOpen={pi === activePhaseIndex || pi === 0}
              />
            ))}
          </div>
        ) : (
          /* Visual Map (React Flow) */
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Map size={13} /> Click any step node to update its status
            </div>
            <RoadmapFlow phases={roadmap.phases} onStepClick={(step, phase) => {
              // For the map view, use a simple inline update via toast prompts
              toast.info(`Use Timeline view to update "${step.title}"`);
            }} />
          </div>
        )}

      </main>
    </div>
  );
}
