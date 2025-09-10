import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import "../styles/sidebar.scss";
import { useUser } from "../contexts/UserContext";

export default function SideBar() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((s) => !s);

  const slugify = (s) => {
    if (!s) return "user";
    let str = s.toString().trim();
    if (str.includes("@")) str = str.split("@")[0];
    const parts = str.split(/\s+/).slice(0, 2);
    const joined = parts.join(" ");
    return joined.toLowerCase().replace(/[^a-z0-9\u0400-\u04FF]+/gi, "-").replace(/^-+|-+$/g, "");
  };

  const profilePath = user ? `/profile/${slugify(user.displayName || user.email || user.uid)}~${user.uid}` : "/profile";

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">Telegram</h1>
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <span className="material-symbols-outlined">close</span> : <span className="material-symbols-outlined">menu</span>}
          </button>
        </div>
        <nav className={isMenuOpen ? "open" : ""}>
          <NavLink to={profilePath} onClick={toggleMenu}>
            <span className="material-symbols-outlined">account_circle</span>
            Профиль
          </NavLink>
          <NavLink to="/" onClick={toggleMenu}>
          <span className="material-symbols-outlined">chat_bubble</span>
            Чат
          </NavLink>
          <NavLink to="/settings" onClick={toggleMenu}>
            <span className="material-symbols-outlined">settings</span>
            Настройки
          </NavLink>
          <NavLink to="/arxiv" onClick={toggleMenu}>
            <span className="material-symbols-outlined">archive</span>
            Архив
          </NavLink>
          <NavLink to="/support" onClick={toggleMenu}>
            <span className="material-symbols-outlined">contact_support</span>
            Связаться с нами
          </NavLink>
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};