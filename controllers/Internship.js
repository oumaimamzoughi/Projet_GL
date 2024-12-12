const Internship = require('../models/Internship.model');
const Period = require('../models/Period.model');

const User = require('../models/User.model');
const multer = require("multer");
const sendEmail  = require('../services/emailService'); 
const { multerFilter ,multerStorage} = require('../utils/storage');


const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).array('documents', 5); // Limit to 5 documents per upload


exports.addInternship = async (req, res) => {
  try {
    const { type } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const userId = req.user.id //"6752c59a346b414452d45ba3";
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const allowedTypes = ['teacher_submission', 'internship_submission', 'pfa_choice_submission', 'internship_submission_2eme', 'internship_submission_1ere'];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid internship type.' });
    }

    // Handle file uploads
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      // Collect document paths
      const documents = req.files?.map(file => file.path);

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
        message: 'Internship added successfully to your profile.', 
        internship: newInternship,
      });
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
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.status(200).json(internship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an internship by ID
exports.updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
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
      return res.status(404).json({ message: 'Internship not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.openInternshipPeriod = async (req, res) => {

  try {
    const { type } = req.params;
    const {  start_date, end_date } = req.body;

    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ message: 'start_date must be earlier than end_date' });
    }

    const existingPeriods = await Period.find({
      type,
      $or: [
        { start_date: { $lte: end_date }, start_date: { $gte: start_date } }, // Overlap condition
      ],
    });

    if (existingPeriods.length > 0) {
      return res.status(400).json({ message: 'A period for this internship type already exists in the given range' });
    }

    const newInternshipPeriod = new Period({ type, start_date, end_date });
    await newInternshipPeriod.save();

    res.status(201).json(newInternshipPeriod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

}

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
      return res.status(404).json({ message: `No open period found for internship type '${type}'.` });
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
      return res.status(400).json({ message: 'start_date must be earlier than end_date.' });
    }

    const currentDate = new Date();
    const openPeriod = await Period.findOne({
      type,
      start_date: { $lte: currentDate },
      end_date: { $gte: currentDate },
    });

    if (!openPeriod) {
      return res.status(404).json({ message: `No open period found for internship type '${type}'.` });
    }

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
      return res.status(404).json({ message: 'No period found for this type' });
    }

    const students = await User.find({ role: 'student' }).lean();

    
    const internships = await Internship.find({ type }).populate('studentId teacherId').lean();

    
    const studentDetails = students.map(student => {
      const studentInternship = internships.find(
        internship => String(internship.studentId._id) === String(student._id)
      );

      if (studentInternship) {
        // If internship exists, include its details
        const delayInDays =
          new Date(studentInternship.createdAt) > new Date(period.end_date)
            ? Math.ceil((new Date(studentInternship.createdAt) - new Date(period.end_date)) / (1000 * 60 * 60 * 24))
            : 0;

        return {
          studentName: `${student.firstName} ${student.lastName}`,
          studentEmail: student.email,
          submitted: true,
          delayInDays,
          teacherName: studentInternship.teacherId
            ? `${studentInternship.teacherId.firstName} ${studentInternship.teacherId.lastName}`
            : null,
          teacherEmail: studentInternship.teacherId ? studentInternship.teacherId.email : null,
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
      return res.status(400).json({ message: 'A list of teacher IDs is required.' });
    }

    const teachers = await User.find({ _id: { $in: teacherIds }, role: 'teacher' })
      .sort({ 'courses.length': 1 }) // Sort by number of courses
      .lean();

    if (teachers.length === 0) {
      return res.status(404).json({ message: 'No valid teachers found.' });
    }

    // Fetch internships of the given type that are not yet assigned
    const internships = await Internship.find({ type, teacherId: null }).lean();

    if (internships.length === 0) {
      return res.status(404).json({ message: 'No unassigned internships found for the given type.' });
    }

    // Assign internships in a round-robin manner
    let assignments = [];
    let teacherIndex = 0;

    internships.forEach((internship) => {
      const teacher = teachers[teacherIndex];
      assignments.push({
        internshipId: internship._id,
        teacherId: teacher._id,
      });

      // Move to the next teacher in the list
      teacherIndex = (teacherIndex + 1) % teachers.length;
    });

    // Save the assignments to the database
    for (let assignment of assignments) {
      await Internship.findByIdAndUpdate(assignment.internshipId, {
        teacherId: assignment.teacherId,
      });
    }

    res.status(200).json({ message: 'Internships assigned successfully.', assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateInternshipTeacher = async (req, res) => {
  try {
    const { id, teacherId } = req.body; 
    const { type } = req.params; 

    const internship = await Internship.findById(id);
    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

  
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher ID or teacher not found' });
    }

    internship.teacherId = teacherId;

    await internship.save();

    res.status(200).json({ message: 'Teacher successfully reassigned to internship', internship });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.publishOrHidePlanning = async (req, res) => {
  try {
    const { type } = req.params;  // Internship type (e.g., "internship_submission")
    const { response } = req.params;  // 'true' for publish, 'false' for hide

    // Validate response parameter
    if (response !== 'true' && response !== 'false') {
      return res.status(400).json({ message: 'Invalid response, use true or false' });
    }

    // Set the planning status based on the response ('true' -> 'published', 'false' -> 'hidden')
    const planningStatus = response === 'true' ? 'published' : 'hidden';

    // Update all internships with the matching type
    const result = await Internship.updateMany(
      { type }, // Match internships of the given type
      { $set: { planningStatus } } // Set the new planningStatus
    );

    // Check if any internships were updated
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No internships found for the given type' });
    }

    // Success response
    res.status(200).json({ message: 'Planning status updated for all internships of this type' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.sendPlanningEmail = async (req, res) => {
  try {
    const { type  } = req.params;  // Get type and 
    const { planningLink ,response}  = req.body;  // Planning link to be sentresponse (first or modified)

    // Find all internships of the given type
    const internships = await Internship.find({ type });

    if (internships.length === 0) {
      return res.status(404).json({ message: 'No internships found for the given type' });
    }

    // Loop through internships and send email for each
    for (const internship of internships) {
      // Check if the email has already been sent
      let emailSubject, emailText, emailHtml;

      if (internship.emailSent) {
        if (response === 'modified') {
          emailSubject = 'Modified Planning Link';
          emailText = `The planning link has been updated. You can access it here: ${planningLink}`;
          emailHtml = `<p>The planning link has been updated. You can access it <a href="${planningLink}">here</a>.</p>`;
        } else {
          emailSubject = 'Planning Link (Modified)';
          emailText = `The planning link has been sent again, with no changes. You can access it here: ${planningLink}`;
          emailHtml = `<p>The planning link has been sent again, with no changes. You can access it <a href="${planningLink}">here</a>.</p>`;
        }
      } else {
        emailSubject = 'First Planning Link';
        emailText = `Here is the link to the planning for your internship: ${planningLink}`;
        emailHtml = `<p>Here is the link to the planning for your internship: <a href="${planningLink}">click here</a>.</p>`;
      }

      // Send the email
      await sendEmail({
        to: internship.studentId.email,  // Assuming studentId holds the user's email
        subject: emailSubject,
        text: emailText,
        html: emailHtml,
      });

      // Mark the email as sent after sending
      internship.emailSent = true;
      await internship.save();
    }

    // Respond with success message
    res.status(200).json({ message: 'Email(s) sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignedInternships = async (req, res) => {
  try {
    const { type } = req.params;  // Get internship type
    const teacherId = req.user._id;  // Assuming teacher's ID is in req.user

    // Find internships assigned to this teacher of the given type
    const internships = await Internship.find({ type, teacherId })
      .populate('studentId', 'firstName lastName email') // Populate student details
      .lean();  // Use lean to get plain JavaScript objects (not Mongoose documents)

    if (internships.length === 0) {
      return res.status(404).json({ message: 'No internships assigned to you for this type' });
    }

    // Map through internships to format the response
    const response = internships.map(internship => {
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
        teacherName: `${req.user.firstName} ${req.user.lastName}`, // Teacher's name
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
