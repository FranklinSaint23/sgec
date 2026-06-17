import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AddNaiss from '../actes/naissance/AddNaiss';
import ListNaiss from '../actes/naissance/ListNaiss';
import EditNaiss from '../actes/naissance/EditNaiss';
import CopieNaiss from '../copie/naissance/CopieNaiss';
import AddMariage from '../actes/mariage/AddMariage';
import ListMariage from '../actes/mariage/ListMariage';
import EditMariage from '../actes/mariage/EditMariage';
import CopieMariage from '../copie/mariage/CopieMariage';
import AddDeces from '../actes/deces/AddDeces';
import ListDeces from '../actes/deces/ListDeces';
import EditDeces from '../actes/deces/EditDeces';
import CopieDeces from '../copie/deces/CopieDeces';
import Parametres from '../pages/Parametres';
import Notifications from '../pages/Notifications';
import Profil from '../pages/Profil';
import Board from '../pages/board';
import AddUsers from '../users/AddUsers';
import ListUsers from '../users/ListUsers';
import Mentions from '../pages/Mentions';
import Historique from '../pages/Historique';
import Statistiques from '../pages/Statistiques';
import Sauvegarde from '../pages/Sauvegarde';
import EditUsers from '../users/EditUsers';
import Chatbot from './Chatbot';
import AlertesAnomalies from './AlertesAnomalies';
import AnalytiqueIA from '../pages/AnalytiqueIA';
import Carte from '../pages/Carte';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/eact.css';

const PAGE_TITLES = {
  board: 'Tableau de bord', add_users: 'Ajouter un utilisateur', list_users: 'Utilisateurs',
  edit_users: 'Modifier utilisateur', parametres: 'Paramètres', notifications: 'Notifications',
  acte_naissance: 'Nouvelle naissance', list_naiss: 'Actes de naissance', edit_naiss: 'Modifier naissance',
  copie_naissance: 'Duplicata — Naissance', acte_deces: 'Nouveau décès', list_deces: 'Actes de décès',
  edit_deces: 'Modifier décès', copie_deces: 'Duplicata — Décès', acte_mariage: 'Nouveau mariage',
  list_mariage: 'Actes de mariage', edit_mariage: 'Modifier mariage', copie_mariage: 'Duplicata — Mariage',
  mentions: 'Mentions marginales', historique: 'Historique', statistiques: 'Statistiques',
  sauvegarde: 'Sauvegarde & Export', profil: 'Mon profil', analytique_ia: 'Analytique IA',
  carte: 'Carte géographique des actes — Cameroun',
};

