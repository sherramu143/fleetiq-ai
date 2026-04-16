const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { getCompanyData, authenticateUser, registerCompany } = require('./mockDatabase');
const { startTelemetryEngine } = require('./telemetryEngine');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// REST API Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = authenticateUser(email, password);
  if (user) {
    const data = getCompanyData(user.companyId);
    return res.json({ 
      success: true, 
      token: `jwt_${user.companyId}_123`,
      user: {
        name: user.name,
        email: user.email
      },
      company: {
        id: user.companyId,
        ...user.company
      },
      initialData: data 
    });
  }
  
  return res.status(401).json({ success: false, message: 'Invalid email or password' });
});

// User & Company Registration
app.post('/api/auth/signup', (req, res) => {
  const { userName, companyName, email, password } = req.body;

  if (!userName || !companyName || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const result = registerCompany({ userName, companyName, email, password });
  if (result.success) {
    // Treat registration as an immediate login
    const data = getCompanyData(result.user.companyId);
    return res.json({ 
      success: true, 
      token: `jwt_${result.user.companyId}_123`,
      user: {
        name: result.user.name,
        email: email
      },
      company: {
        id: result.user.companyId,
        ...result.company
      },
      initialData: data 
    });
  } else {
    return res.status(400).json({ success: false, message: result.message });
  }
});

// WebSocket Handling
io.on('connection', (socket) => {
  console.log(`[Socket Connected] Client: ${socket.id}`);

  socket.on('join_tenant', (companyId) => {
    socket.join(companyId);
    console.log(`[Tenant Joined] ${socket.id} joined room: ${companyId}`);
    
    const initialData = getCompanyData(companyId);
    if(initialData) {
      socket.emit('fleet_update', initialData);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected] Client: ${socket.id}`);
  });
});

// Start Output
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[FleetIQ API] Server running on port ${PORT}`);
  startTelemetryEngine(io);
  console.log(`[FleetIQ Ops Engine] Telemetry generator started...`);
});
