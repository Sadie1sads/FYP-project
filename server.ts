import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { connect } from './src/dbConnection/dbConnection';
import Message from './src/models/Message';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

interface TokenPayload {
  id: string;
  username: string;
  email: string;
}

// Extend Socket type to carry our user data
interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

// This lets API routes access io anywhere in the app
declare global {
  var io: SocketIOServer | undefined;
}

async function main() {
  await app.prepare();
  await connect(); 

  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl); // Next.js handles all pages and API routes
  });

  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
  });

  // Save IO Globally so API routes can emit events
  global.io = io;


  // Runs before every socket connection
  // Reads the JWT token from the cookie and attaches user info to the socket
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || '';

      const cookies = Object.fromEntries(
        cookieHeader.split(';').map((c) => {
          const [key, ...val] = c.trim().split('=');
          return [key, val.join('=')];
        })
      );

      const token = cookies['token'];
      if (!token) return next(new Error('Not authenticated'));

      const secret = process.env.TOKEN_SECRET!;
      const decoded = jwt.verify(token, secret) as TokenPayload;

      
      socket.userId = decoded.id;
      socket.username = decoded.username;

      next(); // allow connection
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(` ${socket.username} connected (${socket.id})`);
    // Join a private room to receive personal notifications.
    if (socket.userId) {
      socket.join(socket.userId);
    }

    // join a private room
    // Client sends the otherUserId they want to chat with
    // We build a consistent roomId from both user IDs (sorted alphabetically)
    socket.on('join-private-chat', async (otherUserId: string) => {
    try {
      const ids = [socket.userId!, otherUserId].sort();
      const roomId = ids.join('_');

      socket.join(roomId);
      console.log(`${socket.username} joined room: ${roomId}`);

      const history = await Message.find({ roomId })
        .sort({ createdAt: 1 })
        .limit(50)
        .lean();

      socket.emit('message-history', history);
    } catch (error) {
      console.error('Failed to join private chat:', error);
      socket.emit('chat-error', { message: 'Failed to load chat history' });
    }
  });
    // send a message
    socket.on('send-message', async (data: { otherUserId: string; text: string }) => {
      const { otherUserId, text } = data;
      if (!text.trim()) return;

      // Rebuild the same consistent roomId
      const ids = [socket.userId!, otherUserId].sort();
      const roomId = ids.join('_');

      // Save to MongoDB
      const saved = await Message.create({
        roomId,
        senderId: socket.userId,
        senderUsername: socket.username,
        text: text.trim(),
      });

      // Broadcast to both sender and receiver in the room 
      io.to(roomId).emit('receive-message', {
        _id: saved._id,
        senderId: saved.senderId,
        senderUsername: saved.senderUsername,
        text: saved.text,
        createdAt: saved.createdAt,
      });
    });

    socket.on('disconnect', () => {
      console.log(` ${socket.username} disconnected`);
    });
  });

  httpServer.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
}
main();