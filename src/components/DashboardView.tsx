import { 
  TrendingUp, 
  Clock, 
  AlertOctagon, 
  Activity, 
  ShieldAlert,
  Zap,
  MapPin
} from 'lucide-react';
import { useFleetSimulation } from '../hooks/useFleetSimulation';
import './DashboardView.css';

export default function DashboardView({ data }: { data: ReturnType<typeof useFleetSimulation> }) {
  const { metrics, alerts, vehicles } = data;

  const activeVehicles  = vehicles.filter(v => v.status === 'active').length;
  const delayedVehicles = vehicles.filter(v => v.status === 'delayed').length;
  const idleVehicles    = vehicles.filter(v => v.status === 'idle').length;

  return (
    <div className="dashboard-container">

      {/* ── Metric Cards ── */}
      <div className="metrics-grid">

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Active Fleet</span>
            <div className="metric-icon blue"><Activity size={18} /></div>
          </div>
          <div className="metric-value">{activeVehicles}</div>
          <div className="metric-sub">of {vehicles.length} total vehicles</div>
          <div className="metric-trend positive">
            <TrendingUp size={14} /> <span>On route now</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Delayed Trips</span>
            <div className="metric-icon red pulse"><Clock size={18} /></div>
          </div>
          <div className="metric-value" style={{ color: delayedVehicles > 0 ? '#EF4444' : '#10B981' }}>
            {delayedVehicles}
          </div>
          <div className="metric-sub">{idleVehicles} idle vehicles detected</div>
          <div className="metric-trend negative">
            <TrendingUp size={14} /> <span>Needs attention</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-title">Idle Vehicles</span>
            <div className="metric-icon yellow"><AlertOctagon size={18} /></div>
          </div>
          <div className="metric-value">{idleVehicles}</div>
          <div className="metric-sub">vehicles not moving</div>
          <div className="metric-trend negative">
            <TrendingUp size={14} /> <span>Idle time accumulating</span>
          </div>
        </div>

        <div className="metric-card glass-panel score-card">
          <div className="metric-header">
            <span className="metric-title">Fleet Efficiency</span>
            <div className="metric-icon green"><Zap size={18} /></div>
          </div>
          <div className="metric-value">
            {metrics.efficiencyScore}<span className="score-denominator">/100</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${metrics.efficiencyScore}%` }}></div>
          </div>
        </div>

      </div>

      {/* ── Alerts + Trips Table ── */}
      <div className="dashboard-content-grid">

        {/* Predictive AI Alerts */}
        <div className="alerts-section glass-panel">
          <div className="section-header">
            <h3>Predictive Ops Engine</h3>
            <span className="live-badge">Live</span>
          </div>
          <div className="alerts-list">
            {alerts.slice(0, 8).map((alert, i) => (
              <div key={alert.id + i} className={`alert-item animate-slide-in ${alert.type}`}>
                <div className="alert-icon">
                  {alert.type === 'critical' ? <ShieldAlert size={16} /> : 
                   alert.type === 'warning'  ? <AlertOctagon size={16} /> : 
                   <MapPin size={16} />}
                </div>
                <div className="alert-content">
                  <p>{alert.message}</p>
                  <span className="alert-time">
                    {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Trip Status Table */}
        <div className="trips-section glass-panel">
          <div className="section-header">
            <h3>Active Trips Radar</h3>
            <span className="live-badge">Live</span>
          </div>
          <div className="table-container">
            <table className="trips-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Destination</th>
                  <th>Speed</th>
                  <th>Status</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.slice(0, 10).map(v => (
                  <tr key={v.id}>
                    <td className="font-medium text-white">{v.id}</td>
                    <td>{v.driver}</td>
                    <td>{v.destination}</td>
                    <td>{Math.floor(v.speed)} km/h</td>
                    <td>
                      <span className={`status-pill ${v.status}`}>
                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                      </span>
                    </td>
                    <td className="font-medium">{v.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
