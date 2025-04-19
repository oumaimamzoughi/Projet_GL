const express = require("express");
const router = express.Router();

const multer = require("multer");
const { multerFilter, multerStorage } = require("../utils/storage");
const { internshipController } = require('../config/dependencies')();

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).array("documents", 5); // Limit to 5 documents per upload


const {
  createInternship,
  getInternship,
  getAllInternships,
  updateInternship,
  deleteInternship,
  assignTeacher,
  validateInternship,
  getByType
} = require("../controllers/InternshipController");

/* Routes CRUD Basiques */
router.post("/", upload, createInternship);
router.get("/", getAllInternships);
router.get("/:id", getInternship);
router.patch("/:id",updateInternship);
router.delete("/:id",deleteInternship);

/* Routes Spécifiques */
router.post("/:id/assign-teacher", assignTeacher);
router.patch("/:id/validate", validateInternship);
router.get("/type/:type", getByType);
module.exports = router;