const express = require("express");
const router = express.Router();

const middleAuth = require("../middleware/User");
const { getTeachers } = require("../controllers/teachers");

router.get('/teachers', middleAuth.isAdmin, getTeachers);

module.exports = router;