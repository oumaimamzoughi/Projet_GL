const Internship = require("../models/Internship.model");
const Period = require("../models/Period.model");

const User = require("../models/User.model");
const multer = require("multer");
const {sendEmail} = require("../services/emailService");


exports.addInternship = async (req, res) => {
  try {
    const { type } = req.params;
    const { title } = req.body;

    console.log("Request body:", req.body); // Check if title is passed

    console.log(req.body);
    
    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    //const userId = "6752c59a346b414452d45ba3"; // Example userId (replace as needed)
    //const userId = "6752c59a346b414452d45ba3";//req.user.id 
 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const allowedTypes = [
      "teacher_submission",
      "internship_submission",
      "pfa_choice_submission",
      "internship_submission_2eme",
      "internship_submission_1ere",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid internship type." });
    }

    // Collect document paths (multer will have processed the files)
    const documents = req.files?.map((file) => file.path);
console.log("files :", req);

    // Create a new internship
    const newInternship = new Internship({
      title,
      documents, // Save file paths
      type,
      studentId: userId,
    });

    await newInternship.save();

    // Link internship to user
    user.internships.push(newInternship._id);
    await user.save();

    return res.status(201).json({
      message: "Internship added successfully to your profile.",
      internship: newInternship,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get all internships
exports.getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find();
    res.status(200).json(internships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific internship by ID
exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.status(200).json(internship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an internship by ID
exports.updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.status(200).json(internship);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an internship by ID
exports.deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.openInternshipPeriod = async (req, res) => {
  try {
    const { type } = req.params;
    const { start_date, end_date } = req.body;

    if (new Date(start_date) >= new Date(end_date)) {
      return res
        .status(400)
        .json({ message: "start_date must be earlier than end_date" });
    }

    const existingPeriods = await Period.find({
      type,
      $or: [
        { start_date: { $lte: end_date }, start_date: { $gte: start_date } }, // Overlap condition
      ],
    });

    if (existingPeriods.length > 0) {
      return res
        .status(400)
        .json({
          message:
            "A period for this internship type already exists in the given range",
        });
    }

    const newInternshipPeriod = new Period({ type, start_date, end_date });
    await newInternshipPeriod.save();

    res.status(201).json(newInternshipPeriod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOpenInternshipPeriod = async (req, res) => {
  try {
    const { type } = req.params;

    const currentDate = new Date();
    const openPeriod = await Period.findOne({
      type,
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    });

    if (!openPeriod) {
      return res
        .status(404)
        .json({
          message: `No open period found for internship type '${type}'.`,
        });
    }

    res.status(200).json(openPeriod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInternshipPeriod = async (req, res) => {
  try {
    const { type } = req.params;
    const { start_date, end_date } = req.body;

    if (new Date(start_date) >= new Date(end_date)) {
      return res
        .status(400)
        .json({ message: "start_date must be earlier than end_date." });
    }

    const currentDate = new Date();
    const openPeriod = await Period.findOne({
      type,
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    });

    if (!openPeriod) {
      return res
        .status(404)
        .json({
          message: `No open period found for internship type '${type}'.`,
        });
    }

    console.log(req.body, "*************");
    openPeriod.start_date = start_date;
    openPeriod.end_date = end_date;
    await openPeriod.save();

    res.status(200).json(openPeriod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInternshipsByType = async (req, res) => {
  try {
    const { type } = req.params;

    const period = await Period.findOne({ type });
    if (!period) {
      return res.status(404).json({ message: "No period found for this type" });
    }

    const students = await User.find({ role: "student" }).lean();

    const internships = await Internship.find({ type })
      .populate("studentId teacherId")
      .lean();

    const studentDetails = students.map((student) => {
      const studentInternship = internships.find(
        (internship) => String(internship.studentId._id) === String(student._id)
      );

      if (studentInternship) {
        // If internship exists, include its details
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
          pvDetails: null, // Placeholder for PV details
        };
      } else {
        // If no internship exists, mark as not submitted
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

    // Include period details
    const response = {
      period: {
        type: period.type,
        start_date: period.start_date,
        end_date: period.end_date,
        planningPublished: period.planningPublished || false, // Assuming this field exists
      },
      students: studentDetails,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignTeachersToInternships = async (req, res) => {
  try {
    const { type } = req.params;
    const { teacherIds } = req.body;

    // Validate input
    if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
      return res
        .status(400)
        .json({ message: "A list of teacher IDs is required." });
    }

    // Fetch teachers and calculate their current workload
    const teachers = await User.find({
      _id: { $in: teacherIds },
      role: "teacher",
    }).lean();

    if (teachers.length === 0) {
      return res.status(404).json({ message: "No valid teachers found." });
    }

    // Fetch unassigned internships
    const internships = await Internship.find({ type, teacherId: null }).lean();

    if (internships.length === 0) {
      return res
        .status(404)
        .json({
          message: "No unassigned internships found for the given type.",
        });
    }

    const totalInternships = internships.length;

    // Step 1: Calculate inverse weights
    const inverseWeights = teachers.map((teacher) => ({
      teacherId: teacher._id,
      inverseWeight: 1 / (teacher.subjects.length + 1), // Adding 1 to avoid division by zero
    }));

    // Step 2: Normalize weights
    const totalWeight = inverseWeights.reduce(
      (sum, teacher) => sum + teacher.inverseWeight,
      0
    );
    const normalizedWeights = inverseWeights.map((teacher) => ({
      teacherId: teacher.teacherId,
      normalizedWeight: teacher.inverseWeight / totalWeight,
    }));

    // Step 3: Calculate the number of internships for each teacher
    const teacherAssignments = normalizedWeights.map((teacher) => ({
      teacherId: teacher.teacherId,
      internshipsToAssign: Math.round(
        teacher.normalizedWeight * totalInternships
      ),
    }));

    // Step 4: Distribute internships
    let internshipIndex = 0;
    for (const assignment of teacherAssignments) {
      for (let i = 0; i < assignment.internshipsToAssign; i++) {
        if (internshipIndex < internships.length) {
          const internship = internships[internshipIndex];
          await Internship.findByIdAndUpdate(internship._id, {
            teacherId: assignment.teacherId,
          });
          internshipIndex++;
        }
      }
    }

    res
      .status(200)
      .json({
        message: "Internships assigned successfully.",
        teacherAssignments,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInternshipTeacher = async (req, res) => {
  try {
    const { id, teacherId } = req.body;

    const internship = await Internship.findById(id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res
        .status(400)
        .json({ message: "Invalid teacher ID or teacher not found" });
    }

    internship.teacherId = teacherId;

    await internship.save();

    res
      .status(200)
      .json({
        message: "Teacher successfully reassigned to internship",
        internship,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.publishOrHidePlanning = async (req, res) => {
  try {
    const { type } = req.params; // Internship type (e.g., "internship_submission")
    const { response } = req.params; // 'true' for publish, 'false' for hide

    // Validate response parameter
    if (response !== "true" && response !== "false") {
      return res
        .status(400)
        .json({ message: "Invalid response, use true or false" });
    }

    // Set the planning status based on the response ('true' -> 'published', 'false' -> 'hidden')
    const planningStatus = response === "true" ? "published" : "hidden";

    // Update all internships with the matching type
    const result = await Internship.updateMany(
      { type }, // Match internships of the given type
      { $set: { planningStatus } } // Set the new planningStatus
    );

    // Check if any internships were updated
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No internships found for the given type" });
    }

    // Success response
    res
      .status(200)
      .json({
        message: "Planning status updated for all internships of this type",
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendPlanningEmail = async (req, res) => {
  try {
    const { type } = req.params; // Get internship type from params
    const { planningLink, response } = req.body; // Planning link and response type from body

    // Find all internships of the given type and populate the studentId
    const internships = await Internship.find({ type }).populate('studentId', 'email');

    if (internships.length === 0) {
      return res
        .status(404)
        .json({ message: "No internships found for the given type" });
    }

    // Loop through internships and send email for each
    for (const internship of internships) {
      // Check if the email has already been sent
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

      // Send the email if the student's email exists
      if (internship.studentId?.email) {
        await sendEmail({
          to: internship.studentId.email, // Access populated email
          subject: emailSubject,
          text: emailText,
          html: emailHtml,
        });

        // Mark the email as sent after sending
        internship.emailSent = true;
        await internship.save();
      } else {
        console.warn(`Email not sent: No email found for internship ID ${internship._id}`);
      }
    }

    // Respond with success message
    res.status(200).json({ message: "Email(s) sent successfully" });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.getAssignedInternships = async (req, res) => {
  try {
    const { type } = req.params; // Get internship type
    // const teacherId = req.user._id; 

    const teacherId = "67642a5997652c599cf5d0ad"
    // Find internships assigned to this teacher of the given type
    const internships = await Internship.find({ type, teacherId })
      .populate("studentId", "firstName lastName email") // Populate student details
      .lean(); // Use lean to get plain JavaScript objects (not Mongoose documents)

    if (internships.length === 0) {
      return res
        .status(404)
        .json({ message: "No internships assigned to you for this type" });
    }

    // Map through internships to format the response
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
        submitted: internship.submissionDate ? true : false, // Assuming `submissionDate` tracks submission
        // teacherName: `${req.user.firstName} ${req.user.lastName}`, // Teacher's name
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// sprint 2
exports.getInternshipDetails = async (req, res) => {
  try {
    const { type, id } = req.params;

    // Validate input
    if (!type || !id) {
      return res.status(400).json({ message: "Type and ID are required." });
    }

    // Fetch the internship details
    const internship = await Internship.findOne({ _id: id, type })
      .populate("studentId", "name email") // Populate student details
      .populate("teacherId", "name email") // Populate teacher details
      .lean();

    if (!internship) {
      return res.status(404).json({ message: "Internship not found." });
    }

    // Construct response object
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

    res
      .status(200)
      .json({
        message: "Internship details retrieved successfully.",
        data: response,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInternshipSchedule = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { date, time, googleMeetLink } = req.body;

    // Validate input
    if (!date || !time || !googleMeetLink) {
      return res
        .status(400)
        .json({ message: "Date, time, and Google Meet link are required." });
    }

    // Find the internship by ID and type
    const internship = await Internship.findOne({ _id: id, type });
    if (!internship) {
      return res.status(404).json({ message: "Internship not found." });
    }

    // Update the schedule details
    internship.schedule = {
      date,
      time,
      googleMeetLink,
    };

    await internship.save();

    const emailSubject = 'Upcoming Meeting Reminder';
    const emailMessage = `
      <p>Dear ,</p>
      <p>This is a reminder that you have an upcoming meeting scheduled on ${internship.schedule.date.toLocaleDateString()} at ${internship.schedule.time}.</p>
      <p>Meeting Link: ${internship.schedule.googleMeetLink || 'No Google Meet link provided.'}</p>
      <p>Best regards,<br>Your University Administration</p>
    `;

    // Send the email
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
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

exports.fetchInternshipDetailsForConnectedUser = async (req, res) => {
  try {
    const { type } = req.params; // Get the internship type from the route parameter
    //const studentId = req.user._id; // Get the logged-in student's ID
     const studentId = "6752c59a346b414452d45ba3"
    // Find the internship for the student based on the type
    const internship = await Internship.findOne({
      studentId,
      type,
    }).populate("teacherId", "firstName lastName email"); // Populate teacher's details

    // If no internship is found or the student is not linked to the internship
    if (!internship) {
      return res
        .status(404)
        .json({ error: "No internship found for the student." });
    }

    // Send the internship details along with teacher info, Google Meet link, and schedule
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

    return res.json(internshipDetails);
  } catch (error) {
    console.error("Error fetching internship details:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateInternshipValidationStatus = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { validated, reason } = req.body;

    //const teacherId =req.user._id;

    const teacherId = "67642a5997652c599cf5d0ad"

    // Validate input
    if (typeof validated !== "boolean") {
      return res
        .status(400)
        .json({ error: "Validation status must be a boolean." });
    }
    if (!validated && !reason) {
      return res
        .status(400)
        .json({
          error: "Reason is required if the internship is not validated.",
        });
    }

    // Fetch the internship by ID and type
    const internship = await Internship.findOne({ _id: id, type });
    if (!internship) {
      return res.status(404).json({ error: "Internship not found." });
    }

    // Check if the teacher is assigned to this internship
    if (internship.teacherId.toString() !== teacherId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to modify this internship." });
    }

    // Update the internship validation status and reason if applicable
    internship.validated = validated;
    if (!validated) {
      internship.validationReason = reason;
    }

    await internship.save();

    return res.status(200).json({
      message: validated
        ? "Internship validated successfully."
        : "Internship not validated. Reason: " + reason,
      internship,
    });
  } catch (error) {
    console.error("Error updating internship validation:", error);
    return res
      .status(500)
      .json({
        error: "An error occurred while updating the internship validation.",
      });
  }
};
