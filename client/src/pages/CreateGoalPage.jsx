import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import { ArrowLeft, Sparkles, Loader } from 'lucide-react';

const categories = ['learning', 'career', 'fitness', 'business', 'personal'];
const timeframes = ['2 weeks', '1 month', '2 months', '3 months', '6 months', '1 year'];
const levels = ['beginner', 'intermediate', 'advanced'];

export default function CreateGoalPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', category: 'learning', timeframe: '3 months', description: '', userContext: '', hoursPerDay: 2, experienceLevel: 'beginner' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'number' ? +e.target.value : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Goal title is required.');
    setLoading(true);
    try {
      const { data } = await api.post('/goals', form);
      toast.success(data.roadmap?.phases?.length > 0 ? '🎉 Goal created with AI roadmap!' : '✅ Goal created! Roadmap will generate shortly.');
      navigate(`/goals/${data.goal._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal.');
    } finally { setLoading(false); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <button onClick={() => navigate('/goals')} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
          <ArrowLeft size={15} /> Back to Goals
        </button>

        <div className="create-goal-container">
          <div style={{ marginBottom: 32 }}>
            <h1 className="topbar-title">Create New Goal</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>The more context you give Gemini, the better your roadmap will be.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 12 }}>Goal Basics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="input-wrapper">
                  <label className="input-label">Goal Title *</label>
                  <input id="goal-title" className="input" placeholder="e.g. Master React and build a SaaS product" value={form.title} onChange={set('title')} required />
                </div>

                <div className="grid-2">
                  <div className="input-wrapper">
                    <label className="input-label">Category</label>
                    <select id="goal-category" className="input" value={form.category} onChange={set('category')}>
                      {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">Timeframe</label>
                    <select id="goal-timeframe" className="input" value={form.timeframe} onChange={set('timeframe')}>
                      {timeframes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-wrapper">
                  <label className="input-label">Description</label>
                  <textarea id="goal-description" className="input" placeholder="What does success look like? What will you be able to do?" value={form.description} onChange={set('description')} rows={3} />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 20, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Context (Better Input = Better Roadmap)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="input-wrapper">
                  <label className="input-label">Your Background & Context</label>
                  <textarea id="user-context" className="input" placeholder="Tell Gemini about your current level, what you already know, your learning style, any constraints..." value={form.userContext} onChange={set('userContext')} rows={4} />
                </div>

                <div className="grid-2">
                  <div className="input-wrapper">
                    <label className="input-label">Hours Per Day</label>
                    <input id="hours-per-day" type="number" className="input" min={0.5} max={12} step={0.5} value={form.hoursPerDay} onChange={set('hoursPerDay')} />
                  </div>
                  <div className="input-wrapper">
                    <label className="input-label">Experience Level</label>
                    <select id="experience-level" className="input" value={form.experienceLevel} onChange={set('experienceLevel')}>
                      {levels.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button id="btn-create-goal" type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 16 }} disabled={loading}>
              {loading
                ? <><Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Generating your AI roadmap...</>
                : <><Sparkles size={16} /> Create Goal + Generate Roadmap</>}
            </button>

            {loading && (
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                Gemini is analyzing your goal and building a personalized roadmap... this takes ~10 seconds.
              </p>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
