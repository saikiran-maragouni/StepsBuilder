import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import stepsIcon from '../assets/steps-icon.png';

/* ΓöÇΓöÇΓöÇ Inline SVG Components ΓöÇΓöÇΓöÇ */

function HeroIllustration() {
  return (
    <svg viewBox="0 0 560 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="lp-hero-svg">
      {/* Glowing base circle */}
      <defs>
        <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#34d399" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#000" floodOpacity="0.35" />
        </filter>
        <filter id="nodeShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#10b981" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Background glow */}
      <circle cx="280" cy="230" r="200" fill="url(#glow1)" className="lp-float" />

      {/* ΓöÇΓöÇ Main dashboard card ΓöÇΓöÇ */}
      <g filter="url(#cardShadow)">
        <rect x="80" y="60" width="400" height="280" rx="18" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        {/* Title bar dots */}
        <circle cx="104" cy="84" r="4" fill="#ef4444" opacity="0.7" />
        <circle cx="118" cy="84" r="4" fill="#f59e0b" opacity="0.7" />
        <circle cx="132" cy="84" r="4" fill="#10b981" opacity="0.7" />
        {/* Title text */}
        <rect x="200" y="77" width="160" height="12" rx="3" fill="rgba(255,255,255,0.08)" />

        {/* ΓöÇΓöÇ Goal roadmap visualization ΓöÇΓöÇ */}
        {/* Phase labels */}
        <rect x="104" y="116" width="64" height="8" rx="2" fill="rgba(16,185,129,0.3)" />
        <rect x="104" y="130" width="120" height="10" rx="2" fill="rgba(255,255,255,0.12)" />

        {/* Progress bar */}
        <rect x="104" y="152" width="344" height="6" rx="3" fill="rgba(255,255,255,0.06)" />
        <rect x="104" y="152" width="248" height="6" rx="3" fill="url(#barGrad)" className="lp-progress-grow" />

        {/* Step cards row */}
        <g className="lp-card-appear" style={{ animationDelay: '0.2s' }}>
          <rect x="104" y="176" width="104" height="72" rx="10" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.2)" strokeWidth="0.8" />
          <circle cx="124" cy="196" r="8" fill="rgba(16,185,129,0.2)" />
          <path d="M120 196l3 3 6-6" stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <rect x="116" y="212" width="72" height="6" rx="2" fill="rgba(255,255,255,0.1)" />
          <rect x="116" y="224" width="52" height="5" rx="2" fill="rgba(255,255,255,0.06)" />
        </g>

        <g className="lp-card-appear" style={{ animationDelay: '0.4s' }}>
          <rect x="220" y="176" width="104" height="72" rx="10" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.2)" strokeWidth="0.8" />
          <circle cx="240" cy="196" r="8" fill="rgba(16,185,129,0.2)" />
          <path d="M236 196l3 3 6-6" stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <rect x="232" y="212" width="72" height="6" rx="2" fill="rgba(255,255,255,0.1)" />
          <rect x="232" y="224" width="60" height="5" rx="2" fill="rgba(255,255,255,0.06)" />
        </g>

        <g className="lp-card-appear" style={{ animationDelay: '0.6s' }}>
          <rect x="336" y="176" width="104" height="72" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" strokeDasharray="3 3" />
          <circle cx="356" cy="196" r="8" fill="rgba(255,255,255,0.06)" />
          <rect x="348" y="212" width="72" height="6" rx="2" fill="rgba(255,255,255,0.06)" />
          <rect x="348" y="224" width="44" height="5" rx="2" fill="rgba(255,255,255,0.04)" />
        </g>

        {/* Stats row at bottom */}
        <rect x="104" y="268" width="74" height="52" rx="8" fill="rgba(255,255,255,0.04)" />
        <text x="118" y="290" fill="#10b981" fontSize="18" fontWeight="700" fontFamily="Outfit">72%</text>
        <text x="118" y="306" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Inter">Progress</text>

        <rect x="190" y="268" width="74" height="52" rx="8" fill="rgba(255,255,255,0.04)" />
        <text x="204" y="290" fill="#34d399" fontSize="18" fontWeight="700" fontFamily="Outfit">14</text>
        <text x="204" y="306" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Inter">Tasks Done</text>

        <rect x="276" y="268" width="74" height="52" rx="8" fill="rgba(255,255,255,0.04)" />
        <text x="290" y="290" fill="#6ee7b7" fontSize="18" fontWeight="700" fontFamily="Outfit">5d</text>
        <text x="290" y="306" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Inter">Streak</text>
      </g>

      {/* ΓöÇΓöÇ Floating accent cards ΓöÇΓöÇ */}
      {/* AI nudge card ΓÇö floats top-right */}
      <g className="lp-float-card" style={{ animationDelay: '0.8s' }}>
        <rect x="400" y="20" width="150" height="56" rx="12" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.25)" strokeWidth="0.8" />
        <circle cx="420" cy="48" r="10" fill="rgba(16,185,129,0.25)" />
        <text x="418" y="52" fontSize="12">ΓÜí</text>
        <rect x="438" y="38" width="80" height="6" rx="2" fill="rgba(255,255,255,0.12)" />
        <rect x="438" y="50" width="56" height="5" rx="2" fill="rgba(255,255,255,0.07)" />
      </g>

      {/* Journal entry card ΓÇö floats bottom-left */}
      <g className="lp-float-card" style={{ animationDelay: '1.2s', animationDuration: '5s' }}>
        <rect x="20" y="300" width="130" height="56" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
        <circle cx="40" cy="328" r="10" fill="rgba(16,185,129,0.15)" />
        <text x="36" y="332" fontSize="11">≡ƒôô</text>
        <rect x="58" y="318" width="72" height="6" rx="2" fill="rgba(255,255,255,0.1)" />
        <rect x="58" y="330" width="52" height="5" rx="2" fill="rgba(255,255,255,0.06)" />
      </g>

      {/* ΓöÇΓöÇ Connecting path with animated nodes ΓöÇΓöÇ */}
      <path d="M280 360 Q 280 400, 320 420 T 400 440" stroke="url(#lineGrad)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" className="lp-dash-anim" />

      {/* Glowing nodes */}
      <circle cx="280" cy="360" r="5" fill="#10b981" filter="url(#nodeShadow)" className="lp-pulse-node" />
      <circle cx="340" cy="420" r="4" fill="#34d399" filter="url(#nodeShadow)" className="lp-pulse-node" style={{ animationDelay: '0.5s' }} />
      <circle cx="400" cy="440" r="3" fill="#6ee7b7" filter="url(#nodeShadow)" className="lp-pulse-node" style={{ animationDelay: '1s' }} />
    </svg>
  );
}

