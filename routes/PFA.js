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
module.exports = router;