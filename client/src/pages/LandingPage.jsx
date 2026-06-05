import { Link } from 'react-router-dom';
import { Zap, Target, BookOpen, BarChart2, Bell, CheckCircle, ArrowRight, Map, TrendingUp, Smartphone } from 'lucide-react';

const features = [
  { icon: Target, title: 'AI Roadmap Builder', desc: 'Describe your goal in plain language. Gemini builds a structured, phased roadmap tailored to your context.' },
  { icon: CheckCircle, title: 'Smart Daily Tasks', desc: 'AI generates your daily to-do list based on your current roadmap step and available time.' },
  { icon: BookOpen, title: 'Natural Journal → Progress', desc: 'Write freely about your day. Gemini reads it and automatically maps your activity to roadmap progress.' },
  { icon: Bell, title: 'Intelligent Nudges', desc: 'Stuck on a step? The AI detects momentum drops and sends personalized motivational nudges.' },
  { icon: BarChart2, title: 'Weekly Insights', desc: 'Get a Gemini-generated weekly summary: what you accomplished, trends, and what to focus on next.' },
  { icon: Zap, title: 'Adaptive Learning', desc: 'The system learns from your corrections and improves its understanding of your work style over time.' },
];

const steps = [
  { num: '01', emoji: '🎯', title: 'Tell us your goal', desc: 'Type anything in plain language — no forms, no templates. Just your ambition.' },
  { num: '02', emoji: '🗺️', title: 'Get your roadmap', desc: 'AI builds structured phases and steps tailored to your timeline and context.' },
  { num: '03', emoji: '📈', title: 'Track and grow', desc: 'Journal, tasks, and AI nudges keep you moving — even when motivation dips.' },
];

