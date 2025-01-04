const express = require('express');
const router = express.Router();
const DefenseController = require('../controllers/Defense');
const middleAuth = require('../middleware/User');


router.post("/create",/*middleAuth.loggedMiddleware, middleAuth.isAdmin,*/DefenseController.createDefenses)
router.get("/",/*middleAuth.loggedMiddleware, middleAuth.isAdmin,*/DefenseController.getAllDefenses)
router.patch("/:defenseId",/*middleAuth.loggedMiddleware, middleAuth.isAdmin,*/DefenseController.updateDefense)
router.patch("/publish/:response",/*middleAuth.loggedMiddleware, middleAuth.isAdmin,*/DefenseController.publishDefenses)
router.post("/list/send",/*middleAuth.loggedMiddleware, middleAuth.isAdmin,*/ DefenseController.sendDefensesList)
router.get("/teacher/:teacherId",/*middleAuth.loggedMiddleware, middleAuth.isTeacher,*/DefenseController.getTeacherDefenses)
router.get("/details/:defenseId",/*middleAuth.loggedMiddleware, middleAuth.isTeacher,*/DefenseController.getDefenseDetails)
router.get("/student/:studentId",/*middleAuth.loggedMiddleware, middleAuth.isStudent,*/DefenseController.getStudentDefense)
module.exports = router;