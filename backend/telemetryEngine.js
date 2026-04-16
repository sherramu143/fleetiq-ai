const { getCompanyData, updateCompanyData, addAlert, getAllCompaniesList, getRoutes } = require('./mockDatabase');

// Helper to calculate bearing/heading angle between two coordinates
function calculateBearing(startLat, startLng, destLat, destLng) {
  const toRad = deg => (deg * Math.PI) / 180;
  const toDeg = rad => (rad * 180) / Math.PI;

  const startLatRad = toRad(startLat);
  const startLngRad = toRad(startLng);
  const destLatRad = toRad(destLat);
  const destLngRad = toRad(destLng);

  const dLng = destLngRad - startLngRad;
  const y = Math.sin(dLng) * Math.cos(destLatRad);
  const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
            Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(dLng);

  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

function startTelemetryEngine(io) {
  const routes = getRoutes();

  setInterval(() => {
    const companies = getAllCompaniesList(); 

    companies.forEach(companyId => {
      const data = getCompanyData(companyId);
      if (!data) return;

      // Move vehicles explicitly along their assigned routes
      const updatedVehicles = data.vehicles.map(v => {
        if (v.status === 'idle') return v;
        
        const route = routes[v.routeIndex];
        let nextIndex = v.progressIndex + 1;
        
        // Loop back to start if reached end of mock route
        if (nextIndex >= route.length) {
          nextIndex = 0; 
        }

        const currentPos = v.location;
        const targetPos = route[nextIndex];
        
        // Calculate bearing so the icon faces the right way
        const heading = calculateBearing(currentPos[0], currentPos[1], targetPos[0], targetPos[1]);

        // Interpolate heavily simplified: just jump coordinates gradually towards target
        // For a true engine we'd calculate distance, but this is a visual demo
        const distanceStep = 0.05; // 5% step towards next node per tick
        
        const newLat = currentPos[0] + (targetPos[0] - currentPos[0]) * distanceStep;
        const newLng = currentPos[1] + (targetPos[1] - currentPos[1]) * distanceStep;

        // If very close to node, snap to it and advance progress index
        let newProgressIndex = v.progressIndex;
        if (Math.abs(newLat - targetPos[0]) < 0.0001 && Math.abs(newLng - targetPos[1]) < 0.0001) {
          newProgressIndex = nextIndex;
        }

        return {
          ...v,
          location: [newLat, newLng],
          progressIndex: newProgressIndex,
          heading: Math.floor(heading), 
          speed: Math.max(10, v.speed + (Math.random() - 0.5) * 5)
        };
      });

      // Update metrics via Predictive Ops Engine mock
      let updatedMetrics = { ...data.metrics };
      if (Math.random() < 0.08) {
        // ... (Keep existing alerts)
      }

      updateCompanyData(companyId, { vehicles: updatedVehicles, metrics: updatedMetrics });

      // Emit new state AND expose the static route lines
      io.to(companyId).emit('fleet_update', {
        vehicles: updatedVehicles,
        metrics: updatedMetrics,
        alerts: getCompanyData(companyId).alerts,
        routes: routes // expose the polylines so UI can draw them
      });
    });
  }, 3000); 
}

module.exports = { startTelemetryEngine };
