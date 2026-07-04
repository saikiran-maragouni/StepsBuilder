import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import stepsIcon from '../assets/steps-icon.png';

/* ─── Old SVG helpers (used by old sections) ─── */
function RoadmapPathSVG() {
  return (
    <svg viewBox="0 0 800 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="lp-roadmap-path" aria-hidden="true">
      <defs>
        <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#10b981" stopOpacity="0" />
          <stop offset="20%"  stopColor="#10b981" stopOpacity="0.5" />
          <stop offset="50%"  stopColor="#34d399" stopOpacity="0.3" />
          <stop offset="80%"  stopColor="#10b981" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 60 Q200 20 400 60 T800 60" stroke="url(#pathGrad)" strokeWidth="2" fill="none" className="lp-dash-anim" strokeDasharray="6 6" />
      {[100, 250, 400, 550, 700].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={60 - Math.sin((x / 800) * Math.PI * 2) * 20} r="6" fill="#050f0a" stroke="#10b981" strokeWidth="1.5" />
          <circle cx={x} cy={60 - Math.sin((x / 800) * Math.PI * 2) * 20} r="3" fill="#10b981" opacity="0.6" className="lp-pulse-node" style={{ animationDelay: `${i * 0.3}s` }} />
        </g>
      ))}
    </svg>
  );
}

/* ─── Scroll reveal (old style) ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}
function RevealSection({ children, className = '', delay = 0, style: extraStyle, ...rest }) {
  const [ref, visible] = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={`lp-reveal ${visible ? 'lp-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...extraStyle }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ─── Animated counter ─── */
function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Old Navbar (Sticky) ─── */
function Navbar() {
  return (
    <nav className="lp-nav">
      <div className="lp-nav-inner">
        <Link to="/" className="lp-nav-logo">
          <img src={stepsIcon} alt="StepsBuilder" className="lp-nav-logo-img" />
          <span className="lp-nav-logo-text">StepsBuilder</span>
        </Link>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how-it-works" className="lp-nav-link">How it works</a>
          <Link to="/login" className="lp-nav-link">Sign In</Link>
          <Link to="/login" className="btn btn-primary btn-sm" id="btn-get-started-nav">Get Started Free</Link>
        </div>
      </div>
    </nav>
  );
}

/* ─── Data ─── */
const steps = ['PLAN', 'DREAM', 'BUILD', 'LEARN', 'START', 'ACHIEVE'];

const howItWorks = [
  {
    step: '01', title: 'Describe your goal',
    desc: 'Type anything in plain language — "Learn React in 3 months" or "Build a SaaS by December."',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <rect x="4" y="8" width="32" height="24" rx="4" stroke="#10b981" strokeWidth="1.5" fill="rgba(16,185,129,0.08)" />
        <path d="M10 16h12M10 22h8" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="30" cy="26" r="4" fill="#10b981" opacity="0.4" />
        <path d="M29 26l1.5 1.5 2.5-3" stroke="#10b981" strokeWidth="1" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: '02', title: 'AI builds your roadmap',
    desc: 'Gemini creates phases, milestones, and step-by-step tasks — tailored to your timeline and skill level.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <path d="M8 32 L16 18 L24 24 L32 8" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8"  cy="32" r="3" fill="#10b981" opacity="0.5" />
        <circle cx="16" cy="18" r="3" fill="#34d399" opacity="0.5" />
        <circle cx="24" cy="24" r="3" fill="#10b981" opacity="0.5" />
        <circle cx="32" cy="8"  r="3" fill="#6ee7b7" opacity="0.5" />
      </svg>
    ),
  },
  {
    step: '03', title: 'Track, journal, grow',
    desc: 'Daily tasks, natural journaling, and smart nudges keep your momentum alive — even when motivation dips.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <rect x="6" y="6" width="28" height="28" rx="6" stroke="#10b981" strokeWidth="1.5" fill="rgba(16,185,129,0.08)" />
        <path d="M12 20l4 4 8-10" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];



const stats = [
  { value: 10,  suffix: 's',  label: 'To generate a roadmap' },
  { value: 98,  suffix: '%',  label: 'User satisfaction' },
  { value: 500, suffix: '+',  label: 'Goals created' },
  { value: 24,  suffix: '/7', label: 'AI-powered tracking' },
];

