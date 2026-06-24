import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, CheckSquare, BookOpen,
  BarChart2, Bell, Settings, LogOut, Zap, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import stepsIcon from '../assets/steps-icon.png';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/goals',     icon: Target,          label: 'My Goals'      },
  { to: '/tasks',     icon: CheckSquare,     label: "Today's Tasks" },
  { to: '/journal',   icon: BookOpen,        label: 'Journal'       },
  { to: '/insights',  icon: BarChart2,       label: 'Insights'      },
  { to: '/nudges',    icon: Bell,            label: 'Nudges'        },
];

const bottomNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home'     },
  { to: '/goals',     icon: Target,          label: 'Goals'    },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks'    },
  { to: '/journal',   icon: BookOpen,        label: 'Journal'  },
  { to: '/settings',  icon: Settings,        label: 'Settings' },
];

export default function Sidebar({ nudgeCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Persist open state across page navigations
  const [open, setOpen] = useState(() => {
    try { return localStorage.getItem('sb-open') === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    document.body.classList.toggle('sb-open', open);
    return () => document.body.classList.remove('sb-open');
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try { localStorage.setItem('sb-open', String(next)); } catch {}
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {/* ── Mobile Topbar (visible only on mobile via CSS) ── */}
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={stepsIcon} alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
          <span style={{
            fontFamily: 'Outfit', fontSize: 17, fontWeight: 800,
            background: 'var(--gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>StepsBuilder</span>
        </div>
        {nudgeCount > 0 && (
          <Link to="/nudges" style={{ position: 'relative', color: 'var(--text-muted)', display: 'flex' }}>
            <Bell size={20} />
            <span style={{
              position: 'absolute', top: -5, right: -5,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--danger)', fontSize: 9, fontWeight: 700,
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{nudgeCount}</span>
          </Link>
        )}
      </div>

      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <aside className="sidebar">
        {/* Toggle button — OUTSIDE the clip wrapper so overflow:visible on aside lets it show */}
        <button
          className="sidebar-toggle"
          onClick={toggle}
          title={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ChevronRight size={13} className={`toggle-icon${open ? ' rotated' : ''}`} />
        </button>

        {/* Inner clip wrapper — clips content but NOT the toggle above */}
        <div style={{ width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Logo */}
        <div className="nav-logo" style={{ paddingLeft: 0, gap: 4 }}>
          <img src={stepsIcon} alt="Logo" style={{ width: 74, height: 74, objectFit: 'contain', marginLeft: -12 }} />
          <div className="nav-logo-text-wrap">
            <div className="nav-logo-text">StepsBuilder</div>
            <div className="nav-logo-sub">Personal Goal OS</div>
          </div>
        </div>


        {/* Nav items */}
        <nav className="nav-section" style={{ flex: 1 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={!open ? label : undefined}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={22} className="nav-icon" />
              <span className="nav-label">{label}</span>
              {label === 'Nudges' && nudgeCount > 0 && (
                <span className="nav-badge">{nudgeCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: settings + user */}
        <div className="nav-bottom">
          <NavLink
            to="/settings"
            title={!open ? 'Settings' : undefined}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Settings size={22} className="nav-icon" />
            <span className="nav-label">Settings</span>
          </NavLink>

          {user && (
            <div className="nav-user">
              <div className="nav-avatar">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div className="nav-user-info">
                <div className="nav-user-name">{user.name}</div>
                <div className="nav-user-plan">
                  <Zap size={10} />
                  {user.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-icon nav-logout"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
        </div>{/* end inner clip wrapper */}
      </aside>

      {/* ── Mobile Bottom Nav (shown only on mobile via CSS) ── */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {bottomNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => 'bottom-nav-item' + (isActive ? ' active' : '')}
            >
              <Icon size={22} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