function RoadmapPathSVG() {
  return (
    <svg viewBox="0 0 800 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="lp-roadmap-path" aria-hidden="true">
      <defs>
        <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
          <stop offset="20%" stopColor="#10b981" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#34d399" stopOpacity="0.3" />
          <stop offset="80%" stopColor="#10b981" stopOpacity="0.5" />
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

/* ΓöÇΓöÇΓöÇ Scroll reveal hook ΓöÇΓöÇΓöÇ */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function RevealSection({ children, className = '', delay = 0, ...rest }) {
  const [ref, visible] = useReveal(0.1);
  return (
    <div
      ref={ref}
      className={`lp-reveal ${visible ? 'lp-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...rest.style }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ΓöÇΓöÇΓöÇ Animated counter ΓöÇΓöÇΓöÇ */
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

/* ΓöÇΓöÇΓöÇ Data ΓöÇΓöÇΓöÇ */
const howItWorks = [
  {
    step: '01',
    title: 'Describe your goal',
    desc: 'Type anything in plain language ΓÇö "Learn React in 3 months" or "Build a SaaS by December."',
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
    step: '02',
    title: 'AI builds your roadmap',
    desc: 'Gemini creates phases, milestones, and step-by-step tasks ΓÇö tailored to your timeline and skill level.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <path d="M8 32 L16 18 L24 24 L32 8" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="32" r="3" fill="#10b981" opacity="0.5" />
        <circle cx="16" cy="18" r="3" fill="#34d399" opacity="0.5" />
        <circle cx="24" cy="24" r="3" fill="#10b981" opacity="0.5" />
        <circle cx="32" cy="8" r="3" fill="#6ee7b7" opacity="0.5" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Track, journal, grow',
    desc: 'Daily tasks, natural journaling, and smart nudges keep your momentum alive ΓÇö even when motivation dips.',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" width="40" height="40">
        <rect x="6" y="6" width="28" height="28" rx="6" stroke="#10b981" strokeWidth="1.5" fill="rgba(16,185,129,0.08)" />
        <path d="M12 20l4 4 8-10" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const features = [
  { title: 'AI Roadmap Builder', desc: 'Describe your goal in plain language. Gemini builds a structured, phased roadmap tailored to your context.', accent: '#10b981', size: 'large' },
  { title: 'Smart Daily Tasks', desc: 'AI generates your daily to-do list based on your current roadmap step and available time.', accent: '#34d399', size: 'small' },
  { title: 'Natural Journal', desc: 'Write freely about your day. Gemini reads it and maps your activity to roadmap progress.', accent: '#6ee7b7', size: 'small' },
  { title: 'Intelligent Nudges', desc: 'Stuck on a step? The AI detects momentum drops and sends personalized motivational nudges.', accent: '#0d9488', size: 'small' },
  { title: 'Weekly Insights', desc: 'Get a Gemini-generated weekly summary: accomplishments, trends, and what to focus on next.', accent: '#059669', size: 'small' },
  { title: 'Adaptive Learning', desc: 'The system learns from your corrections and improves its understanding of your work style.', accent: '#10b981', size: 'large' },
];

const stats = [
  { value: 10, suffix: 's', label: 'To generate a roadmap' },
  { value: 98, suffix: '%', label: 'User satisfaction' },
  { value: 500, suffix: '+', label: 'Goals created' },
  { value: 24, suffix: '/7', label: 'AI-powered tracking' },
];

/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
   Landing Page Component
   ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */
export default function LandingPage() {
  return (
    <div className="lp-root">
      {/* ΓöÇΓöÇΓöÇ Animated mesh background ΓöÇΓöÇΓöÇ */}
      <div className="lp-mesh" aria-hidden="true">
        <div className="lp-mesh-orb lp-mesh-1" />
        <div className="lp-mesh-orb lp-mesh-2" />
        <div className="lp-mesh-orb lp-mesh-3" />
      </div>

      {/* Grid pattern overlay */}
      <div className="lp-grid-pattern" aria-hidden="true" />

      {/* ΓöÇΓöÇΓöÇ Navbar ΓöÇΓöÇΓöÇ */}
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

      {/* ΓöÇΓöÇΓöÇ Hero ΓöÇΓöÇΓöÇ */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-hero-left">
            {/* Badge */}
            <RevealSection delay={0}>
              <div className="lp-badge">
                <span className="lp-badge-dot" />
                Powered by Gemini AI
              </div>
            </RevealSection>

            <RevealSection delay={100}>
              <h1 className="lp-hero-h1">
                Your goals deserve<br />
                <span className="lp-gradient-text">a real plan.</span>
              </h1>
            </RevealSection>

            <RevealSection delay={200}>
              <p className="lp-hero-sub">
                StepsBuilder turns ambitions into AI-powered roadmaps ΓÇö then keeps you moving with daily tasks, journal tracking, and intelligent nudges.
              </p>
            </RevealSection>

            <RevealSection delay={300}>
              <div className="lp-hero-ctas">
                <Link to="/login" className="lp-cta-primary" id="btn-get-started-hero">
                  Start Building for Free <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="lp-cta-secondary">
                  See how it works
                </a>
              </div>
            </RevealSection>

            <RevealSection delay={400}>
              <div className="lp-hero-proof">
                <div className="lp-hero-avatars">
                  {['≡ƒÄ»','ΓÜí','≡ƒÜÇ','≡ƒîƒ','≡ƒÆí'].map((e, i) => (
                    <div key={i} className="lp-hero-avatar" style={{ zIndex: 5 - i, marginLeft: i > 0 ? -8 : 0 }}>{e}</div>
                  ))}
                </div>
                <span className="lp-hero-proof-text">
                  <strong>500+</strong> builders already growing
                </span>
              </div>
            </RevealSection>
          </div>

          <div className="lp-hero-right">
            <RevealSection delay={200}>
              <HeroIllustration />
            </RevealSection>
          </div>
        </div>

        {/* Decorative roadmap path */}
        <RoadmapPathSVG />
      </section>

      {/* ΓöÇΓöÇΓöÇ Stats Bar ΓöÇΓöÇΓöÇ */}
      <section className="lp-stats">
        <div className="lp-stats-inner">
          {stats.map(({ value, suffix, label }, i) => (
            <RevealSection key={label} delay={i * 100} className="lp-stat">
              <div className="lp-stat-value">
                <Counter end={value} suffix={suffix} />
              </div>
              <div className="lp-stat-label">{label}</div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇ How It Works ΓöÇΓöÇΓöÇ */}
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
              {i < 2 && <div className="lp-step-connector" aria-hidden="true" />}
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇ Features Bento Grid ΓöÇΓöÇΓöÇ */}
      <section className="lp-section" id="features">
        <RevealSection>
          <div className="lp-section-header">
            <span className="lp-section-tag">Features</span>
            <h2 className="lp-section-title">Everything your goals<br /><span className="lp-gradient-text">actually need</span></h2>
            <p className="lp-section-sub">Built different from todo apps. Built for people with real ambitions.</p>
          </div>
        </RevealSection>

        <div className="lp-bento">
          {features.map(({ title, desc, accent, size }, i) => (
            <RevealSection key={title} delay={i * 80} className={`lp-bento-card lp-bento-${size}`}>
              <div className="lp-bento-accent" style={{ background: accent }} />
              <h3 className="lp-bento-title">{title}</h3>
              <p className="lp-bento-desc">{desc}</p>
              <div className="lp-bento-glow" style={{ background: `radial-gradient(circle at 30% 80%, ${accent}18, transparent 70%)` }} />
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ΓöÇΓöÇΓöÇ Social Proof ΓöÇΓöÇΓöÇ */}
      <section className="lp-section">
        <RevealSection>
          <div className="lp-proof-card">
            <div className="lp-proof-quote">"StepsBuilder replaced my Notion boards, to-do apps, and motivational podcast subscriptions ΓÇö all in one."</div>
            <div className="lp-proof-author">
              <div className="lp-proof-avatar">R</div>
              <div>
                <div className="lp-proof-name">Ravi M.</div>
                <div className="lp-proof-role">Software Developer</div>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ΓöÇΓöÇΓöÇ Final CTA ΓöÇΓöÇΓöÇ */}
      <section className="lp-cta-section">
        <div className="lp-cta-glow" aria-hidden="true" />
        <RevealSection>
          <div className="lp-cta-card">
            <h2 className="lp-cta-title">Ready to build your<br /><span className="lp-gradient-text">first roadmap?</span></h2>
            <p className="lp-cta-sub">Free to use. No credit card. Your first AI roadmap takes 10 seconds.</p>
            <div className="lp-cta-features">
              {['AI-powered roadmaps', 'Smart daily tasks', 'Journal tracking', 'Intelligent nudges'].map((f) => (
                <div key={f} className="lp-cta-feature">
                  <Check size={14} /> {f}
                </div>
              ))}
            </div>
            <Link to="/login" className="lp-cta-primary lp-cta-btn" id="btn-cta-final">
              Create Your Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </RevealSection>
      </section>

      {/* ΓöÇΓöÇΓöÇ Footer ΓöÇΓöÇΓöÇ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <img src={stepsIcon} alt="Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            <span className="lp-footer-name">StepsBuilder</span>
            <span className="lp-footer-copy">┬⌐ 2026 ┬╖ All rights reserved</span>
          </div>
          <div className="lp-footer-links">
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a key={l} href="#" className="lp-footer-link">{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ΓöÇΓöÇΓöÇ Scoped Styles ΓöÇΓöÇΓöÇ */}
      <style>{`
/* ΓòÉΓòÉΓòÉ ROOT ΓòÉΓòÉΓòÉ */
.lp-root {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #050f0a;
  color: rgba(255,255,255,0.93);
}

/* ΓòÉΓòÉΓòÉ ANIMATED MESH BACKGROUND ΓòÉΓòÉΓòÉ */
.lp-mesh {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.lp-mesh-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}
.lp-mesh-1 {
  width: 600px; height: 600px;
  top: -10%; left: -5%;
  background: radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%);
  animation: meshFloat1 18s ease-in-out infinite;
}
.lp-mesh-2 {
  width: 500px; height: 500px;
  top: 40%; right: -10%;
  background: radial-gradient(circle, rgba(5,150,105,0.12), transparent 70%);
  animation: meshFloat2 22s ease-in-out infinite;
}
.lp-mesh-3 {
  width: 400px; height: 400px;
  bottom: -5%; left: 30%;
  background: radial-gradient(circle, rgba(13,148,136,0.1), transparent 70%);
  animation: meshFloat3 15s ease-in-out infinite;
}
@keyframes meshFloat1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(60px,40px)} 66%{transform:translate(-30px,80px)} }
@keyframes meshFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-80px,-60px)} }
@keyframes meshFloat3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(50px,-40px)} }

