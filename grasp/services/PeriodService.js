const Period = require("../../models/Period.model");

class PeriodService {
  async openInternshipPeriod(type, start_date, end_date) {
    if (new Date(start_date) >= new Date(end_date)) {
      throw new Error("start_date must be earlier than end_date");
    }

    const existingPeriods = await Period.find({
      type,
      $or: [
        { start_date: { $lte: end_date }, start_date: { $gte: start_date } },
      ],
    });

    if (existingPeriods.length > 0) {
      throw new Error(
        "A period for this internship type already exists in the given range"
      );
    }

    const newInternshipPeriod = new Period({ type, start_date, end_date });
    await newInternshipPeriod.save();
    return newInternshipPeriod;
  }

  async getOpenInternshipPeriod(type) {
    const currentDate = new Date();
    return await Period.findOne({
      type,
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    });
  }

  async updateInternshipPeriod(type, start_date, end_date) {
    if (new Date(start_date) >= new Date(end_date)) {
      throw new Error("start_date must be earlier than end_date.");
    }

    const currentDate = new Date();
    const openPeriod = await Period.findOne({
      type,
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    });

    if (!openPeriod) {
      throw new Error(`No open period found for internship type '${type}'.`);
    }

    openPeriod.start_date = start_date;
    openPeriod.end_date = end_date;
    await openPeriod.save();
    return openPeriod;
  }

  async getPeriodByType(type) {
    return await Period.findOne({ type });
  }
}

module.exports = new PeriodService();