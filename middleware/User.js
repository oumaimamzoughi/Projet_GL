const jwt = require("jsonwebtoken");
const User = require('../models/User.model.js');

const JWT_SECRET = "ISAMM_SECRET";


exports.loggedMiddleware = async (req, res, next) => {
  console.log("enter logged mid")
  try {
    const token = req.headers.authorization.split(" ")[1];
   
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.userId;
    try {
      const user = await User.findOne({ _id: userId });
      if (user) {
        req.auth = {
          userId: userId,
          role: user.role,
        };
        next();
      } else {
        res.status(401).json({ error: "user doesn't exist" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

exports.isAdmin = (req, res, next) => {
  try {
    if (req.auth.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "no access to this route" });
    }
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
};
exports.isTeacher = (req, res, next) => {
  console.log("enter midl")
  try {
    console.log("Auth data:", req.auth); // Vérifiez ce qui est dans req.auth
    if (req.auth && req.auth.role === "teacher") {
      next();
    } else {
      console.log("User is not a teacher:", req.auth.role); // Si ce n'est pas un enseignant
      res.status(403).json({ message: "No access to this route." });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};


exports.isStudent = (req, res, next) => {
  try {
    if (req.auth.role === "student") {
      next();
    } else {
      res.status(403).json({ error: "no access to this route" });
    }
  } catch (e) {
    res.status(401).json({ error: error.message });
  }
};

exports.isStillStudent = (req, res, next) => {

  if (req.user.graduationDate && new Date(req.user.graduationDate) < new Date()) {
    return res.status(403).json({ message: 'You are no longer a student.' });
  }
  next();

};