/* ΓòÉΓòÉΓòÉ GRID PATTERN ΓòÉΓòÉΓòÉ */
.lp-grid-pattern {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%);
}

/* ΓòÉΓòÉΓòÉ REVEAL ANIMATION ΓòÉΓòÉΓòÉ */
.lp-reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.lp-reveal.lp-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ΓòÉΓòÉΓòÉ NAV ΓòÉΓòÉΓòÉ */
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

/* ΓòÉΓòÉΓòÉ HERO ΓòÉΓòÉΓòÉ */
.lp-hero {
  position: relative;
  z-index: 1;
  max-width: 1300px;
  margin: 0 auto;
  padding: clamp(100px,14vw,160px) clamp(16px,4vw,48px) 60px;
}
.lp-hero-content {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 72px;
  min-height: 540px;
}
.lp-hero-left { display: flex; flex-direction: column; gap: 0; }

/* Badge */
.lp-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.2);
  font-size: 13px;
  font-weight: 600;
  color: #34d399;
  margin-bottom: 28px;
  width: fit-content;
}
.lp-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: lpPulse 2s ease-in-out infinite;
}
@keyframes lpPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }

.lp-hero-h1 {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
}
.lp-gradient-text {
  background: linear-gradient(135deg, #10b981 0%, #34d399 40%, #6ee7b7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lp-hero-sub {
  font-size: clamp(15px, 1.8vw, 18px);
  color: rgba(255,255,255,0.55);
  line-height: 1.75;
  margin-bottom: 36px;
  max-width: 520px;
}

/* CTAs */
.lp-hero-ctas { display: flex; gap: 14px; margin-bottom: 40px; flex-wrap: wrap; }
.lp-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 700;
  font-size: 15px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 4px 20px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
  border: none;
  cursor: pointer;
}
.lp-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
}
.lp-cta-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: transparent;
  color: rgba(255,255,255,0.7);
  font-weight: 600;
  font-size: 15px;
  border-radius: 12px;
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.12);
  transition: all 0.2s;
}
.lp-cta-secondary:hover { border-color: rgba(16,185,129,0.4); color: #34d399; }

/* Social proof */
.lp-hero-proof { display: flex; align-items: center; gap: 14px; }
.lp-hero-avatars { display: flex; }
.lp-hero-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(16,185,129,0.12);
  border: 2px solid #050f0a;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
}
.lp-hero-proof-text { font-size: 13px; color: rgba(255,255,255,0.45); }
.lp-hero-proof-text strong { color: #34d399; }

/* Hero SVG */
.lp-hero-svg { width: 100%; max-width: 680px; height: auto; filter: drop-shadow(0 24px 48px rgba(16,185,129,0.12)); }
.lp-hero-right { display: flex; justify-content: center; align-items: center; }

/* Roadmap path */
.lp-roadmap-path { width: 100%; height: auto; margin-top: -20px; opacity: 0.5; }

/* SVG animations */
.lp-float { animation: lpFloat 6s ease-in-out infinite; }
@keyframes lpFloat { 0%,100%{transform:translate(0,0)} 50%{transform:translate(8px,-12px)} }

.lp-card-appear { opacity: 0; animation: lpCardIn 0.6s ease forwards; }
@keyframes lpCardIn { to { opacity: 1; } }

.lp-float-card { animation: lpFloatCard 4s ease-in-out infinite; }
@keyframes lpFloatCard { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-4px,-8px)} }

