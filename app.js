
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/UserRouter');

const Authrouter = require('./routes/auth');
const cors = require('cors');

const app = express();

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
app.use('/api', userRoutes);
app.use("/api/auth", Authrouter);


