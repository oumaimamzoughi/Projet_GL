const periodService = require("../../services/PeriodService");

class PeriodController {
  async openInternshipPeriod(req, res) {
    try {
      const { type } = req.params;
      const { start_date, end_date } = req.body;

      const newInternshipPeriod = await periodService.openInternshipPeriod(
        type,
        start_date,
        end_date
      );

      res.status(201).json(newInternshipPeriod);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getOpenInternshipPeriod(req, res) {
    try {
      const { type } = req.params;
      const openPeriod = await periodService.getOpenInternshipPeriod(type);

      if (!openPeriod) {
        return res.status(404).json({
          message: `No open period found for internship type '${type}'.`,
        });
      }

      res.status(200).json(openPeriod);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateInternshipPeriod(req, res) {
    try {
      const { type } = req.params;
      const { start_date, end_date } = req.body;

      const openPeriod = await periodService.updateInternshipPeriod(
        type,
        start_date,
        end_date
      );

      res.status(200).json(openPeriod);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PeriodController();