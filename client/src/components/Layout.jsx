import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { RiLogoutCircleRLine, RiMenuLine, RiUser3Line } from "react-icons/ri";
import { getRoleNavigation, roleGlyph } from "../config/navigation";
import { useAuth } from "../context/AuthContext";

function ActiveTitle({ items, pathname }) {
  const match = items.find((item) => pathname.startsWith(item.to)) || items[0];
  return match?.label || "Dashboard";
}

export default function Layout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigation = useMemo(() => getRoleNavigation(role), [role]);
  const RoleIcon = roleGlyph[role];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-head">
          <h5 className="brand-title">College Event Management</h5>
          <span className="role-badge">
            <RoleIcon size={15} />
            {role}
          </span>
          <h2>{navigation.title}</h2>
          <p>{navigation.subtitle}</p>
        </div>

        <nav className="sidebar-nav">
          {navigation.items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button type="button" className="ghost-action sidebar-logout" onClick={logout}>
          <span>Logout</span>
          <span className="action-icon">
            <RiLogoutCircleRLine size={14} />
          </span>
        </button>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Open navigation menu"
          >
            <RiMenuLine size={18} />
          </button>

          <div className="topbar-title">
            <h1>
              <ActiveTitle items={navigation.items} pathname={location.pathname} />
            </h1>
            <p>{navigation.subtitle}</p>
          </div>

          <div className="user-meta">
            <RiUser3Line size={14} />
            <span>{user?.name}</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {sidebarOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation menu"
        />
      ) : null}
    </div>
  );
}
