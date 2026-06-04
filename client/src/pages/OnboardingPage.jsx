import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { Target, Clock, BookOpen, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: Target,
    title: 'What\'s your first goal?',
    sub: 'Don\'t overthink it — you can add more later.',
    fields: [
      { key: 'goalTitle', label: 'Goal Title', placeholder: 'e.g. Learn full-stack development', type: 'text' },
      { key: 'goalCategory', label: 'Category', type: 'select', options: ['learning', 'career', 'fitness', 'business', 'personal'] },
      { key: 'goalTimeframe', label: 'Timeframe', placeholder: 'e.g. 3 months', type: 'text' },
    ],
  },
  {
    id: 2,
    icon: Clock,
    title: 'How much time can you dedicate?',
    sub: 'Be realistic — consistency beats intensity.',
    fields: [
      { key: 'hoursPerDay', label: 'Hours per day', type: 'select', options: ['0.5', '1', '1.5', '2', '3', '4', '5+'] },
      { key: 'experienceLevel', label: 'Your experience level', type: 'select', options: ['beginner', 'intermediate', 'advanced'] },
    ],
  },
  {
    id: 3,
    icon: BookOpen,
    title: 'Tell Gemini about yourself',
    sub: 'The more context you give, the better your roadmap.',
    fields: [
      { key: 'userContext', label: 'Background & context', placeholder: 'e.g. I know basic Python and have 2 years of data analysis experience. I want to become job-ready in ML.', type: 'textarea' },
    ],
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));
  const cur = steps[step];
  const Icon = cur.icon;

  const next = () => { if (step < steps.length - 1) setStep(step + 1); };
  const back = () => { if (step > 0) setStep(step - 1); };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Mark onboarding complete
      await api.put('/auth/me', { onboardingCompleted: true, hoursPerDay: parseFloat(data.hoursPerDay) || 1 });
      updateUser({ onboardingCompleted: true });

      // 2. Create the goal + trigger Gemini roadmap generation
      const goalRes = await api.post('/goals', {
        title: data.goalTitle,
        category: data.goalCategory || 'learning',
        timeframe: data.goalTimeframe,
        userContext: data.userContext,
        hoursPerDay: parseFloat(data.hoursPerDay) || 1,
        experienceLevel: data.experienceLevel || 'beginner',
      });

      if (goalRes.data.roadmap?.phases?.length > 0) {
        toast.success('Your AI roadmap is ready! 🎉');
      } else {
        toast.info('Goal created! AI roadmap will generate shortly.');
      }

      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="auth-page">
      <div className="bg-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>

      <div style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Step {step + 1} of {steps.length}</span>
            <span style={{ fontSize: 13, color: 'var(--indigo)', fontWeight: 600 }}>Quick Setup</span>
          </div>
          <div className="progress-bar" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--gradient-soft)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo)', flexShrink: 0 }}>
              <Icon size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 20 }}>{cur.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{cur.sub}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {cur.fields.map((f) => (
              <div key={f.key} className="input-wrapper">
                <label className="input-label">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea id={f.key} className="input" placeholder={f.placeholder} value={data[f.key] || ''} onChange={set(f.key)} rows={4} />
                ) : f.type === 'select' ? (
                  <select id={f.key} className="input" value={data[f.key] || ''} onChange={set(f.key)}>
                    <option value="">Select...</option>
                    {f.options.map((o) => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                  </select>
                ) : (
                  <input id={f.key} type="text" className="input" placeholder={f.placeholder} value={data[f.key] || ''} onChange={set(f.key)} />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            {step > 0 && (
              <button onClick={back} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button id="btn-next" onClick={next} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button id="btn-finish" onClick={handleFinish} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Generating roadmap...</> : <><Sparkles size={16} /> Generate My Roadmap</>}
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          Powered by Gemini AI · Your roadmap is generated in seconds
        </p>
      </div>
    </div>
  );
}
