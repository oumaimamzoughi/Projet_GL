const express = require('express');
const router = express.Router();
const ChoiceController = require('../controllers/SubjectChoice');
const middleAuth = require('../middleware/User');


router.get('/admin/choices',middleAuth.loggedMiddleware,middleAuth.isAdmin,ChoiceController.getAllSubjectChoices );
router.get('/admin/choicesdetails',middleAuth.loggedMiddleware,middleAuth.isAdmin,ChoiceController.getAllStudentChoices );
router.post("/auto",middleAuth.loggedMiddleware,middleAuth.isAdmin, ChoiceController.assignPFA);
router.post("/manuelle",middleAuth.loggedMiddleware,middleAuth.isAdmin, ChoiceController.assignPFAManually);
router.post("/force",middleAuth.loggedMiddleware,middleAuth.isAdmin, ChoiceController.assignPFAWithForce);
router.get("/listfinal",middleAuth.loggedMiddleware,middleAuth.isAdmin, ChoiceController.getFinalPFEAssignments);
router.post("/send",middleAuth.loggedMiddleware,middleAuth.isAdmin, ChoiceController.sendList);
module.exports = router;