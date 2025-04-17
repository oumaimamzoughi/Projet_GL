const Defense = require("../models/Defense.model");
const PFA = require("../models/PFA.mode");
const User = require("../models/User.model");

class ScheduleDefenseService {
  async scheduleDefenses(dates, rooms, startTime, endTime) {
    const soutenanceDuration = 30;
    const maxDefensesPerDay = 6;

    const pfas = await PFA.find({ state: "affecté" });
    if (!pfas.length) {
      throw new Error("Aucun PFA affecté.");
    }

    const defenses = [];
    let currentDateIndex = 0;
    let currentRoomIndex = 0;
    let currentTime = new Date(`${dates[currentDateIndex]}T${startTime}`);

    for (let i = 0; i < pfas.length; i++) {
      const currentDayDefenses = defenses.filter(
        (defense) => defense.date === dates[currentDateIndex]
      );

      if (currentDayDefenses.length >= maxDefensesPerDay) {
        currentDateIndex++;
        currentRoomIndex = 0;
        if (currentDateIndex >= dates.length) {
          throw new Error("Pas assez de jours disponibles.");
        }
        currentTime = new Date(`${dates[currentDateIndex]}T${startTime}`);
      }

      const formattedTime = `${String(currentTime.getHours()).padStart(2, "0")}:${String(
        currentTime.getMinutes()
      ).padStart(2, "0")}`;

      const defense = {
        pfa: pfas[i]._id,
        date: dates[currentDateIndex],
        time: formattedTime,
        room: rooms[currentRoomIndex],
        teacher: pfas[i].teacher,
        rapporteur: await this.getRapporteur(pfas[i].teacher),
      };

      defenses.push(defense);
      currentTime = new Date(currentTime.getTime() + soutenanceDuration * 60000);
      currentRoomIndex = (currentRoomIndex + 1) % rooms.length;
    }

    await Defense.insertMany(defenses);
    return defenses;
  }

  async getRapporteur(teacherId) {
    const rapporteurs = await User.find({ role: "teacher", _id: { $ne: teacherId } });
    if (rapporteurs.length) {
      const randomRapporteur = rapporteurs[Math.floor(Math.random() * rapporteurs.length)];
      return randomRapporteur._id;
    }
    throw new Error("Aucun rapporteur trouvé.");
  }
}

module.exports = new ScheduleDefenseService();