function Dashboard() {
  const userRole = localStorage.getItem('userRole') || 'user';
  const userName = localStorage.getItem('userName') || 'Utilisateur';
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page') || 'board';

  const [collapsed,    setCollapsed]    = useState(false);
  const [usersOpen,    setUsersOpen]    = useState(false);
  const [actesOpen,    setActesOpen]    = useState(false);
  const [copiesOpen,   setCopiesOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const renderContent = () => {
    switch (page) {
      case 'add_users':       return <AddUsers />;
      case 'list_users':      return <ListUsers />;
      case 'edit_users':      return <EditUsers />;
      case 'parametres':      return <Parametres />;
      case 'notifications':   return <Notifications />;
      case 'acte_naissance':  return <AddNaiss />;
      case 'list_naiss':      return <ListNaiss />;
      case 'edit_naiss':      return <EditNaiss />;
      case 'copie_naissance': return <CopieNaiss />;
      case 'acte_deces':      return <AddDeces />;
      case 'list_deces':      return <ListDeces />;
      case 'edit_deces':      return <EditDeces />;
      case 'copie_deces':     return <CopieDeces />;
      case 'acte_mariage':    return <AddMariage />;
      case 'list_mariage':    return <ListMariage />;
      case 'edit_mariage':    return <EditMariage />;
      case 'copie_mariage':   return <CopieMariage />;
      case 'mentions':        return <Mentions />;
      case 'historique':      return <Historique />;
      case 'statistiques':    return <Statistiques />;
      case 'sauvegarde':      return <Sauvegarde />;
      case 'profil':          return <Profil />;
      case 'analytique_ia':   return <AnalytiqueIA />;
      case 'carte':           return <Carte />;
      default:                return <Board />;
    }
  };

  const sidebarW = collapsed ? 'var(--sidebar-w-sm)' : 'var(--sidebar-w)';

  // Helpers
  const navCls  = (keys) => `ea-nav-link${(Array.isArray(keys) ? keys : [keys]).includes(page) ? ' active' : ''}`;
  const subCls  = (key)  => `ea-sub-link${page === key ? ' active' : ''}`;

  return (
    <div style={{ display: 'flex' }}>

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className={`ea-sidebar${collapsed ? ' collapsed' : ''}`}>

        {/* Logo */}
        <div className="ea-sidebar-logo">
          <img src={`${process.env.PUBLIC_URL}/assets/e-act.png`} alt="logo" onError={(e) => { e.target.style.display = 'none'; }} />
          {!collapsed && (
            <div className="ea-logo-text">
              <span className="e">E</span>-<span className="ac">AC</span><span className="t">T</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="ea-sidebar-nav">

          {/* ─ PRINCIPAL ─ */}
          {!collapsed && <div className="ea-nav-section">Principal</div>}

          <Link to="/dashboard?page=board" className={navCls('board')} title="Tableau de bord">
            <i className="bi bi-speedometer2"></i>
            {!collapsed && <span>Tableau de bord</span>}
          </Link>

          {/* ─ GESTION ─ (une seule fois) */}
          {!collapsed && <div className="ea-nav-section">Gestion</div>}

          {/* Utilisateurs (admin seulement) */}
          {userRole === 'admin' && (
            <>
              <button
                className={navCls(['add_users', 'list_users', 'edit_users'])}
                onClick={() => setUsersOpen(!usersOpen)}
                title="Utilisateurs"
              >
                <i className="bi bi-people"></i>
                {!collapsed && <><span style={{ flex: 1 }}>Utilisateurs</span><i className={`bi ${usersOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ fontSize: '.7rem' }}></i></>}
              </button>
              {usersOpen && !collapsed && (
                <div className="ea-submenu">
                  <Link to="/dashboard?page=add_users"  className={subCls('add_users')}><i className="bi bi-dot fs-5"></i>Ajouter</Link>
                  <Link to="/dashboard?page=list_users" className={subCls('list_users')}><i className="bi bi-dot fs-5"></i>Lister</Link>
                </div>
              )}
            </>
          )}

          {/* Actes (tout le monde) */}
          <button
            className={navCls(['acte_naissance', 'list_naiss', 'acte_deces', 'list_deces', 'acte_mariage', 'list_mariage'])}
            onClick={() => setActesOpen(!actesOpen)}
            title="Actes"
          >
            <i className="bi bi-file-earmark-text"></i>
            {!collapsed && <><span style={{ flex: 1 }}>Actes</span><i className={`bi ${actesOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ fontSize: '.7rem' }}></i></>}
          </button>
          {actesOpen && !collapsed && (
            <div className="ea-submenu">
              <Link to="/dashboard?page=list_naiss"   className={subCls('list_naiss')}><i className="bi bi-dot fs-5"></i>Naissances</Link>
              <Link to="/dashboard?page=list_mariage" className={subCls('list_mariage')}><i className="bi bi-dot fs-5"></i>Mariages</Link>
              <Link to="/dashboard?page=list_deces"   className={subCls('list_deces')}><i className="bi bi-dot fs-5"></i>Décès</Link>
            </div>
          )}

          {/* Duplicata (admin seulement) */}
          {userRole === 'admin' && (
            <>
              <button
                className={navCls(['copie_naissance', 'copie_mariage', 'copie_deces'])}
                onClick={() => setCopiesOpen(!copiesOpen)}
                title="Duplicata"
              >
                <i className="bi bi-shield-check"></i>
                {!collapsed && <><span style={{ flex: 1 }}>Duplicata</span><i className={`bi ${copiesOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} style={{ fontSize: '.7rem' }}></i></>}
              </button>
              {copiesOpen && !collapsed && (
                <div className="ea-submenu">
                  <Link to="/dashboard?page=copie_naissance" className={subCls('copie_naissance')}><i className="bi bi-dot fs-5"></i>Naissance</Link>
                  <Link to="/dashboard?page=copie_mariage"   className={subCls('copie_mariage')}><i className="bi bi-dot fs-5"></i>Mariage</Link>
                  <Link to="/dashboard?page=copie_deces"     className={subCls('copie_deces')}><i className="bi bi-dot fs-5"></i>Décès</Link>
                </div>
              )}
            </>
          )}

          {/* ─ OUTILS ─ */}
          {!collapsed && <div className="ea-nav-section">Outils</div>}

          <Link to="/dashboard?page=mentions"      className={navCls('mentions')}      title="Mentions marginales">
            <i className="bi bi-journal-text"></i>
            {!collapsed && <span>Certificats</span>}
          </Link>

          {userRole === 'admin' && (
            <Link to="/dashboard?page=historique"  className={navCls('historique')}  title="Historique">
              <i className="bi bi-clock-history"></i>
              {!collapsed && <span>Historique</span>}
            </Link>
          )}

          <Link to="/dashboard?page=carte" className={navCls('carte')} title="Carte des actes">
            <i className="bi bi-map"></i>
            {!collapsed && <span>Carte des actes</span>}
          </Link>

          <Link to="/dashboard?page=statistiques"  className={navCls('statistiques')}  title="Statistiques">
            <i className="bi bi-bar-chart-line"></i>
            {!collapsed && <span>Statistiques</span>}
          </Link>

          <Link to="/dashboard?page=analytique_ia" className={navCls('analytique_ia')} title="Analytique IA">
            <i className="bi bi-robot"></i>
            {!collapsed && <span>Analytique IA</span>}
          </Link>

          <Link to="/dashboard?page=sauvegarde"    className={navCls('sauvegarde')}    title="Sauvegarde">
            <i className="bi bi-cloud-download"></i>
            {!collapsed && <span>Sauvegarde</span>}
          </Link>

        </nav>

        {/* Footer utilisateur */}
        <div className="ea-sidebar-footer">
          <div className="ea-user-chip">
            <div className="ea-avatar">{userName.charAt(0).toUpperCase()}</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div className="ea-user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                <div className="ea-user-role">{userRole}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ══════════ HEADER ══════════ */}
      <header className="ea-header" style={{ left: sidebarW }}>
        <button className="ea-toggle-btn" onClick={() => setCollapsed(!collapsed)} title="Réduire/Agrandir sidebar">
          <i className={`bi ${collapsed ? 'bi-layout-sidebar' : 'bi-layout-sidebar-reverse'}`}></i>
        </button>

        <span className="ea-header-title">{PAGE_TITLES[page] || 'E-ACT'}</span>

        <Link to="/dashboard?page=notifications" className="ea-header-btn ea-header-badge" title="Notifications">
          <i className="bi bi-bell"></i>
        </Link>

        <Link to="/dashboard?page=parametres" className="ea-header-btn" title="Paramètres">
          <i className="bi bi-gear"></i>
        </Link>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            className="d-flex align-items-center gap-2 border-0 bg-transparent"
            style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="ea-avatar" style={{ width: 32, height: 32, fontSize: '.8rem' }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            {!collapsed && <span style={{ fontSize: '.84rem', fontWeight: 600, color: '#334155' }}>{userRole}</span>}
            <i className="bi bi-chevron-down" style={{ fontSize: '.65rem', color: '#94a3b8' }}></i>
          </button>

          {dropdownOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setDropdownOpen(false)} />
              <div style={{
                position: 'absolute', right: 0, top: '110%', zIndex: 1000,
                background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                boxShadow: '0 8px 30px rgba(0,0,0,.12)', minWidth: 190, padding: '6px',
              }}>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2 rounded" style={{ fontSize: '.85rem' }}
                  to="/dashboard?page=profil" onClick={() => setDropdownOpen(false)}>
                  <i className="bi bi-person text-primary"></i> Profil
                </Link>
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2 rounded" style={{ fontSize: '.85rem' }}
                  to="/dashboard?page=parametres" onClick={() => setDropdownOpen(false)}>
                  <i className="bi bi-gear text-secondary"></i> Paramètres
                </Link>
                <hr className="my-1" />
                <Link className="dropdown-item d-flex align-items-center gap-2 py-2 rounded text-danger" style={{ fontSize: '.85rem' }}
                  to="/logout" onClick={() => setDropdownOpen(false)}>
                  <i className="bi bi-box-arrow-right"></i> Déconnexion
                </Link>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ══════════ CONTENU ══════════ */}
      <main style={{
        marginLeft: sidebarW,
        paddingTop: 'var(--header-h)',
        minHeight: '100vh',
        background: '#f1f5f9',
        transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)',
        overflowY: 'auto',
        flex: 1,
        minWidth: 0,
        width: 0,
      }}>
        <div style={{ padding: '24px 28px' }}>
          {userRole === 'admin' && page === 'board' && <AlertesAnomalies />}
          {renderContent()}
        </div>
      </main>

      <Chatbot />
    </div>
  );
}

export default Dashboard;
