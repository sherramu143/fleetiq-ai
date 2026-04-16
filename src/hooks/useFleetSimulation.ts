import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Vehicle {
  id: string;
  driver: string;
  location: [number, number];
  heading?: number;
  status: 'active' | 'delayed' | 'idle' | 'completed';
  speed: number;
  eta: string;
  destination: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

export interface FleetMetrics {
  activeFleet: number;
  delayedTrips: number;
  idleLoss: number;
  efficiencyScore: number;
}

export const useFleetSimulation = (companyId: string) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [metrics, setMetrics] = useState<FleetMetrics>({
    activeFleet: 0, delayedTrips: 0, idleLoss: 0, efficiencyScore: 0
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [routes, setRoutes] = useState<number[][][]>([]);
  
  useEffect(() => {
    // Connect to the Node Express server
    const socket: Socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

    // Upon connection, request access to our tenant room
    socket.on('connect', () => {
      console.log('Connected to FleetIQ Live Engine');
      socket.emit('join_tenant', companyId);
    });

    // Listen for live data payloads from the server
    socket.on('fleet_update', (data: any) => {
      if (data.vehicles) setVehicles(data.vehicles);
      if (data.metrics) setMetrics(data.metrics);
      if (data.alerts) {
        // Hydrate dates properly from JSON strings
        const parsedAlerts = data.alerts.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }));
        setAlerts(parsedAlerts);
      }
      if (data.routes) {
        setRoutes(data.routes);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [companyId]); 

  return { vehicles, metrics, alerts, routes };
};
