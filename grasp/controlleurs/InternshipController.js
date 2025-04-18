const internshipService = require("../../services/internshipService");
const periodService = require("../../services/PeriodService");

class InternshipController {
  async addInternship(req, res) {
    try {
      const { type } = req.params;
      const { title } = req.body;
      const documents = req.files?.map((file) => file.path);
      const userId = "6752c59a346b414452d45ba3"; // Replace with actual user ID from auth

      const allowedTypes = [
        "internship_submission_2eme",
        "internship_submission_1ere",
      ];

      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid internship type." });
      }

      const newInternship = await internshipService.addInternship(
        type,
        title,
        userId,
        documents
      );

      res.status(201).json({
        message: "Internship added successfully to your profile.",
        internship: newInternship,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllInternships(req, res) {
    try {
      const internships = await internshipService.getAllInternships();
      res.status(200).json(internships);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getInternshipById(req, res) {
    try {
      const internship = await internshipService.getInternshipById(req.params.id);
      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }
      res.status(200).json(internship);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateInternship(req, res) {
    try {
      const internship = await internshipService.updateInternship(
        req.params.id,
        req.body
      );
      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }
      res.status(200).json(internship);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteInternship(req, res) {
    try {
      const internship = await internshipService.deleteInternship(req.params.id);
      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getInternshipsByType(req, res) {
    try {
      const { type } = req.params;
      const period = await periodService.getPeriodByType(type);
      if (!period) {
        return res.status(404).json({ message: "No period found for this type" });
      }

      const { students, internships } = await internshipService.getInternshipsByType(type);

      const studentDetails = students.map((student) => {
        const studentInternship = internships.find(
          (internship) => String(internship.studentId._id) === String(student._id)
        );

        if (studentInternship) {
          const delayInDays =
            new Date(studentInternship.createdAt) > new Date(period.end_date)
              ? Math.ceil(
                  (new Date(studentInternship.createdAt) -
                    new Date(period.end_date)) /
                    (1000 * 60 * 60 * 24)
                )
              : 0;

          return {
            studentName: `${student.firstName} ${student.lastName}`,
            studentEmail: student.email,
            submitted: true,
            delayInDays,
            teacherName: studentInternship.teacherId
              ? `${studentInternship.teacherId.firstName} ${studentInternship.teacherId.lastName}`
              : null,
            teacherEmail: studentInternship.teacherId
              ? studentInternship.teacherId.email
              : null,
            documents: studentInternship.documents,
            googleMeetLink: studentInternship.googleMeetLink || null,
            pvDetails: null,
          };
        } else {
          return {
            studentName: `${student.firstName} ${student.lastName}`,
            studentEmail: student.email,
            submitted: false,
            delayInDays: null,
            teacherName: null,
            teacherEmail: null,
            documents: [],
            googleMeetLink: null,
            pvDetails: null,
          };
        }
      });

      const response = {
        period: {
          type: period.type,
          start_date: period.start_date,
          end_date: period.end_date,
          planningPublished: period.planningPublished || false,
        },
        students: studentDetails,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async assignTeachersToInternships(req, res) {
    try {
      const { type } = req.params;
      const { teacherIds } = req.body;

      if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
        return res
          .status(400)
          .json({ message: "A list of teacher IDs is required." });
      }

      const teacherAssignments = await internshipService.assignTeachersToInternships(
        type,
        teacherIds
      );

      res.status(200).json({
        message: "Internships assigned successfully.",
        teacherAssignments,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateInternshipTeacher(req, res) {
    try {
      const { id, teacherId } = req.body;
      const internship = await internshipService.updateInternshipTeacher(
        id,
        teacherId
      );

      res.status(200).json({
        message: "Teacher successfully reassigned to internship",
        internship,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async publishOrHidePlanning(req, res) {
    try {
      const { type } = req.params;
      const { response } = req.params;

      if (response !== "true" && response !== "false") {
        return res
          .status(400)
          .json({ message: "Invalid response, use true or false" });
      }

      const result = await internshipService.publishOrHidePlanning(
        type,
        response
      );

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .json({ message: "No internships found for the given type" });
      }

      res.status(200).json({
        message: "Planning status updated for all internships of this type",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async sendPlanningEmail(req, res) {
    try {
      const { type } = req.params;
      const { planningLink, response } = req.body;

      await internshipService.sendPlanningEmail(type, planningLink, response);

      res.status(200).json({ message: "Email(s) sent successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAssignedInternships(req, res) {
    try {
      const { type } = req.params;
      const teacherId = "67642a5997652c599cf5d0ad"; // Replace with actual teacher ID from auth

      const internships = await internshipService.getAssignedInternships(
        type,
        teacherId
      );

      if (internships.length === 0) {
        return res
          .status(404)
          .json({ message: "No internships assigned to you for this type" });
      }

      const response = internships.map((internship) => {
        const student = internship.studentId;
        return {
          internshipId: internship.id,
          title: internship.title,
          status: internship.status,
          studentName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.email,
          documents: internship.documents || [],
          googleMeetLink: internship.googleMeetLink || null,
          planningStatus: internship.planningStatus,
          submitted: internship.submissionDate ? true : false,
        };
      });

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getInternshipDetails(req, res) {
    try {
      const { type, id } = req.params;

      const internship = await internshipService.getInternshipDetails(type, id);
      if (!internship) {
        return res.status(404).json({ message: "Internship not found." });
      }

      const response = {
        internshipDetails: {
          id: internship._id,
          title: internship.title,
          description: internship.description,
          type: internship.type,
          createdAt: internship.createdAt,
        },
        studentDetails: internship.studentId || null,
        teacherDetails: internship.teacherId || null,
        submissionDetails: {
          submitted: internship.isSubmitted,
          delay: internship.submissionDelay || "No delay",
        },
        defenseDetails: {
          planningPublished: internship.isPlanningPublished || false,
          googleMeetLink: internship.googleMeetLink || "N/A",
        },
        documents: internship.documents || [],
      };

      res.status(200).json({
        message: "Internship details retrieved successfully.",
        data: response,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateInternshipSchedule(req, res) {
    try {
      const { type, id } = req.params;
      const { date, time, googleMeetLink } = req.body;

      const internship = await internshipService.updateInternshipSchedule(
        type,
        id,
        date,
        time,
        googleMeetLink
      );

      const emailSubject = "Upcoming Meeting Reminder";
      const emailMessage = `
        <p>Dear ,</p>
        <p>This is a reminder that you have an upcoming meeting scheduled on ${internship.schedule.date.toLocaleDateString()} at ${internship.schedule.time}.</p>
        <p>Meeting Link: ${internship.schedule.googleMeetLink || "No Google Meet link provided."}</p>
        <p>Best regards,<br>Your University Administration</p>
      `;

      await sendEmail({
        to: "mohamedaminetouihri9@gmail.com",
        subject: emailSubject,
        html: emailMessage,
      });

      res.status(200).json({
        message: "Meeting schedule updated successfully.",
        details: {
          id: internship._id,
          date: internship.schedule.date,
          time: internship.schedule.time,
          googleMeetLink: internship.schedule.googleMeetLink,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error.", error: error.message });
    }
  }

  async fetchInternshipDetailsForConnectedUser(req, res) {
    try {
      const { type } = req.params;
      const studentId = "6752c59a346b414452d45ba3"; // Replace with actual student ID from auth

      const internship = await internshipService.fetchInternshipDetailsForConnectedUser(
        type,
        studentId
      );

      if (!internship) {
        return res
          .status(404)
          .json({ error: "No internship found for the student." });
      }

      const internshipDetails = {
        title: internship.title,
        type: internship.type,
        status: internship.status,
        teacher: internship.teacherId
          ? {
              firstName: internship.teacherId.firstName,
              lastName: internship.teacherId.lastName,
              email: internship.teacherId.email,
            }
          : null,
        schedule: internship.schedule
          ? {
              date: internship.schedule.date,
              time: internship.schedule.time,
              googleMeetLink: internship.schedule.googleMeetLink,
            }
          : null,
      };

      res.json(internshipDetails);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateInternshipValidationStatus(req, res) {
    try {
      const { type, id } = req.params;
      const { validated, reason } = req.body;
      const teacherId = "67642a5997652c599cf5d0ad"; // Replace with actual teacher ID from auth

      const internship = await internshipService.updateInternshipValidationStatus(
        type,
        id,
        validated,
        reason,
        teacherId
      );

      res.status(200).json({
        message: validated
          ? "Internship validated successfully."
          : "Internship not validated. Reason: " + reason,
        internship,
      });
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while updating the internship validation.",
      });
    }
  }
}

module.exports = new InternshipController();