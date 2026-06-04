import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Target, CheckSquare, BookOpen,
  BarChart2, Bell, Settings, LogOut, Zap, Menu, X
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

export default function Sidebar({ nudgeCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const closeMobile = () => setMobileOpen(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="nav-logo-text">StepsBuilder</div>
          <div className="nav-logo-sub">Personal Goal OS</div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={closeMobile}
          className="btn btn-ghost btn-icon sidebar-close-btn"
          style={{ width: 32, height: 32, padding: 6 }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="nav-section" style={{ flex: 1 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeMobile}
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
        <NavLink to="/settings" onClick={closeMobile} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
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
    </>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <div className="nav-logo-text" style={{ fontSize: 18 }}>StepsBuilder</div>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setMobileOpen(true)}
          style={{ width: 36, height: 36, padding: 6 }}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeMobile}
        />
      )}

      {/* ── Sidebar (desktop: fixed | mobile: slide-in) ── */}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <SidebarContent />
      </aside>
    </>
  );
}
