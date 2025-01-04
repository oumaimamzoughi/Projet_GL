const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const notifyRetardCronJob =require('./utils/notifyRetardCronJob')
const mettingCronJob=require('./utils/mettingCronJob')
require('dotenv').config();
const setupSwagger = require('./swaggerDocs');
// Import your Express app
const app = express();
const userRoutes = require('./routes/UserRouter');
const competencesRoutes = require('./routes/CompetencesRoutes')
const periodRoutes = require('./routes/PeriodRouter');
const PFARoutes = require('./routes/PFA');
const internshipRoutes=require('./routes/internshipRouter');
const Authrouter = require('./routes/auth');
const teacherRoutes = require('./routes/teacherRoutes');
const cors = require('cors');


// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// MongoDB Atlas Configuration
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const connectedUsers = new Map(); // Maps userId to socketId

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Register the user to track their connection
  socket.on('registerUser', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Use the user routes
app.use('/api/users', userRoutes);
app.use('/api/competences', competencesRoutes);
app.use("/api/auth", Authrouter);
app.use('/api/Period', periodRoutes);
app.use('/api/PFA', PFARoutes);
app.use('/api/internship',internshipRoutes)
app.use('/api/teachers',teacherRoutes)

setupSwagger(app);

// notifyRetardCronJob();

// mettingCronJob();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = { server, io, connectedUsers };