.lp-dash-anim { animation: lpDash 20s linear infinite; }
@keyframes lpDash { to { stroke-dashoffset: -200; } }

.lp-pulse-node { animation: lpNodePulse 2s ease-in-out infinite; }
@keyframes lpNodePulse { 0%,100%{opacity:0.4;r:3} 50%{opacity:1;r:5} }

.lp-progress-grow { animation: lpGrow 2s ease forwards; }
@keyframes lpGrow { from { width: 0; } }

/* ΓòÉΓòÉΓòÉ STATS ΓòÉΓòÉΓòÉ */
.lp-stats {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.lp-stats-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 48px clamp(16px,4vw,48px);
}
.lp-stat { text-align: center; }
.lp-stat-value {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 800;
  background: linear-gradient(135deg, #10b981, #6ee7b7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.1;
}
.lp-stat-label {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  margin-top: 6px;
  font-weight: 500;
}

/* ΓòÉΓòÉΓòÉ SECTIONS ΓòÉΓòÉΓòÉ */
.lp-section {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(80px,10vw,120px) clamp(16px,4vw,48px);
}
.lp-section-header { text-align: center; margin-bottom: 64px; }
.lp-section-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: #10b981;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.lp-section-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 16px;
}
.lp-section-sub {
  font-size: 16px;
  color: rgba(255,255,255,0.45);
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ΓòÉΓòÉΓòÉ HOW IT WORKS ΓÇö STEPS ΓòÉΓòÉΓòÉ */
.lp-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  position: relative;
}
.lp-step {
  position: relative;
  padding: 36px 28px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
}
.lp-step:hover {
  border-color: rgba(16,185,129,0.3);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(16,185,129,0.08);
}
.lp-step-num {
  position: absolute;
  top: 14px; right: 18px;
  font-family: 'Outfit', sans-serif;
  font-size: 72px; font-weight: 900;
  color: rgba(16,185,129,0.05);
  line-height: 1;
  user-select: none;
}
.lp-step-icon { margin-bottom: 20px; }
.lp-step-title {
  font-size: 20px; font-weight: 700; margin-bottom: 10px;
  font-family: 'Outfit', sans-serif;
}
.lp-step-desc { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.75; }
.lp-step-connector {
  display: none; /* Hidden on mobile, shown on desktop via grid positioning */
}

