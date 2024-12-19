
exports.getTeachers = async (req, res) => {
    try {
      // Fetch all users with the role of "teacher"
      const teachers = await User.find({ role: 'teacher' }).select('firstName lastName email situation').lean();
  
      // Check if there are no teachers in the database
      if (teachers.length === 0) {
        return res.status(404).json({ message: 'No teachers found' });
      }
  
      // Return the list of teachers
      res.status(200).json(teachers);
    } catch (error) {
      // Handle any errors that occur during the query
      res.status(500).json({ error: error.message });
    }
  };
  