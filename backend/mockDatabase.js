const HYD_CENTER = [17.43, 78.41];
const iterLen = 50;

const mockDrivers = ['Rajesh K.', 'Mahesh S.', 'Abdul M.', 'Priya R.', 'Kiran V.', 'Suresh T.', 'Venkatesh', 'Rahul P.'];
const mockDests = ['Jubilee Hills', 'HITEC City', 'Gachibowli', 'Secunderabad', 'Madhapur', 'Kukatpally'];

// Define some exact routes in Hyderabad (GeoJSON style coordinate arrays)
const HYD_ROUTES = [
  // Route 1: Jubilee Hills to Madhapur
  [[17.4300, 78.4100], [17.4320, 78.4050], [17.4350, 78.3980], [17.4410, 78.3900], [17.4480, 78.3840], [17.4520, 78.3810]],
  // Route 2: ORR section Gachibowli
  [[17.4400, 78.3480], [17.4320, 78.3520], [17.4250, 78.3560], [17.4180, 78.3610], [17.4120, 78.3650]],
  // Route 3: Secunderabad to Center
  [[17.4400, 78.5000], [17.4350, 78.4900], [17.4280, 78.4800], [17.4200, 78.4750], [17.4100, 78.4700]],
  // Route 4: Kukatpally to HITEC
  [[17.4850, 78.4000], [17.4750, 78.3950], [17.4650, 78.3900], [17.4550, 78.3850], [17.4450, 78.3800]]
];

// Users schema
// { email: { password, companyId, name } }
const USERS = {
  'admin@vrl.com': { password: 'demo', companyId: 'vrl', name: 'VRL Admin' },
  'admin@medplus.com': { password: 'demo', companyId: 'medplus', name: 'MedPlus Admin' },
  'admin@porter.com': { password: 'demo', companyId: 'porter', name: 'Porter Admin' }
};

// Workspaces data
const DB = {
  vrl: {
    metadata: { name: 'VRL Logistics', type: 'logistics' },
    metrics: { activeFleet: 142, delayedTrips: 12, idleLoss: 8450, efficiencyScore: 82 },
    alerts: [{ id: '1', type: 'info', message: 'System Online. VRL Transport Active.', timestamp: new Date() }],
    vehicles: []
  },
  medplus: {
    metadata: { name: 'MedPlus Pharmacy', type: 'pharmacy' },
    metrics: { activeFleet: 24, delayedTrips: 1, idleLoss: 50, efficiencyScore: 98 },
    alerts: [{ id: '1', type: 'info', message: 'System Online. MedPlus Pharmacy Active.', timestamp: new Date() }],
    vehicles: []
  },
  porter: {
    metadata: { name: 'Porter Delivery', type: 'hyperlocal' },
    metrics: { activeFleet: 310, delayedTrips: 45, idleLoss: 2100, efficiencyScore: 76 },
    alerts: [{ id: '1', type: 'info', message: 'System Online. Porter Delivery Active.', timestamp: new Date() }],
    vehicles: []
  }
};

const initVehicles = (companyId) => {
  let count = 15;
  let delayChance = 0.2;
  
  if (companyId === 'vrl') count = 24;
  if (companyId === 'medplus') { count = 12; delayChance = 0.05; }
  if (companyId === 'porter') { count = 35; delayChance = 0.3; }

  const vehicles = Array.from({ length: count }).map((_, i) => {
    const routeIndex = i % HYD_ROUTES.length;
    const route = HYD_ROUTES[routeIndex];
    // Pick a random progress along the route
    const progressIndex = Math.floor(Math.random() * (route.length - 1));
    const location = [...route[progressIndex]]; // copy array so we can mutate safely

    const rand = Math.random();
    const status = rand < delayChance ? 'delayed' : rand < 0.3 ? 'idle' : 'active';
    
    const etaMins = companyId === 'vrl' ? Math.floor(Math.random() * 300) + 60 : Math.floor(Math.random() * 45) + 5;
    const etaStr = etaMins > 60 ? `${Math.floor(etaMins / 60)}h ${etaMins % 60}m` : `${etaMins} mins`;
    const dest = companyId === 'vrl' ? 'Mumbai Highway' : mockDests[i % mockDests.length];

    return {
      id: `${companyId.substring(0, 2).toUpperCase()}-${100 + i}`,
      driver: mockDrivers[i % mockDrivers.length],
      location: location,
      routeIndex: routeIndex,
      progressIndex: progressIndex,
      heading: 0, // Will be mathematically calculated during tick
      status,
      speed: status === 'idle' ? 0 : status === 'delayed' ? Math.floor(Math.random() * 20) + 10 : Math.floor(Math.random() * 30) + 30,
      eta: etaStr,
      destination: dest
    };
  });
  
  DB[companyId].vehicles = vehicles;
};

// Expose routes
const getRoutes = () => HYD_ROUTES;

// Initialize default static DB
['vrl', 'medplus', 'porter'].forEach(initVehicles);

const getCompanyData = (companyId) => {
  return DB[companyId] || null;
};

const getAllCompaniesList = () => {
  return Object.keys(DB);
};

const updateCompanyData = (companyId, newData) => {
  if (DB[companyId]) {
    DB[companyId] = { ...DB[companyId], ...newData };
  }
};

const addAlert = (companyId, type, message) => {
  if (DB[companyId]) {
    DB[companyId].alerts.unshift({
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date()
    });
    // Keep max 10
    if (DB[companyId].alerts.length > 10) DB[companyId].alerts.pop();
  }
};

// --- AUTH LOGIC ---

const authenticateUser = (email, password) => {
  const user = USERS[email];
  if (user && user.password === password) {
    return {
      email,
      name: user.name,
      companyId: user.companyId,
      company: DB[user.companyId].metadata
    };
  }
  return null;
};

const registerCompany = ({ userName, companyName, email, password }) => {
  if (USERS[email]) {
    return { success: false, message: 'Email is already registered.' };
  }

  // Generate safe companyId
  const companyId = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (DB[companyId]) {
    return { success: false, message: 'Company name already heavily resembles an existing workspace.' };
  }

  // Create User
  USERS[email] = {
    password,
    companyId,
    name: userName
  };

  // Create Brand New Tenant Workspace
  DB[companyId] = {
    metadata: { name: companyName, type: 'logistics' },
    metrics: { activeFleet: 15, delayedTrips: 2, idleLoss: 0, efficiencyScore: 100 },
    alerts: [{ id: '1', type: 'info', message: `Welcome to FleetIQ AI! System online for ${companyName}.`, timestamp: new Date() }],
    vehicles: []
  };

  // Simulate injecting their custom trucks instantly
  initVehicles(companyId);

  return { success: true, user: USERS[email], company: DB[companyId].metadata };
};


module.exports = {
  getCompanyData,
  updateCompanyData,
  addAlert,
  getAllCompaniesList,
  authenticateUser,
  registerCompany,
  getRoutes
};