/* ΓòÉΓòÉΓòÉ BENTO GRID ΓòÉΓòÉΓòÉ */
.lp-bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(200px, auto);
  gap: 20px;
}
.lp-bento-card {
  position: relative;
  padding: 32px 28px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
}
.lp-bento-card:hover {
  border-color: rgba(16,185,129,0.25);
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(0,0,0,0.3);
}
.lp-bento-large { grid-column: span 2; }
.lp-bento-accent {
  width: 4px; height: 32px;
  border-radius: 4px;
  margin-bottom: 20px;
  opacity: 0.6;
}
.lp-bento-title {
  font-size: 20px; font-weight: 700; margin-bottom: 10px;
  font-family: 'Outfit', sans-serif;
}
.lp-bento-desc { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.75; max-width: 480px; }
.lp-bento-glow {
  position: absolute; inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}
.lp-bento-card:hover .lp-bento-glow { opacity: 1; }

/* ΓòÉΓòÉΓòÉ SOCIAL PROOF ΓòÉΓòÉΓòÉ */
.lp-proof-card {
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 40px;
  background: rgba(16,185,129,0.04);
  border: 1px solid rgba(16,185,129,0.12);
  border-radius: 24px;
  text-align: center;
}
.lp-proof-quote {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(18px, 2.5vw, 24px);
  font-weight: 500;
  font-style: italic;
  line-height: 1.65;
  color: rgba(255,255,255,0.8);
  margin-bottom: 32px;
}
.lp-proof-author { display: flex; align-items: center; gap: 14px; justify-content: center; }
.lp-proof-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 16px; color: white;
}
.lp-proof-name { font-weight: 600; font-size: 15px; }
.lp-proof-role { font-size: 13px; color: rgba(255,255,255,0.4); }

