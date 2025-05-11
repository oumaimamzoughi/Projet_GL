const Internship = require("../../models/Internship.model");
const User = require("../../models/User.model");
const { sendEmail } = require("../../services/emailService");

class InternshipService {
  async addInternship(type, title, userId, documents) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found.");

    const allowedTypes = [
            "internship_submission_2eme",
            "internship_submission_1ere",
          ];
    
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid internship type." });
    }
    const newInternship = new Internship({
      title,
      documents,
      type,
      studentId: userId,
    });

    await newInternship.save();
    user.internships.push(newInternship._id);
    await user.save();

    return newInternship;
  }

  async getAllInternships() {
    return await Internship.find();
  }

  async getInternshipById(id) {
    return await Internship.findById(id);
  }

  async updateInternship(id, updateData) {
    return await Internship.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteInternship(id) {
    return await Internship.findByIdAndDelete(id);
  }

  async getInternshipsByType(type) {
    const students = await User.find({ role: "student" }).lean();
    const internships = await Internship.find({ type })
      .populate("studentId teacherId")
      .lean();

    return { students, internships };
  }

  async assignTeachersToInternships(type, teacherIds) {
    const teachers = await User.find({
      _id: { $in: teacherIds },
      role: "teacher",
    }).lean();

    if (teachers.length === 0) throw new Error("No valid teachers found.");

    const internships = await Internship.find({ type, teacherId: null }).lean();
    if (internships.length === 0) {
      throw new Error("No unassigned internships found for the given type.");
    }

    const totalInternships = internships.length;
    const inverseWeights = teachers.map((teacher) => ({
      teacherId: teacher._id,
      inverseWeight: 1 / (teacher.subjects.length + 1),
    }));

    const totalWeight = inverseWeights.reduce(
      (sum, teacher) => sum + teacher.inverseWeight,
      0
    );
    const normalizedWeights = inverseWeights.map((teacher) => ({
      teacherId: teacher.teacherId,
      normalizedWeight: teacher.inverseWeight / totalWeight,
    }));

    const teacherAssignments = normalizedWeights.map((teacher) => ({
      teacherId: teacher.teacherId,
      internshipsToAssign: Math.round(
        teacher.normalizedWeight * totalInternships
      ),
    }));

    let internshipIndex = 0;
    for (const assignment of teacherAssignments) {
      for (let i = 0; i < assignment.internshipsToAssign; i++) {
        if (internshipIndex < internships.length) {
          await Internship.findByIdAndUpdate(internships[internshipIndex]._id, {
            teacherId: assignment.teacherId,
          });
          internshipIndex++;
        }
      }
    }

    return teacherAssignments;
  }

  async updateInternshipTeacher(id, teacherId) {
    const internship = await Internship.findById(id);
    if (!internship) throw new Error("Internship not found");

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Invalid teacher ID or teacher not found");
    }

    internship.teacherId = teacherId;
    await internship.save();
    return internship;
  }

  async publishOrHidePlanning(type, response) {
    const planningStatus = response === "true" ? "published" : "hidden";
    const result = await Internship.updateMany(
      { type },
      { $set: { planningStatus } }
    );
    return result;
  }

  async sendPlanningEmail(type, planningLink, response) {
    const internships = await Internship.find({ type }).populate(
      "studentId",
      "email"
    );

    if (internships.length === 0) {
      throw new Error("No internships found for the given type");
    }

    for (const internship of internships) {
      let emailSubject, emailText, emailHtml;

      if (internship.emailSent) {
        if (response === "modified") {
          emailSubject = "Modified Planning Link";
          emailText = `The planning link has been updated. You can access it here: ${planningLink}`;
          emailHtml = `<p>The planning link has been updated. You can access it <a href="${planningLink}">here</a>.</p>`;
        } else {
          emailSubject = "Planning Link (Modified)";
          emailText = `The planning link has been sent again, with no changes. You can access it here: ${planningLink}`;
          emailHtml = `<p>The planning link has been sent again, with no changes. You can access it <a href="${planningLink}">here</a>.</p>`;
        }
      } else {
        emailSubject = "First Planning Link";
        emailText = `Here is the link to the planning for your internship: ${planningLink}`;
        emailHtml = `<p>Here is the link to the planning for your internship: <a href="${planningLink}">click here</a>.</p>`;
      }

      if (internship.studentId?.email) {
        await sendEmail({
          to: internship.studentId.email,
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
        });

        internship.emailSent = true;
        await internship.save();
      }
    }
  }

  async getAssignedInternships(type, teacherId) {
    return await Internship.find({ type, teacherId }).populate(
      "studentId",
      "firstName lastName email"
    );
  }

  async getInternshipDetails(type, id) {
    return await Internship.findOne({ _id: id, type })
      .populate("studentId", "name email")
      .populate("teacherId", "name email");
  }

  async updateInternshipSchedule(type, id, date, time, googleMeetLink) {
    const internship = await Internship.findOne({ _id: id, type });
    if (!internship) throw new Error("Internship not found.");

    internship.schedule = { date, time, googleMeetLink };
    await internship.save();
    return internship;
  }

  async fetchInternshipDetailsForConnectedUser(type, studentId) {
    return await Internship.findOne({
      studentId,
      type,
    }).populate("teacherId", "firstName lastName email");
  }

  async updateInternshipValidationStatus(type, id, validated, reason, teacherId) {
    const internship = await Internship.findOne({ _id: id, type });
    if (!internship) throw new Error("Internship not found.");

    if (internship.teacherId.toString() !== teacherId) {
      throw new Error("You are not authorized to modify this internship.");
    }

    internship.validated = validated;
    if (!validated) internship.validationReason = reason;
    await internship.save();
    return internship;
  }
}

module.exports = new InternshipService();