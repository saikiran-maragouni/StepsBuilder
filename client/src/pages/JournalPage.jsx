import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import {
  BookOpen, Send, CheckCircle, ChevronDown, ChevronUp,
  Sparkles, Pencil, X, Save, Lock
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns true if the entry's date is today (UTC day comparison) */
const isToday = (dateStr) => {
  const entryDate = new Date(dateStr);
  const now = new Date();
  return (
    entryDate.getUTCFullYear() === now.getUTCFullYear() &&
    entryDate.getUTCMonth()    === now.getUTCMonth()    &&
    entryDate.getUTCDate()     === now.getUTCDate()
  );
};

// ── EntryCard ─────────────────────────────────────────────────────────────────

function EntryCard({ entry, onConfirm, onUpdate }) {
  const [expanded,   setExpanded]   = useState(false);
  const [editing,    setEditing]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [draft,      setDraft]      = useState(entry.rawText);
  const textareaRef = useRef(null);

  const toast     = useToast();
  const ai        = entry.aiInterpretation;
  const editable  = isToday(entry.date) && !entry.isConfirmed;
  const hasMappings = ai?.goalMappings?.length > 0;

  const levelColor = {
    low: 'var(--danger)', medium: 'var(--warning)', high: 'var(--success)',
  }[ai?.productivityLevel] || 'var(--text-muted)';

  // Auto-focus textarea when edit mode opens
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(draft.length, draft.length);
    }
  }, [editing]);

  const startEdit = () => {
    setDraft(entry.rawText);
    setEditing(true);
    if (!expanded) setExpanded(true);
  };

  const cancelEdit = () => {
    setDraft(entry.rawText);
    setEditing(false);
  };

  const saveEdit = async () => {
    if (draft.trim().length < 10) return toast.error('Entry must be at least 10 characters.');
    if (draft.trim() === entry.rawText) { setEditing(false); return; }
    setSaving(true);
    try {
      const { data } = await api.put(`/journal/${entry._id}`, { rawText: draft.trim() });
      onUpdate(data.entry);
      setEditing(false);
      toast.success(data.entry.aiProcessed
        ? '✏️ Entry updated & re-interpreted by AI!'
        : '✏️ Entry saved. AI re-interpretation in progress.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save edits.';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    await onConfirm(entry._id);
    setConfirming(false);
  };

  return (
    <div className="card" style={{ padding: '20px 24px', transition: 'var(--transition)' }}>

      {/* ── Header row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-md)',
          background: editable ? 'var(--gradient-soft)' : 'rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          border: `1px solid ${editable ? 'rgba(99,102,241,0.2)' : 'var(--border)'}`,
        }}>
          {editable ? <BookOpen size={20} color="var(--blue)" /> : <Lock size={18} color="var(--text-muted)" />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Date + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>

            {/* Today badge */}
            {isToday(entry.date) && (
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--blue)', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                Today
              </span>
            )}

            {/* Productivity level */}
            {ai?.productivityLevel && (
              <span style={{ fontSize: 11, fontWeight: 700, color: levelColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {ai.productivityLevel} day
              </span>
            )}

            {/* State badges */}
            {entry.isConfirmed && <span className="badge badge-success" style={{ fontSize: 10 }}>✓ Confirmed</span>}
            {!entry.isConfirmed && entry.aiProcessed && hasMappings && (
              <span className="badge badge-indigo" style={{ fontSize: 10 }}><Sparkles size={9} /> AI Ready</span>
            )}
            {!entry.isConfirmed && entry.aiProcessed && !hasMappings && (
              <span className="badge" style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>No goal matches</span>
            )}
            {!entry.aiProcessed && (
              <span className="badge" style={{ fontSize: 10, background: 'rgba(245,158,11,0.12)', color: 'var(--warning)' }}>⏳ Processing…</span>
            )}
            {!editable && !entry.isConfirmed && (
              <span className="badge" style={{ fontSize: 10, background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Lock size={8} /> Locked
              </span>
            )}
          </div>

          {/* Raw text preview (not in edit mode) */}
          {!editing && (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {entry.rawText.substring(0, expanded ? undefined : 160)}
              {!expanded && entry.rawText.length > 160 ? '…' : ''}
            </p>
          )}
        </div>

        {/* Right-side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {editable && !editing && (
            <button
              onClick={startEdit}
              className="btn btn-ghost btn-icon"
              title="Edit today's entry"
              style={{ width: 32, height: 32, padding: 6 }}
            >
              <Pencil size={14} />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn btn-ghost btn-icon"
            style={{ width: 32, height: 32, padding: 6 }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* ── Inline Edit Mode ── */}
      {editing && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            position: 'relative',
            background: 'rgba(99,102,241,0.04)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 2,
          }}>
            <textarea
              ref={textareaRef}
              className="input"
              style={{
                minHeight: 140,
                resize: 'vertical',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--text-primary)',
              }}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={saving}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {draft.length} chars · Saving will re-run AI interpretation
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={cancelEdit} className="btn btn-ghost btn-sm" disabled={saving}>
                <X size={13} /> Cancel
              </button>
              <button onClick={saveEdit} className="btn btn-primary btn-sm" disabled={saving || draft.trim().length < 10}>
                {saving
                  ? <><span className="spinner" style={{ width: 13, height: 13 }} /> Re-interpreting…</>
                  : <><Save size={13} /> Save & Re-interpret</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded Details (AI interpretation + confirm) ── */}
      {expanded && !editing && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>

          {ai && hasMappings ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                AI Interpretation
              </div>
              {ai.goalMappings.map((m, i) => (
                <div key={i} style={{ background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{m.goalTitle || 'Goal'}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>+{m.progressPercent}%</span>
                  </div>
                  {m.activitiesMapped?.length > 0 && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.activitiesMapped.join(' · ')}</p>
                  )}
                </div>
              ))}
              {ai.untrackedActivities?.length > 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  <span style={{ fontWeight: 600 }}>Untracked:</span> {ai.untrackedActivities.join(', ')}
                </p>
              )}
            </>
          ) : ai && !hasMappings ? (
            <div style={{ padding: '12px 16px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Gemini didn't find a match to your active goals.
              {editable && ' Try editing your entry to be more specific about what you worked on.'}
            </div>
          ) : (
            <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--warning)', marginBottom: 12 }}>
              ⏳ AI is processing this entry. You can confirm it once ready.
            </div>
          )}

          {/* Confirm button */}
          {!entry.isConfirmed && (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="btn btn-success btn-sm"
              style={{ marginTop: 12 }}
            >
              {confirming
                ? <><span className="spinner" style={{ width: 13, height: 13 }} /> Confirming…</>
                : <><CheckCircle size={14} /> Confirm & Apply to Roadmap</>
              }
            </button>
          )}

          {/* Locked entry notice */}
          {!editable && !isToday(entry.date) && !entry.isConfirmed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              <Lock size={12} />
              This entry is from a past day — text editing is no longer available, but you can still confirm it.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main JournalPage ──────────────────────────────────────────────────────────

export default function JournalPage() {
  const toast = useToast();
  const [entries,    setEntries]    = useState([]);
  const [text,       setText]       = useState('');
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [charCount,  setCharCount]  = useState(0);

  // Check if today's entry already exists (show edit-existing instead of new-entry form)
  const todayEntry = entries.find((e) => isToday(e.date));

  useEffect(() => {
    api.get('/journal')
      .then(({ data }) => setEntries(data.entries || []))
      .catch(() => toast.error('Failed to load journal.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (text.trim().length < 10) return toast.error('Write at least a sentence or two.');
    setSubmitting(true);
    try {
      const { data } = await api.post('/journal', { rawText: text.trim() });
      setEntries((prev) => [data.entry, ...prev]);
      setText('');
      setCharCount(0);
      toast.success(data.entry.aiProcessed
        ? '🧠 AI has interpreted your entry!'
        : '📝 Entry saved! AI is interpreting…');
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("You already have an entry for today — edit it below.");
      } else {
        toast.error(err.response?.data?.message || 'Failed to save entry.');
      }
    } finally { setSubmitting(false); }
  };

  const confirmEntry = async (entryId) => {
    try {
      const { data } = await api.patch(`/journal/${entryId}/confirm`);
      setEntries((prev) => prev.map((e) =>
        e._id === entryId ? { ...e, isConfirmed: true, confirmedAt: new Date() } : e
      ));
      toast.success(data.message || 'Journal entry confirmed! 🚀');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm entry. Please try again.');
    }
  };

  const updateEntry = (updatedEntry) => {
    setEntries((prev) => prev.map((e) => e._id === updatedEntry._id ? updatedEntry : e));
  };

  const handleTextChange = (e) => { setText(e.target.value); setCharCount(e.target.value.length); };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="topbar">
          <div>
            <h1 className="topbar-title">Daily Journal</h1>
            <p className="topbar-sub">Write what you did — Gemini maps it to your goals</p>
          </div>
        </div>

        {/* ── New Entry Form (only show when no entry exists for today) ── */}
        {!todayEntry && (
          <div className="card" style={{ padding: 28, marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                No entry yet today
              </span>
            </div>

            <textarea
              id="journal-text"
              className="input"
              style={{ minHeight: 160, marginBottom: 16, resize: 'vertical' }}
              placeholder="What did you work on today? How did it go? What clicked or felt hard? Just write naturally — Gemini will figure out the rest…"
              value={text}
              onChange={handleTextChange}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: charCount > 50 ? 'var(--blue)' : 'var(--text-muted)' }}>
                {charCount} chars {charCount > 50 ? '· AI will interpret this' : '· Keep writing…'}
              </span>
              <button
                id="btn-submit-journal"
                className="btn btn-primary"
                onClick={submit}
                disabled={submitting || text.trim().length < 10}
              >
                {submitting
                  ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Interpreting…</>
                  : <><Send size={15} /> Save & Interpret</>
                }
              </button>
            </div>

            {submitting && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={16} color="var(--blue)" />
                Gemini is reading your entry and mapping activities to your goals…
              </div>
            )}
          </div>
        )}

        {/* ── Today's entry exists — show a subtle nudge to edit it ── */}
        {todayEntry && !todayEntry.isConfirmed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: 13,
          }}>
            <Pencil size={14} color="var(--blue)" />
            <span style={{ color: 'var(--text-secondary)', flex: 1 }}>
              You've already written today's entry. You can <strong style={{ color: 'var(--blue)' }}>edit it</strong> using the ✏️ pencil icon below — or confirm it to apply progress to your roadmap.
            </span>
          </div>
        )}

        {todayEntry && todayEntry.isConfirmed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: 13,
          }}>
            <CheckCircle size={14} color="var(--success)" />
            <span style={{ color: 'var(--text-secondary)' }}>
              Today's journal is confirmed and roadmap progress has been applied. Great work! 🎉
            </span>
          </div>
        )}

        {/* ── Past Entries ── */}
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          {todayEntry ? 'Your Entries' : 'Past Entries'}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ margin: '0 auto', width: 36, height: 36 }} />
          </div>
        ) : entries.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon"><BookOpen size={28} /></div>
            <div className="empty-title">No entries yet</div>
            <div className="empty-sub">Start by writing about your day above.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.map((entry) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                onConfirm={confirmEntry}
                onUpdate={updateEntry}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
