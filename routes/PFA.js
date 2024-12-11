const express = require('express');
const router = express.Router();
const PFAController = require('../controllers/PFA');
const middleAuth = require('../middleware/User');

// router.use( middleAuth.loggedMiddleware, middleAuth.isTeacher);

router.post("/add",middleAuth.loggedMiddleware, middleAuth.isTeacher, PFAController.createPFA)
router.put("/update/:id" ,middleAuth.loggedMiddleware, middleAuth.isTeacher,PFAController.updatePFA)
router.delete("/delete/:id",middleAuth.loggedMiddleware, middleAuth.isTeacher ,PFAController.deletePFA)
router.get("/",middleAuth.loggedMiddleware, middleAuth.isAdmin,PFAController.getAllPFAs)
router.patch("/:id/reject",middleAuth.loggedMiddleware, middleAuth.isAdmin,PFAController.rejectPFA);
router.patch("/publish/:response",middleAuth.loggedMiddleware, middleAuth.isAdmin,PFAController.publishPFA)
router.post("/list/send",middleAuth.loggedMiddleware, middleAuth.isAdmin, PFAController.sendPFAList)
router.get("/list",middleAuth.loggedMiddleware, middleAuth.isStudent, PFAController.getPFAsByTeacher)
router.get("/:id",  middleAuth.loggedMiddleware, middleAuth.isStudent, PFAController.getPFAById);
router.patch("/:id/choice",middleAuth.loggedMiddleware, middleAuth.isStudent,PFAController.createSubjectChoice)

module.exports = router;