const badges = [
  { icon: '🤖', text: 'Powered by Gemini AI' },
  { icon: '⚡', text: 'Roadmap in 10 seconds' },
  { icon: '📱', text: 'Works on any device' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ── Navbar ── */}
      <nav className="landing-nav" style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px, 5vw, 48px)', height: 68,
        background: 'rgba(8,15,30,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--gradient)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
          }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontSize: 20, fontWeight: 800, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            StepsBuilder
          </span>
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login" className="btn btn-ghost btn-sm sign-in-btn">Sign In</Link>
          <Link to="/login" id="btn-get-started-nav" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ textAlign: 'center', padding: 'clamp(60px,10vw,120px) 24px 80px', maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Pill badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: 'var(--radius-full)', padding: '6px 18px',
          marginBottom: 36, fontSize: 13, color: 'var(--blue-light)', fontWeight: 600,
          boxShadow: '0 0 20px rgba(59,130,246,0.15)',
        }}>
          <Zap size={13} /> Powered by Gemini AI
        </div>

        <h1 className="hero-title" style={{ marginBottom: 28 }}>
          Your goals deserve<br />
          <span className="gradient-text">a real plan</span>
        </h1>

        <p style={{ fontSize: 'clamp(16px,2.2vw,20px)', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 640, margin: '0 auto 48px', fontWeight: 400 }}>
          StepsBuilder turns your ambitions into a step-by-step roadmap — then keeps you moving with AI-powered daily tasks, journal tracking, and smart nudges.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
          <Link to="/login" id="btn-get-started-hero" className="btn btn-primary btn-lg" style={{ boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}>
            Start for Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-ghost btn-lg">See how it works</Link>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          {badges.map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-full)', padding: '8px 20px',
              fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500,
              backdropFilter: 'blur(12px)',
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span> {text}
            </div>
          ))}
        </div>

        {/* Hero visual — fake roadmap preview */}
        <div className="hero-preview" style={{
          marginTop: 72, padding: '28px 32px',
          background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 80px rgba(59,130,246,0.12)',
          maxWidth: 720, margin: '72px auto 0',
        }}>
          {/* Roadmap header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>🎯 Learn to build iOS apps in 3 months</span>
            <div style={{ width: 48 }} />
          </div>

          {/* Fake phases */}
          {[
            { phase: 'Phase 1', title: 'Swift Fundamentals', steps: ['Variables & Types', 'Functions & Closures', 'OOP Basics'], progress: 100, color: '#10b981' },
            { phase: 'Phase 2', title: 'UIKit Essentials', steps: ['View Hierarchy', 'Auto Layout', 'Navigation Controllers'], progress: 65, color: '#3b82f6' },
            { phase: 'Phase 3', title: 'Build & Ship', steps: ['First App', 'App Store Connect', 'Launch'], progress: 0, color: '#6366f1' },
          ].map(({ phase, title, steps, progress, color }) => (
            <div key={phase} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{phase}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{progress}%</div>
              </div>
              <div className="hero-preview-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                {steps.map((step, i) => (
                  <div key={step} style={{
                    padding: '8px 12px', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 500,
                    background: progress === 100 ? 'rgba(16,185,129,0.1)' : (i === 0 && progress > 0) ? 'rgba(59,130,246,0.1)' : 'var(--glass-bg)',
                    border: `1px solid ${progress === 100 ? 'rgba(16,185,129,0.25)' : (i === 0 && progress > 0) ? 'rgba(59,130,246,0.25)' : 'var(--border)'}`,
                    color: progress === 100 ? '#6ee7b7' : (i === 0 && progress > 0) ? '#93c5fd' : 'var(--text-muted)',
                    textAlign: 'center',
                  }}>
                    {progress === 100 ? '✓ ' : (i === 0 && progress > 0) ? '▶ ' : ''}{step}
                  </div>
                ))}
              </div>
              <div className="progress-bar" style={{ height: 4 }}>
                <div className="progress-fill" style={{ width: `${progress}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: 'clamp(60px,8vw,100px) 24px', position: 'relative', zIndex: 1 }}>
        {/* Section glow backdrop */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ textAlign: 'center', marginBottom: 56, position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, marginBottom: 14 }}>From idea to action in minutes</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>No complicated setup. Just type your goal and watch the system do the heavy lifting.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {steps.map(({ num, emoji, title, desc }, idx) => (
            <div key={num} style={{
              padding: '32px 28px',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(20px)',
              position: 'relative', overflow: 'hidden',
              transition: 'var(--transition)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {/* Big number watermark */}
              <div style={{
                position: 'absolute', top: 16, right: 20,
                fontFamily: 'Outfit', fontSize: 64, fontWeight: 900,
                color: 'rgba(59,130,246,0.06)', lineHeight: 1, userSelect: 'none',
              }}>{num}</div>

              <div style={{ fontSize: 40, marginBottom: 20 }}>{emoji}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(40px,6vw,80px) 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>FEATURES</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, marginBottom: 14 }}>Everything your goals need</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Built different from todo apps. Built for people with real ambitions.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--radius-lg)',
                background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 22, boxShadow: '0 6px 24px rgba(59,130,246,0.35)',
              }}>
                <Icon size={24} color="white" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ textAlign: 'center', padding: 'clamp(60px,8vw,100px) 24px', position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: 600, margin: '0 auto', padding: 'clamp(40px,6vw,64px)',
          background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(59,130,246,0.15)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Glow behind card */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400, height: 200,
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,38px)', fontWeight: 800, marginBottom: 12 }}>Ready to start?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: 15, lineHeight: 1.7 }}>
            Free to use. No credit card required.<br />Your first AI roadmap takes just 10 seconds.
          </p>
          <Link to="/login" id="btn-cta-final" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}>
            Create Your Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer" style={{
        borderTop: '1px solid var(--border)',
        padding: 'clamp(20px, 3vw, 28px) clamp(16px, 5vw, 48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--gradient)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>StepsBuilder</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>© 2026 · All rights reserved</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Privacy', '#'], ['Terms', '#'], ['Contact', '#']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >{label}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
