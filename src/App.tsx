import { useState } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  Settings, 
  Truck,
  Bell,
  LogOut,
  Building2,
  ShieldAlert,
  AlertOctagon,
  MapPin,
  User,
  Wifi
} from 'lucide-react';
import DashboardView from './components/DashboardView';
import MapView from './components/MapView';
import LoginScreen, { type Company } from './components/LoginScreen';
import { useFleetSimulation } from './hooks/useFleetSimulation';
import './App.css';

function MainApp({ currentCompany, onLogout }: { currentCompany: Company, onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const simulationData = useFleetSimulation(currentCompany.id);
  const { alerts, vehicles, metrics } = simulationData;

  const criticalCount = alerts.filter(a => a.type === 'critical' || a.type === 'warning').length;
  const initials = currentCompany.name.substring(0, 2).toUpperCase();
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;

  return (
    <div className="layout animate-slide-in">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="logo-container">
          <div className="logo-icon">
            <Truck size={24} color="var(--accent-blue)" />
          </div>
          <h1>FleetIQ <span className="ai-badge">AI</span></h1>
        </div>

        {/* Tenant Indicator */}
        <div className="tenant-indicator">
          <Building2 size={16} className="tenant-icon" />
          <div className="tenant-info">
            <span className="tenant-label">Workspace</span>
            <span className="tenant-name">{currentCompany.name}</span>
          </div>
        </div>

        {/* Live status in sidebar */}
        <div className="sidebar-live-status">
          <span className="dot pulse-green"></span>
          <span>{activeVehicles} vehicles live</span>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Operations</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <Map size={20} />
            <span>Live Map</span>
            <span className="vehicle-count-badge">{vehicles.length}</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <AlertTriangle size={20} />
            <span>Alerts & AI</span>
            {criticalCount > 0 && <div className="badge pulse">{criticalCount}</div>}
          </button>

          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-header glass-panel">
          <div className="header-title">
            <h2>{activeTab === 'dashboard' ? 'Global Operations Overview' : 
                 activeTab === 'map' ? 'Live Fleet Tracking' : 
                 activeTab === 'alerts' ? 'Predictive AI Alerts' :
                 'Account Settings'}</h2>
            <p className="subtitle">
              {currentCompany.name} • Hyderabad Region • {vehicles.length} vehicles tracked
            </p>
          </div>
          
          <div className="header-actions">
            <div className="status-indicator">
              <span className="dot pulse-green"></span>
              <Wifi size={14} />
              <span>Live Feed</span>
            </div>
            <button 
              className="icon-btn bell-btn"
              onClick={() => setActiveTab('alerts')}
              style={{ position: 'relative' }}
            >
              <Bell size={20} />
              {criticalCount > 0 && (
                <span className="bell-badge">{criticalCount}</span>
              )}
            </button>
            <div className="avatar-container">
              <div className="avatar">
                <span>{initials}</span>
              </div>
              <div className="avatar-info">
                <span className="avatar-name">{currentCompany.user?.name || currentCompany.name}</span>
                <span className="avatar-email">{currentCompany.user?.email || 'admin'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content-scroll">
          {activeTab === 'dashboard' && <DashboardView data={simulationData} />}
          {activeTab === 'map' && <MapView data={simulationData} />}
          {activeTab === 'alerts' && <AlertsView alerts={alerts} metrics={metrics} />}
          {activeTab === 'settings' && <SettingsView company={currentCompany} onLogout={onLogout} />}
        </div>
      </main>
    </div>
  );
}

// Full Alerts View
function AlertsView({ alerts, metrics }: { alerts: ReturnType<typeof useFleetSimulation>['alerts'], metrics: ReturnType<typeof useFleetSimulation>['metrics'] }) {
  return (
    <div className="alerts-page">
      <div className="alerts-page-stats">
        <div className="stat-chip critical">
          <ShieldAlert size={16} />
          <span>{alerts.filter(a => a.type === 'critical').length} Critical</span>
        </div>
        <div className="stat-chip warning">
          <AlertOctagon size={16} />
          <span>{alerts.filter(a => a.type === 'warning').length} Warnings</span>
        </div>
        <div className="stat-chip info">
          <MapPin size={16} />
          <span>{alerts.filter(a => a.type === 'info').length} Info</span>
        </div>
        <div className="stat-chip score">
          <span>Efficiency: {metrics.efficiencyScore}/100</span>
        </div>
      </div>

      <div className="alerts-full-list glass-panel">
        <div className="section-header" style={{ padding: '1.5rem 1.5rem 0' }}>
          <h3>Predictive Ops Engine Feed</h3>
          <span className="live-badge">Live</span>
        </div>
        <div className="alerts-list-full">
          {alerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No alerts yet. System is monitoring...
            </div>
          )}
          {alerts.map((alert, i) => (
            <div key={alert.id + i} className={`alert-item-full animate-slide-in ${alert.type}`}>
              <div className="alert-icon-full">
                {alert.type === 'critical' ? <ShieldAlert size={20} /> : 
                 alert.type === 'warning' ? <AlertOctagon size={20} /> : 
                 <MapPin size={20} />}
              </div>
              <div className="alert-content-full">
                <p className="alert-msg">{alert.message}</p>
                <span className="alert-time-full">
                  {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <span className={`alert-severity-badge ${alert.type}`}>
                {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Settings View
function SettingsView({ company, onLogout }: { company: Company, onLogout: () => void }) {
  return (
    <div className="settings-page">
      <div className="settings-section glass-panel">
        <h3><User size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />Workspace Profile</h3>
        <div className="settings-row">
          <span>Company Name</span>
          <strong>{company.name}</strong>
        </div>
        <div className="settings-row">
          <span>Workspace ID</span>
          <code className="settings-code">{company.id}</code>
        </div>
        <div className="settings-row">
          <span>Fleet Type</span>
          <strong style={{ textTransform: 'capitalize' }}>{company.type}</strong>
        </div>
        <div className="settings-row">
          <span>Admin Email</span>
          <strong>{company.user?.email || 'N/A'}</strong>
        </div>
        <div className="settings-row">
          <span>Administrator</span>
          <strong>{company.user?.name || 'Admin'}</strong>
        </div>
      </div>

      <div className="settings-section glass-panel">
        <h3>System Status</h3>
        <div className="settings-row">
          <span>WebSocket Connection</span>
          <span style={{ color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="dot pulse-green"></span> Connected
          </span>
        </div>
        <div className="settings-row">
          <span>Backend API</span>
          <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>localhost:5000 ✓</span>
        </div>
        <div className="settings-row">
          <span>Telemetry Engine</span>
          <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Running (3s intervals)</span>
        </div>
        <div className="settings-row">
          <span>Data Isolation</span>
          <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Tenant-Scoped ✓</span>
        </div>
      </div>

      <div className="settings-section glass-panel danger-zone">
        <h3 style={{ color: 'var(--accent-red)' }}>Session</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Logging out will disconnect the live telemetry stream and return you to the login screen.
        </p>
        <button className="danger-btn" onClick={onLogout}>
          <LogOut size={16} />
          Secure Logout from {company.name}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);

  if (!currentCompany) {
    return <LoginScreen onLogin={setCurrentCompany} />;
  }

  return <MainApp currentCompany={currentCompany} onLogout={() => setCurrentCompany(null)} />;
}

export default App;
