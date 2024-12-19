const express = require("express");
const router = express.Router();

const middleAuth = require("../middleware/User");
const { openInternshipPeriod, getOpenInternshipPeriod, updateInternshipPeriod, assignTeachersToInternships, updateInternshipTeacher, sendPlanningEmail, getAssignedInternships, addInternship } = require("../controllers/Internship");


router.post("/:type/open",openInternshipPeriod);//wroks

router.post("/:type/post",addInternship);//wroks


router.get("/:type/open" ,getOpenInternshipPeriod);// works 

router.patch("/:type/open",updateInternshipPeriod); // works 

router.post('/:type/planning/assign', assignTeachersToInternships);


router.patch('/:type/planning/update', updateInternshipTeacher);

router.post('/:type/planning/send', sendPlanningEmail);

router.get('/:type/assigned-to-me', getAssignedInternships);

module.exports = router;