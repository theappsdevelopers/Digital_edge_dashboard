require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/database');
const { runWithConnection, getConnection } = require('./config/requestContext');
const { requireAuth } = require('./modules/auth/auth.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const forecastRoutes = require('./modules/forecast/forecast.routes');
const clientRoutes = require('./modules/clients/client.routes');
const projectRoutes = require('./modules/projects/project.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const expenseRoutes = require('./modules/expenses/expense.routes');
const milestoneRoutes = require('./modules/milestones/milestone.routes');
const employeeRoutes = require('./modules/employees/employee.routes');
const statusLogRoutes = require('./modules/statusLogs/statusLog.routes');
const createApprovalsRouter = require('./modules/approvals/approvals.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },
});

// CORS – required for Base44 / api.theappsdevelopers.com
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'NODE_ENV', 'X-Environment', 'X-Node-Env'],
  optionsSuccessStatus: 204,
}));

// Explicit CORS headers (backup so response always has them)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, NODE_ENV, X-Environment, X-Node-Env');
  res.setHeader('Access-Control-Expose-Headers', 'X-DigitalEdge-DB');
  next();
});
app.use(express.json());

// Pick DB by request header. Prefer X-Environment (preview vs production by URL), then NODE_ENV.
// Many hosts set NODE_ENV=production even on preview builds – so X-Environment is more reliable.
app.use((req, res, next) => {
  const xEnv = (req.headers['x-environment'] || '').trim().toLowerCase();
  const raw =
    req.headers['x-node-env'] ||
    req.headers['x-node_env'] ||
    req.headers['node-env'] ||
    req.headers['node_env'] ||
    '';
  const nodeEnv = String(raw).trim().toLowerCase();

  // X-Environment wins: "preview" | "development" → dev, "production" | "prod" → prod
  let env = 'development';
  if (xEnv === 'production' || xEnv === 'prod') {
    env = 'production';
  } else if (xEnv === 'preview' || xEnv === 'development' || xEnv === 'dev') {
    env = 'development';
  } else if (nodeEnv === 'production') {
    env = 'production';
  } else if (nodeEnv) {
    env = nodeEnv;
  } else {
    // No explicit header – infer from Referer/Origin:
    // - Live dashboard (financedashboard.thedigitaledgetechnologies.com) → production
    // - Preview Base44 URL (preview--*.base44.app) → development
    const ref = (req.headers.referer || req.headers.origin || '').toString();
    if (ref.includes('financedashboard.thedigitaledgetechnologies.com')) {
      env = 'production';
    } else if (ref.includes('preview--') && ref.includes('.base44.app')) {
      env = 'development';
    }
  }

  const isProd = env === 'production';
  const dbUsed = isProd ? 'digital_edge_prod' : 'digital_edge_dev';
  const conn = getConnection(isProd ? 'production' : 'development');
  res.setHeader('X-DigitalEdge-DB', dbUsed);
  console.log(
    `[DigitalEdge] ${req.method} ${req.path} | X-Environment: "${xEnv}" NODE_ENV: "${nodeEnv}" → env: "${env}" → DB: ${dbUsed}`
  );
  runWithConnection(conn, () => next());
});

// Optional: explicit security headers for cross-origin (review/prod)
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Basic health check routes (/ for ELB, /health for explicit checks)
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'digitaledge-backend' });
});
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'digitaledge-backend',
    timestamp: new Date().toISOString(),
  });
});

// Public auth (no JWT required)
app.use('/api/auth', authRoutes);

// Protected API routes (JWT required)
app.get('/api', requireAuth, (req, res) => {
  res.json({ message: 'Welcome to the DigitalEdge API' });
});
app.use('/api/forecast', requireAuth, forecastRoutes);
app.use('/api/clients', requireAuth, clientRoutes);
app.use('/api/projects', requireAuth, projectRoutes);
app.use('/api/payments', requireAuth, paymentRoutes);
app.use('/api/expenses', requireAuth, expenseRoutes);
app.use('/api/milestones', requireAuth, milestoneRoutes);
app.use('/api/employees', requireAuth, employeeRoutes);
app.use('/api/status-logs', requireAuth, statusLogRoutes);
app.use('/api/approval-system', createApprovalsRouter(io));

// Port configuration
const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`DigitalEdge backend listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Server not started:', err);
  });

