const express = require("express");
const router = express.Router();
const PeriodController = require("../controllers/Period");
const middleAuth = require("../middleware/User");

router.use(middleAuth.loggedMiddleware, middleAuth.isAdmin);

router.post("/add", PeriodController.createPeriod);
router.put("/update/:id", PeriodController.updatePeriod);
router.delete("/delete/:id", PeriodController.deletePeriod);
router.get("/", PeriodController.getAllPeriods);

module.exports = router;