/* ΓòÉΓòÉΓòÉ FINAL CTA ΓòÉΓòÉΓòÉ */
.lp-cta-section {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: clamp(60px,8vw,100px) clamp(16px,4vw,48px);
}
.lp-cta-glow {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  width: 600px; height: 400px;
  background: radial-gradient(ellipse, rgba(16,185,129,0.1), transparent 70%);
  pointer-events: none;
}
.lp-cta-card {
  max-width: 640px;
  margin: 0 auto;
  padding: clamp(40px,6vw,64px);
  background: rgba(16,185,129,0.05);
  border: 1px solid rgba(16,185,129,0.18);
  border-radius: 24px;
  backdrop-filter: blur(24px);
  position: relative;
}
.lp-cta-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 14px;
}
.lp-cta-sub {
  color: rgba(255,255,255,0.5);
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 28px;
}
.lp-cta-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 20px;
  margin-bottom: 36px;
}
.lp-cta-feature {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #34d399;
  font-weight: 500;
}
.lp-cta-btn { width: 100%; justify-content: center; font-size: 16px; padding: 16px 32px; }

/* ΓòÉΓòÉΓòÉ FOOTER ΓòÉΓòÉΓòÉ */
.lp-footer {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.lp-footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(20px,3vw,28px) clamp(16px,4vw,48px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.lp-footer-brand { display: flex; align-items: center; gap: 10px; }
.lp-footer-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 700; font-size: 15px;
  background: linear-gradient(135deg,#10b981,#34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.lp-footer-copy { font-size: 13px; color: rgba(255,255,255,0.3); }
.lp-footer-links { display: flex; gap: 24px; }
.lp-footer-link {
  font-size: 13px;
  color: rgba(255,255,255,0.35);
  text-decoration: none;
  transition: color 0.2s;
}
.lp-footer-link:hover { color: rgba(255,255,255,0.7); }

/* ΓòÉΓòÉΓòÉ RESPONSIVE ΓòÉΓòÉΓòÉ */
@media (max-width: 900px) {
  .lp-hero-content { grid-template-columns: 1fr; text-align: center; gap: 48px; }
  .lp-hero-left { align-items: center; }
  .lp-hero-sub { margin-left: auto; margin-right: auto; }
  .lp-hero-ctas { justify-content: center; }
  .lp-hero-proof { justify-content: center; }
  .lp-badge { margin-left: auto; margin-right: auto; }
  .lp-hero-svg { max-width: 420px; }
  .lp-stats-inner { grid-template-columns: repeat(2, 1fr); gap: 32px; }
  .lp-steps { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
  .lp-bento { grid-template-columns: 1fr; }
  .lp-bento-large { grid-column: span 1; }
  .lp-nav-link:not(:last-child) { display: none; }
}

@media (max-width: 480px) {
  .lp-stats-inner { grid-template-columns: repeat(2, 1fr); gap: 24px; padding: 32px 16px; }
  .lp-stat-value { font-size: 28px; }
  .lp-proof-card { padding: 32px 24px; }
}
      `}</style>
    </div>
  );
}
