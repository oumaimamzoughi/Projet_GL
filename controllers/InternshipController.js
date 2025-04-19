const InternshipService = require("../services/InternshipService");
const MongoDBInternshipRepository = require("../repositories/MongoDBInternshipRepository");
const MongoDBUserRepository = require("../repositories/MongoDBUserRepository");
const EmailService = require("../services/EmailService");

// Initialize dependencies
const internshipRepository = new MongoDBInternshipRepository();
const userRepository = new MongoDBUserRepository();
const emailService = new EmailService();

const internshipService = new InternshipService(
  internshipRepository,
  userRepository,
  emailService
);

// Controller Methods
exports.createInternship = async (req, res) => {
  try {
    const internship = await internshipService.createInternship(req.body);
    res.status(201).json(internship);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getInternship = async (req, res) => {
  try {
    const internship = await internshipService.getInternshipById(req.params.id);
    res.status(200).json(internship);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getAllInternships = async (req, res) => {
  try {
    const internships = await internshipService.getAllInternships(req.query);
    res.status(200).json(internships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInternship = async (req, res) => {
  try {
    const updated = await internshipService.updateInternship(
      req.params.id,
      req.body
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteInternship = async (req, res) => {
  try {
    const result = await internshipService.deleteInternship(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.assignTeacher = async (req, res) => {
  try {
    const result = await internshipService.assignTeacher(
      req.params.internshipId,
      req.body.teacherId
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.validateInternship = async (req, res) => {
  try {
    const { isValid, reason } = req.body;
    const result = await internshipService.validateInternship(
      req.params.id,
      isValid,
      reason
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getByType = async (req, res) => {
  try {
    const internships = await internshipService.getInternshipsByType(req.params.type);
    res.status(200).json(internships);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};