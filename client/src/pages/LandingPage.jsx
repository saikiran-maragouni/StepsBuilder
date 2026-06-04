import { Link } from 'react-router-dom';
import { Zap, Target, BookOpen, BarChart2, Bell, CheckCircle, ArrowRight } from 'lucide-react';

const features = [
  { icon: Target, title: 'AI Roadmap Builder', desc: 'Describe your goal in plain language. Gemini builds a structured, phased roadmap tailored to your context.' },
  { icon: CheckCircle, title: 'Smart Daily Tasks', desc: 'AI generates your daily to-do list based on your current roadmap step and available time.' },
  { icon: BookOpen, title: 'Natural Journal → Progress', desc: 'Write freely about your day. Gemini reads it and automatically maps your activity to roadmap progress.' },
  { icon: Bell, title: 'Intelligent Nudges', desc: 'Stuck on a step? The AI detects momentum drops and sends personalized motivational nudges.' },
  { icon: BarChart2, title: 'Weekly Insights', desc: 'Get a Gemini-generated weekly summary: what you accomplished, trends, and what to focus on next.' },
  { icon: Zap, title: 'Adaptive Learning', desc: 'The system learns from your corrections and improves its understanding of your work style over time.' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px', position: 'relative', zIndex: 10, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--gradient)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 800, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>StepsBuilder</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/login" id="btn-get-started-nav" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 40px 80px', maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-full)', padding: '6px 16px', marginBottom: 32, fontSize: 13, color: 'var(--indigo)', fontWeight: 600 }}>
          <Zap size={13} /> Powered by Gemini AI
        </div>

        <h1 className="hero-title" style={{ marginBottom: 24 }}>
          The layer between your<br />
          <span className="gradient-text">ambitions and today</span>
        </h1>

        <p style={{ fontSize: 20, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 620, margin: '0 auto 48px', fontWeight: 400 }}>
          StepsBuilder is your Personal Goal Operating System. Tell it your goal — it builds your roadmap, generates your daily tasks, reads your journal, and nudges you when you drift.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" id="btn-get-started-hero" className="btn btn-primary btn-lg">
            Start Building for Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-ghost btn-lg">See How It Works</Link>
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 64, display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[['Gemini AI', 'Roadmap Engine'], ['React Flow', 'Visual Roadmaps'], ['Zero Friction', 'Just Write + Track']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 800, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{val}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px', position: 'relative', zIndex: 1 }}>
        <h2 style={{ textAlign: 'center', fontSize: 38, fontWeight: 800, marginBottom: 16 }}>
          Everything your goals need
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 16, marginBottom: 52 }}>
          Built different from todo apps. Built for people with real ambitions.
        </p>

        <div className="grid-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: '0 6px 20px rgba(99,102,241,0.3)' }}>
                <Icon size={22} color="white" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '80px 40px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 48, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, marginBottom: 12 }}>Ready to start?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>Free to use. No credit card required. Your first AI roadmap takes 10 seconds.</p>
          <Link to="/login" id="btn-cta-final" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
            Create Your Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
