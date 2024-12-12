
const express = require('express');
const mongoose = require('mongoose');


// Import your Express app
const app = express();
const userRoutes = require('./routes/UserRouter');
const periodRoutes = require('./routes/PeriodRouter');
const PFARoutes = require('./routes/PFA');
const Authrouter = require('./routes/auth');
const cors = require('cors');

mongoose
  .connect("mongodb://localhost:27017/Node_project")
  .then(function () {
    console.log("Connnection MongoDB réussi");
  })
  .catch(function (e) {
    console.log("Connnection échoué");
  });

  app.listen(5000, () => {
    console.log("Serveur démarré sur le port 5000");
});


  

app.use(express.json());
app.use(cors()); //ici tous le monde passe , il faut ajouter une liste de middleware
app.use(express.json());




// Use the user routes
app.use('/api', userRoutes);
app.use("/api/auth", Authrouter);
app.use('/api/Period', periodRoutes);
app.use('/api/PFA', PFARoutes);


// Start the server
// server.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


