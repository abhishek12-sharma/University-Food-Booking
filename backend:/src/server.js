require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const sequelize = require('./config/database');
require('./models'); // load all models + associations
const { startOrderExpirySweep } = require('./jobs/orderExpiryJob');
const socketService = require('./services/socketService');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
      },
    });

    socketService.init(io);

    startOrderExpirySweep();

    server.listen(PORT, () => {
      console.log(`University Food System backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
