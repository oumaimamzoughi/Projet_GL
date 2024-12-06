const { io, connectedUsers } = require('../server');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const sendEmail = require('../utils/emailService');

const sendNotification = async (userId, { title, message }) => {
  // Save the notification in the database
  const notification = new Notification({ user: userId, title, message });
  await notification.save();

  // Check if the user is connected
  const socketId = connectedUsers.get(userId);

  if (socketId) {
    // Emit the notification to the user's socket
    io.to(socketId).emit('notification', { title, message });
    console.log(`Notification sent to user ${userId} via WebSocket`);
  } else {
    // Send fallback email if the user is offline
    const user = await User.findById(userId);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: title,
        text: message,
        html: `<p>${message}</p>`,
      });
      console.log(`Email sent to user ${userId}`);
    }
  }
};

module.exports = { sendNotification };
