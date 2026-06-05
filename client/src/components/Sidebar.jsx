import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, CheckSquare, BookOpen,
  BarChart2, Bell, Settings, LogOut, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/goals',     icon: Target,          label: 'My Goals' },
  { to: '/tasks',     icon: CheckSquare,     label: "Today's Tasks" },
  { to: '/journal',   icon: BookOpen,        label: 'Journal' },
  { to: '/insights',  icon: BarChart2,       label: 'Insights' },
  { to: '/nudges',    icon: Bell,            label: 'Nudges' },
];

// The 5 most important routes for bottom nav
const bottomNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/goals',     icon: Target,          label: 'Goals' },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks' },
  { to: '/journal',   icon: BookOpen,        label: 'Journal' },
  { to: '/insights',  icon: BarChart2,       label: 'Insights' },
];

export default function Sidebar({ nudgeCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {/* ── Desktop Sidebar (hidden on mobile via CSS) ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="nav-logo">
          <div className="nav-logo-text">StepsBuilder</div>
          <div className="nav-logo-sub">Personal Goal OS</div>
        </div>

        {/* Nav items */}
        <nav className="nav-section" style={{ flex: 1 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              {label}
              {label === 'Nudges' && nudgeCount > 0 && (
                <span className="nav-badge">{nudgeCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="nav-bottom">
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={18} /> Settings
          </NavLink>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px 4px', marginTop: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={10} />
                  {user.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-ghost btn-icon" title="Sign out" style={{ width: 32, height: 32, padding: 6 }}>
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Bottom Navigation (mobile only, shown via CSS) ── */}
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
