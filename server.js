const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { initializeSocketService } = require('./dist/lib/socket-server');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: dev ? "http://localhost:3000" : process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Initialize our custom socket service
  const socketService = initializeSocketService(httpServer);

  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Handle user authentication and room joining
    socket.on('join_room', async (data) => {
      try {
        const { user, room } = data;
        
        // Validate user data
        if (!user.id || !user.role || !user.name) {
          socket.emit('error', { message: 'Invalid user data' });
          return;
        }

        // Join room
        socket.join(room);
        socket.join(`doctor_${user.id}`);
        socket.join(`patient_${user.id}`);

        console.log(`👤 User ${user.name} (${user.role}) joined room: ${room}`);

        // Send confirmation
        socket.emit('room_joined', { room, user });
        
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle room leaving
    socket.on('leave_room', async (data) => {
      try {
        const { room } = data;
        
        socket.leave(room);

        console.log(`👤 User left room: ${room}`);

        socket.emit('room_left', { room });
        
      } catch (error) {
        console.error('Error leaving room:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // Start server
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`🚀 Server ready on http://${hostname}:${port}`);
    console.log(`🔌 Socket.IO server ready`);
  });
});
