const express = require('express');
const app = express();
const userRoutes = require('./routes/UserRouter');

// Middleware to parse JSON request bodies
app.use(express.json());

// Use the user routes
app.use('/api', userRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
