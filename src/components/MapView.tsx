import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Vehicle } from '../hooks/useFleetSimulation';
import { useFleetSimulation } from '../hooks/useFleetSimulation';
import './MapView.css';
import { useEffect, useRef, useState } from 'react';

// Custom 3D Truck Map Icons, rotated based on heading
const create3DIcon = (status: string, heading: number = 0, selected = false) => {
  const color = status === 'active' ? '#10B981' : status === 'delayed' ? '#EF4444' : '#F59E0B';
  const shadowColor = status === 'active' ? 'rgba(16,185,129,0.6)' : status === 'delayed' ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.6)';
  const scale = selected ? 1.6 : 1.0;
  const ring = selected ? `<div class="truck-ring" style="border-color:${color}"></div>` : '';

  const truckHTML = `
    <div class="truck-3d-wrapper" style="transform: rotate(${heading + 90}deg); transform-origin: center;">
      ${ring}
      <div class="truck-body" style="transform: scale(${scale}); box-shadow: 0 0 12px ${shadowColor}">
        <div class="truck-cabin"></div>
        <div class="truck-box" style="background: ${color};"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-fleet-icon',
    html: truckHTML,
    iconSize: [36, 18],
    iconAnchor: [18, 9]
  });
};

// Sub-component that handles fly-to on vehicle selection
function FlyToVehicle({ vehicle }: { vehicle: Vehicle | null }) {
  const map = useMap();
  const prevId = useRef<string | null>(null);

  useEffect(() => {
    if (vehicle && vehicle.id !== prevId.current) {
      map.flyTo(vehicle.location, 16, { animate: true, duration: 1.2 });
      prevId.current = vehicle.id;
    }
  }, [vehicle, map]);

  // Follow the selected vehicle on every position update
  useEffect(() => {
    if (vehicle) {
      map.setView(vehicle.location, map.getZoom(), { animate: true });
    }
  }, [vehicle?.location]);

  return null;
}

// Dark-mode tile styling
function MapController() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl.setPrefix(false);
  }, [map]);
  return null;
}

export default function MapView({ data }: { data: ReturnType<typeof useFleetSimulation> }) {
  const { vehicles, routes } = data;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedVehicle = vehicles.find(v => v.id === selectedId) ?? null;

  return (
    <div className="map-view-container glass-panel">
      <MapContainer
        center={[17.43, 78.43]}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
        zoomControl={true}
      >
        <MapController />
        <TileLayer
          url="https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
          subdomains={['0', '1', '2', '3']}
          maxZoom={20}
          attribution='&copy; Google Maps'
        />

        <FlyToVehicle vehicle={selectedVehicle} />

        {/* Exact Route Lines */}
        {routes && routes.map((routeLine, idx) => (
          <Polyline
            key={`route-${idx}`}
            positions={routeLine as [number, number][]}
            pathOptions={{ color: 'rgba(59, 130, 246, 0.4)', weight: 4, dashArray: '6, 10' }}
          />
        ))}

        {/* 3D Vehicle Markers */}
        {vehicles.map((v) => (
          <Marker
            key={v.id}
            position={v.location}
            icon={create3DIcon(v.status, v.heading ?? 0, selectedId === v.id)}
            eventHandlers={{
              click: () => setSelectedId(prev => prev === v.id ? null : v.id)
            }}
          >
            <Popup className="fleet-popup">
              <div className="popup-content">
                <strong>{v.id}</strong>
                <p>Driver: {v.driver}</p>
                <p>Status: <span style={{ color: v.status === 'delayed' ? '#EF4444' : '#10B981' }}>{v.status}</span></p>
                <p>Speed: {Math.floor(v.speed)} km/h</p>
                <p>ETA: {v.eta} → {v.destination}</p>
                <button className="re-route-btn" onClick={() => setSelectedId(v.id)}>📍 Track Live</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend and tracking status */}
      <div className="map-overlay-bottom">
        {selectedId && (
          <div className="tracking-badge">
            🎯 Live Tracking: <strong>{selectedId}</strong>
            <button onClick={() => setSelectedId(null)} className="stop-track-btn">✕ Stop</button>
          </div>
        )}
        <div className="map-legend">
          <span><span className="dot" style={{ background: '#10B981' }}></span> Active</span>
          <span><span className="dot" style={{ background: '#EF4444' }}></span> Delayed</span>
          <span><span className="dot" style={{ background: '#F59E0B' }}></span> Idle</span>
        </div>
      </div>
    </div>
  );
}