/* ══════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════ */
export default function LandingPage() {
  const heroImgRef = useRef(null);

  /* Parallax on hero image */
  useEffect(() => {
    const fn = () => {
      if (heroImgRef.current) heroImgRef.current.style.transform = `translateY(${window.scrollY * 0.12}px)`;
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="lp-root">
      {/* Ambient mesh */}
      <div className="lp-mesh" aria-hidden="true">
        <div className="lp-mesh-orb lp-mesh-1" />
        <div className="lp-mesh-orb lp-mesh-2" />
        <div className="lp-mesh-orb lp-mesh-3" />
      </div>
      <div className="lp-grid-pattern" aria-hidden="true" />

      {/* ── NAVBAR (current transparent floating) ── */}
      <Navbar />

      {/* ══════════════════════════════════════
          HERO — current version with hero.png
      ══════════════════════════════════════ */}
      <section className="hero">
        {/* Vertical step labels */}
        <div className="hero-vline" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s} className="hero-vword" style={{ animationDelay: `${i * 0.15}s` }}>{s}</span>
          ))}
          <div className="hero-vbar" />
        </div>

        {/* Left */}
        <div className="hero-left">
          <div className="step-path">
            {steps.map((s, i) => (
              <span key={s} className="step-word" style={{ animationDelay: `${i * 0.12}s` }}>
                {s}
                {i < steps.length - 1 && <span className="step-arrow">→</span>}
              </span>
            ))}
          </div>

          <h1 className="hero-h1">
            Your goal is waiting<br />
            <span className="hero-h1-em">at the top.</span>
          </h1>

          <p className="hero-tagline">
            We build the roadmap.<br />You climb the steps.
          </p>

          <div className="hero-actions">
            <Link to="/login" id="btn-get-started-hero" className="hero-cta">
              Begin climbing <ArrowRight size={16} />
            </Link>
            <div className="hero-meta">
              <span className="hero-meta-dot" />
              <span>Free forever · No credit card</span>
            </div>
          </div>
        </div>

        {/* Right — hero image */}
        <div className="hero-right">
          <img
            ref={heroImgRef}
            src="/hero.png"
            alt="Climb your goals step by step"
            className="hero-img"
          />
          <div className="chip chip-a">
            <div className="chip-top">🔥 12</div>
            <div className="chip-bot">Day streak</div>
          </div>
          <div className="chip chip-b">
            <div className="chip-top" style={{ color: '#10b981' }}>✓ Done</div>
            <div className="chip-bot">Phase 2 complete</div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint" aria-hidden="true">
          <div className="scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR (old)
      ══════════════════════════════════════ */}
      <section className="lp-stats">
        <div className="lp-stats-inner">
          {stats.map(({ value, suffix, label }, i) => (
            <RevealSection key={label} delay={i * 100} className="lp-stat">
              <div className="lp-stat-value"><Counter end={value} suffix={suffix} /></div>
              <div className="lp-stat-label">{label}</div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS (old)
      ══════════════════════════════════════ */}
      <section className="lp-section" id="how-it-works">
        <RevealSection>
          <div className="lp-section-header">
            <span className="lp-section-tag">How It Works</span>
            <h2 className="lp-section-title">From idea to action<br /><span className="lp-gradient-text">in three steps</span></h2>
            <p className="lp-section-sub">No complicated setup. No templates. Just type your goal.</p>
          </div>
        </RevealSection>
        <div className="lp-steps">
          {howItWorks.map(({ step, title, desc, icon }, i) => (
            <RevealSection key={step} delay={i * 150} className="lp-step">
              <div className="lp-step-num">{step}</div>
              <div className="lp-step-icon">{icon}</div>
              <h3 className="lp-step-title">{title}</h3>
              <p className="lp-step-desc">{desc}</p>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES BENTO GRID (old)
      ══════════════════════════════════════ */}
      <section className="lp-section" id="features">
        <RevealSection>
          <div className="lp-section-header">
            <span className="lp-section-tag">Features</span>
            <h2 className="lp-section-title">Everything your goals<br /><span className="lp-gradient-text">actually need</span></h2>
            <p className="lp-section-sub">Built different from todo apps. Built for people with real ambitions.</p>
          </div>
        </RevealSection>
        
        <div className="bento-grid">
          {/* Card 1: AI Roadmap Builder - Horizontal Layout */}
          <RevealSection delay={100} className="bento-item bento-large bento-roadmap">
            <div className="bento-text">
              <h3>AI Roadmap Builder</h3>
              <p>Describe your goal in plain language. Gemini builds a structured, phased roadmap tailored to your context.</p>
            </div>
            <div className="bento-visual-right">
              <div className="mock-roadmap">
                <div className="mock-step mock-active">Phase 1: Foundations</div>
                <div className="mock-step">Phase 2: Execution</div>
                <div className="mock-step">Phase 3: Launch</div>
              </div>
            </div>
            <div className="bento-bg" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(16,185,129,0.05) 100%)'}}/>
          </RevealSection>

          {/* Card 2: Daily Tasks - Vertical Layout */}
          <RevealSection delay={200} className="bento-item bento-tasks">
            <div className="bento-visual-top">
              <div className="mock-task"><div className="mock-check mock-checked"/> Review basics</div>
              <div className="mock-task"><div className="mock-check"/> Setup env</div>
            </div>
            <div className="bento-text">
              <h3>Smart Daily Tasks</h3>
              <p>AI generates your daily to-do list based on your roadmap.</p>
            </div>
          </RevealSection>

          {/* Card 3: Journal - Typography focused */}
          <RevealSection delay={300} className="bento-item bento-journal">
            <div className="bento-text">
              <h3>Natural Journal</h3>
              <p>Write freely. Gemini reads it and maps your activity to progress.</p>
            </div>
            <div className="mock-journal-bg">"Today I learned..."</div>
          </RevealSection>

          {/* Card 4: Nudges - Icon focused */}
          <RevealSection delay={400} className="bento-item bento-nudges">
            <div className="bento-icon-wrapper">
              <span className="bento-icon">🔔</span>
            </div>
            <div className="bento-text">
              <h3>Intelligent Nudges</h3>
              <p>Stuck? The AI detects momentum drops and sends a push.</p>
            </div>
          </RevealSection>

          {/* Card 5: Insights - Chart visual */}
          <RevealSection delay={500} className="bento-item bento-insights">
            <div className="bento-visual-top mock-chart-box">
              <div className="mock-chart">
                <div className="bar" style={{height: '40%'}}></div>
                <div className="bar" style={{height: '70%'}}></div>
                <div className="bar" style={{height: '100%', background: '#10b981'}}></div>
                <div className="bar" style={{height: '60%'}}></div>
              </div>
            </div>
            <div className="bento-text">
              <h3>Weekly Insights</h3>
              <p>Gemini spots trends and tells you where to focus next.</p>
            </div>
          </RevealSection>

          {/* Card 6: Adaptive - Big center layout */}
          <RevealSection delay={600} className="bento-item bento-large bento-adaptive">
            <div className="mock-brain">🧠</div>
            <div className="bento-text center-text">
              <h3>Adaptive Learning</h3>
              <p>The system learns from your corrections and adapts to your rhythm over time.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA (old)
      ══════════════════════════════════════ */}
      <section className="lp-cta-section">
        <div className="lp-cta-glow" aria-hidden="true" />
        <RevealSection>
          <div className="lp-cta-card">
            <h2 className="lp-cta-title">Ready to build your<br /><span className="lp-gradient-text">first roadmap?</span></h2>
            <p className="lp-cta-sub">Free to use. No credit card. Your first AI roadmap takes 10 seconds.</p>
            <div className="lp-cta-features">
              {['AI-powered roadmaps', 'Smart daily tasks', 'Journal tracking', 'Intelligent nudges'].map((f) => (
                <div key={f} className="lp-cta-feature"><Check size={14} /> {f}</div>
              ))}
            </div>
            <Link to="/login" className="lp-cta-primary lp-cta-btn" id="btn-cta-final">
              Create Your Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </RevealSection>
      </section>

      {/* ══════════════════════════════════════
          FOOTER (old)
      ══════════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <img src={stepsIcon} alt="Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            <span className="lp-footer-name">StepsBuilder</span>
            <span className="lp-footer-copy">© 2026 · All rights reserved</span>
          </div>
          <div className="lp-footer-links">
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a key={l} href="#" className="lp-footer-link">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════
          ALL STYLES
      ══════════════════════════════════════ */}
      <style>{`
/* ── ROOT ── */
.lp-root { min-height:100vh; position:relative; overflow-x:hidden; background:#050f0a; color:rgba(255,255,255,.93); }

/* ── MESH BG ── */
.lp-mesh { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
.lp-mesh-orb { position:absolute; border-radius:50%; filter:blur(80px); }
.lp-mesh-1 { width:600px;height:600px;top:-10%;left:-5%;background:radial-gradient(circle,rgba(16,185,129,.15),transparent 70%);animation:meshFloat1 18s ease-in-out infinite; }
.lp-mesh-2 { width:500px;height:500px;top:40%;right:-10%;background:radial-gradient(circle,rgba(5,150,105,.12),transparent 70%);animation:meshFloat2 22s ease-in-out infinite; }
.lp-mesh-3 { width:400px;height:400px;bottom:-5%;left:30%;background:radial-gradient(circle,rgba(13,148,136,.1),transparent 70%);animation:meshFloat3 15s ease-in-out infinite; }
@keyframes meshFloat1{0%,100%{transform:translate(0,0)}33%{transform:translate(60px,40px)}66%{transform:translate(-30px,80px)}}
@keyframes meshFloat2{0%,100%{transform:translate(0,0)}50%{transform:translate(-80px,-60px)}}
@keyframes meshFloat3{0%,100%{transform:translate(0,0)}50%{transform:translate(50px,-40px)}}

/* ── GRID PATTERN ── */
.lp-grid-pattern { position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px);
  background-size:60px 60px;
  mask-image:radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%);
  -webkit-mask-image:radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%); }

/* ── REVEAL ── */
.lp-reveal { opacity:0; transform:translateY(28px); transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1); }
.lp-reveal.lp-visible { opacity:1; transform:translateY(0); }

/* ══ NAVBAR ══ */
.lp-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(5,15,10,0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.lp-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(16px,4vw,48px);
  height: 64px;
}
.lp-nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.lp-nav-logo-img { width: 56px; height: 56px; object-fit: contain; }
.lp-nav-logo-text {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.lp-nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}
.lp-nav-link {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.55);
  text-decoration: none;
  transition: color 0.2s;
}
.lp-nav-link:hover { color: rgba(255,255,255,0.9); }

/* ══ HERO (current) ══ */
.hero {
  position:relative;z-index:1;
  display:grid;grid-template-columns:1fr 1fr;
  align-items:center;min-height:100vh;
  max-width:1400px;margin:0 auto;
  padding:80px clamp(16px,4vw,64px) 32px;
  overflow:hidden;
}
/* Vertical step labels */
.hero-vline { position:absolute;left:0;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:6px;align-items:flex-start;padding-left:4px;z-index:0;pointer-events:none; }
.hero-vword { font-family:'Outfit',sans-serif;font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(16,185,129,.18);opacity:0;animation:vwIn .5s ease forwards; }
.hero-vword:last-of-type { color:rgba(16,185,129,.35); }
@keyframes vwIn{to{opacity:1}}
.hero-vbar { width:1px;height:48px;background:linear-gradient(to bottom,rgba(16,185,129,.25),transparent);margin-top:8px;animation:vbPulse 2.5s ease-in-out infinite; }
@keyframes vbPulse{0%,100%{opacity:.3}50%{opacity:.8}}

.hero-left { display:flex;flex-direction:column;gap:0;position:relative;z-index:2; }
.step-path { display:flex;flex-wrap:wrap;align-items:center;gap:4px 0;margin-bottom:32px; }
.step-word { display:inline-flex;align-items:center;gap:6px;font-family:'Outfit',sans-serif;font-size:clamp(11px,1.1vw,13px);font-weight:700;letter-spacing:.18em;color:rgba(255,255,255,.35);text-transform:uppercase;opacity:0;animation:stepIn .5s ease forwards; }
@keyframes stepIn{to{opacity:1}}
.step-word:last-child { color:#10b981;text-shadow:0 0 20px rgba(16,185,129,.5); }
.step-arrow { color:rgba(16,185,129,.3);font-size:10px;margin:0 3px; }

.hero-h1 { font-family:'Outfit',sans-serif;font-size:clamp(44px,5.5vw,80px);font-weight:900;line-height:1.02;letter-spacing:-.03em;margin-bottom:20px;color:white; }
.hero-h1-em { background:linear-gradient(130deg,#10b981 0%,#34d399 45%,#6ee7b7 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
.hero-tagline { font-size:clamp(18px,2.2vw,24px);color:rgba(255,255,255,.4);line-height:1.55;margin-bottom:40px;font-family:'Outfit',sans-serif;font-weight:400;font-style:italic; }
.hero-actions { display:flex;flex-direction:column;gap:16px;align-items:flex-start; }
.hero-cta { display:inline-flex;align-items:center;gap:10px;padding:16px 34px;border-radius:12px;background:linear-gradient(135deg,#10b981,#059669);color:white;font-weight:700;font-size:16px;text-decoration:none;border:none;cursor:pointer;box-shadow:0 6px 24px rgba(16,185,129,.4),inset 0 1px 0 rgba(255,255,255,.15);transition:transform .2s,box-shadow .2s;width:fit-content; }
.hero-cta:hover { transform:translateY(-2px);box-shadow:0 10px 36px rgba(16,185,129,.55); }
.hero-meta { display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(255,255,255,.3);font-weight:500; }
.hero-meta-dot { width:5px;height:5px;border-radius:50%;background:#10b981;opacity:.5; }

.hero-right { position:relative;display:flex;align-items:center;justify-content:center; }
.hero-img { width:100%;max-width:680px;height:auto;mix-blend-mode:lighten;filter:drop-shadow(0 0 80px rgba(16,185,129,.22));will-change:transform; }
.chip { position:absolute;padding:10px 16px;border-radius:12px;background:rgba(5,15,10,.9);border:1px solid rgba(16,185,129,.18);backdrop-filter:blur(14px);box-shadow:0 8px 28px rgba(0,0,0,.45);animation:chipf 4s ease-in-out infinite; }
.chip-a { top:22%;right:0;animation-delay:0s; }
.chip-b { bottom:30%;left:0;animation-delay:1.5s; }
@keyframes chipf{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.chip-top { font-family:'Outfit',sans-serif;font-size:15px;font-weight:800;color:white; }
.chip-bot { font-size:11px;color:rgba(255,255,255,.38);margin-top:2px; }
.scroll-hint { position:absolute;bottom:32px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(255,255,255,.2);font-size:10px;letter-spacing:.14em;text-transform:uppercase; }
.scroll-line { width:1px;height:44px;background:linear-gradient(to bottom,rgba(16,185,129,.5),transparent);animation:sl 1.8s ease-in-out infinite; }
@keyframes sl{0%,100%{opacity:.3}50%{opacity:1}}

/* ══ OLD SECTIONS ══ */

/* Stats */
.lp-stats { position:relative;z-index:1;border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02); }
.lp-stats-inner { max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);padding:48px clamp(16px,4vw,48px); }
.lp-stat { text-align:center; }
.lp-stat-value { font-family:'Outfit',sans-serif;font-size:clamp(32px,4vw,48px);font-weight:800;background:linear-gradient(135deg,#10b981,#6ee7b7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.1; }
.lp-stat-label { font-size:13px;color:rgba(255,255,255,.4);margin-top:6px;font-weight:500; }

/* Section wrapper */
.lp-section { position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:clamp(80px,10vw,120px) clamp(16px,4vw,48px); }
.lp-section-header { text-align:center;margin-bottom:64px; }
.lp-section-tag { display:inline-block;font-size:12px;font-weight:700;color:#10b981;letter-spacing:.14em;text-transform:uppercase;margin-bottom:16px; }
.lp-section-title { font-family:'Outfit',sans-serif;font-size:clamp(28px,4vw,48px);font-weight:800;line-height:1.15;margin-bottom:16px; }
.lp-section-sub { font-size:16px;color:rgba(255,255,255,.45);max-width:520px;margin:0 auto;line-height:1.7; }
.lp-gradient-text { background:linear-gradient(135deg,#10b981,#34d399 50%,#6ee7b7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }

/* How it works */
.lp-steps { display:grid;grid-template-columns:repeat(3,1fr);gap:32px;position:relative; }
.lp-step { position:relative;padding:36px 28px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:20px;transition:all .3s cubic-bezier(.4,0,.2,1);overflow:hidden; }
.lp-step:hover { border-color:rgba(16,185,129,.3);transform:translateY(-4px);box-shadow:0 12px 40px rgba(16,185,129,.08); }
.lp-step-num { position:absolute;top:14px;right:18px;font-family:'Outfit',sans-serif;font-size:72px;font-weight:900;color:rgba(16,185,129,.05);line-height:1;user-select:none; }
.lp-step-icon { margin-bottom:20px; }
.lp-step-title { font-size:20px;font-weight:700;margin-bottom:10px;font-family:'Outfit',sans-serif; }
.lp-step-desc { font-size:14px;color:rgba(255,255,255,.5);line-height:1.75; }

/* ══ BESPOKE BENTO ══ */
.bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; grid-auto-rows: 280px; }
.bento-item { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; overflow: hidden; position: relative; display: flex; flex-direction: column; transition: transform 0.3s, border-color 0.3s; }
.bento-item:hover { border-color: rgba(16,185,129,0.25); transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.3); }
.bento-large { grid-column: span 2; }
.bento-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }

/* Text */
.bento-text { padding: 28px; z-index: 2; position: relative; }
.bento-text h3 { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 10px; }
.bento-text p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; }
.center-text { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; max-width: 480px; margin: 0 auto; }

/* Card 1: Roadmap */
.bento-roadmap { flex-direction: row; align-items: center; justify-content: space-between; }
.bento-roadmap .bento-text { width: 55%; }
.bento-visual-right { width: 45%; padding-right: 32px; z-index: 2; }
.mock-roadmap { display: flex; flex-direction: column; gap: 10px; }
.mock-step { padding: 12px 16px; background: rgba(0,0,0,0.2); border-radius: 8px; font-size: 13px; color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.05); }
.mock-step.mock-active { background: rgba(16,185,129,0.08); color: #10b981; border-color: rgba(16,185,129,0.2); font-weight: 600; }

/* Card 2: Tasks */
.bento-tasks { justify-content: space-between; }
.bento-visual-top { padding: 28px 28px 0; display: flex; flex-direction: column; gap: 8px; z-index: 2; }
.mock-task { display: flex; align-items: center; gap: 10px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; font-size: 13px; border: 1px solid rgba(255,255,255,0.03); }
.mock-check { width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); }
.mock-check.mock-checked { background: #10b981; border-color: #10b981; }

/* Card 3: Journal */
.bento-journal { background: radial-gradient(circle at bottom right, rgba(52,211,153,0.1), transparent 60%); justify-content: flex-start; }
.mock-journal-bg { position: absolute; bottom: 10px; right: 20px; font-family: serif; font-size: 40px; font-style: italic; color: rgba(255,255,255,0.04); font-weight: 700; line-height: 1; z-index: 1; }

/* Card 4: Nudges */
.bento-nudges { justify-content: flex-end; }
.bento-icon-wrapper { position: absolute; top: 28px; left: 28px; width: 44px; height: 44px; background: rgba(13,148,136,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }

/* Card 5: Insights */
.bento-insights { justify-content: space-between; }
.mock-chart-box { height: 100px; padding-top: 40px; }
.mock-chart { display: flex; align-items: flex-end; gap: 8px; height: 100%; width: 100%; }
.bar { flex: 1; background: rgba(255,255,255,0.08); border-radius: 4px 4px 0 0; }

/* Card 6: Adaptive */
.bento-adaptive { justify-content: center; align-items: center; }
.mock-brain { position: absolute; font-size: 140px; opacity: 0.03; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1; }

/* CTA section */
.lp-cta-section { position:relative;z-index:1;text-align:center;padding:clamp(60px,8vw,100px) clamp(16px,4vw,48px); }
.lp-cta-glow { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:400px;background:radial-gradient(ellipse,rgba(16,185,129,.1),transparent 70%);pointer-events:none; }
.lp-cta-card { max-width:640px;margin:0 auto;padding:clamp(40px,6vw,64px);background:rgba(16,185,129,.05);border:1px solid rgba(16,185,129,.18);border-radius:24px;backdrop-filter:blur(24px);position:relative; }
.lp-cta-title { font-family:'Outfit',sans-serif;font-size:clamp(28px,4vw,40px);font-weight:800;line-height:1.15;margin-bottom:14px; }
.lp-cta-sub { color:rgba(255,255,255,.5);font-size:15px;line-height:1.7;margin-bottom:28px; }
.lp-cta-features { display:flex;flex-wrap:wrap;justify-content:center;gap:12px 20px;margin-bottom:36px; }
.lp-cta-feature { display:flex;align-items:center;gap:6px;font-size:13px;color:#34d399;font-weight:500; }
.lp-cta-primary { display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:12px;background:linear-gradient(135deg,#10b981,#059669);color:white;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 4px 18px rgba(16,185,129,.35);transition:transform .2s,box-shadow .2s; }
.lp-cta-primary:hover { transform:translateY(-2px);box-shadow:0 8px 28px rgba(16,185,129,.5); }
.lp-cta-btn { width:100%;justify-content:center;font-size:16px;padding:16px 32px; }

/* Footer */
.lp-footer { position:relative;z-index:1;border-top:1px solid rgba(255,255,255,.06); }
.lp-footer-inner { max-width:1200px;margin:0 auto;padding:clamp(20px,3vw,28px) clamp(16px,4vw,48px);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px; }
.lp-footer-brand { display:flex;align-items:center;gap:10px; }
.lp-footer-name { font-family:'Outfit',sans-serif;font-weight:700;font-size:15px;background:linear-gradient(135deg,#10b981,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
.lp-footer-copy { font-size:13px;color:rgba(255,255,255,.3); }
.lp-footer-links { display:flex;gap:24px; }
.lp-footer-link { font-size:13px;color:rgba(255,255,255,.35);text-decoration:none;transition:color .2s; }
.lp-footer-link:hover { color:rgba(255,255,255,.7); }

/* Animations used by old SVGs */
.lp-dash-anim { animation:lpDash 20s linear infinite; }
@keyframes lpDash{to{stroke-dashoffset:-200}}
.lp-pulse-node { animation:lpNodePulse 2s ease-in-out infinite; }
@keyframes lpNodePulse{0%,100%{opacity:.4}50%{opacity:1}}
.lp-roadmap-path { width:100%;height:auto;margin-top:-20px;opacity:.5; }

/* ══ RESPONSIVE ══ */
@media(max-width:960px){
  .lp-nav-links .lp-nav-link:not(.btn){display:none;}
  .scroll-hint{display:none;}
  .hero-vline{display:none;}
  .hero{grid-template-columns:1fr 1fr;min-height:auto;padding:76px clamp(12px,3vw,32px) 24px;gap:16px;align-items:center;}
  .hero-h1{font-size:clamp(26px,4vw,38px);}
  .hero-tagline{font-size:clamp(13px,2vw,16px);margin-bottom:20px;}
  .hero-img{max-width:100%;}
  .chip{display:none;}
  .lp-stats-inner{grid-template-columns:repeat(2,1fr);gap:32px;}
  .lp-steps{grid-template-columns:1fr;max-width:480px;margin:0 auto;}
  .bento-grid{grid-template-columns:1fr;grid-auto-rows:auto;}
  .bento-large{grid-column:span 1;}
}
@media(max-width:680px){
  .lp-nav-links .lp-nav-link:not(.btn){display:none;}
  .hero{grid-template-columns:1fr;text-align:center;padding:68px 16px 12px;gap:0;}
  .hero-left{align-items:center;order:2;padding-bottom:20px;}
  .hero-right{order:1;}
  .step-path{justify-content:center;}
  .hero-actions{align-items:center;}
  .hero-h1{font-size:clamp(28px,8vw,40px);}
  .hero-tagline{font-size:14px;margin-bottom:20px;}
  .hero-img{max-width:260px;}
  .chip{display:none;}
  .lp-stats-inner{grid-template-columns:repeat(2,1fr);gap:24px;padding:32px 16px;}
  .lp-stat-value{font-size:28px;}
  .lp-cta-card{padding:32px 24px;}
  
  .bento-grid { gap: 12px; }
  .bento-roadmap { flex-direction: column; }
  .bento-roadmap .bento-text, .bento-visual-right { width: 100%; padding-right: 0; }
  .bento-text { padding: 24px; }
  .bento-visual-top, .bento-visual-right { padding: 24px 24px 0; }
  .bento-icon-wrapper { position: relative; top: auto; left: auto; margin: 24px 24px 0; }
  .bento-nudges { justify-content: flex-start; }
  .bento-nudges .bento-text { padding-top: 16px; }
}
@media(max-width:420px){
  .hero-img{max-width:220px;}
  .nav-cta{font-size:12px;padding:7px 14px;}
}
      `}</style>
    </div>
  );
}
