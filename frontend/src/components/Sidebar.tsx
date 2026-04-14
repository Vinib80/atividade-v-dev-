import { NavLink } from 'react-router-dom';
import { LayoutGrid, BarChart2, Package } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Commerce HQ</h1>
        <p>Painel do Gerente</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutGrid size={18} /> Catálogo
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart2 size={18} /> Estatísticas
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <Package size={13} style={{ display: 'inline', marginRight: 5 }} />
        Gestão de E-Commerce
      </div>
    </aside>
  );
}
