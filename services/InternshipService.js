const IInternshipRepository = require("../interfaces/IInternshipRepository");
const IUserRepository = require("../interfaces/IUserRepository");
const IEmailService = require("../interfaces/IEmailService");

class InternshipService {
  constructor(internshipRepository, userRepository, emailService) {
    this.internshipRepository = internshipRepository;
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  // CRUD Operations
  async createInternship(internshipData) {
    const { studentId } = internshipData;
    const student = await this.userRepository.findById(studentId);
    if (!student) throw new Error('Student not found');
    
    const internship = await this.internshipRepository.create(internshipData);
    
    await this.emailService.sendEmail({
      to: student.email,
      subject: 'New Internship Created',
      text: `Your internship "${internship.title}" has been created successfully.`
    });
    
    return internship;
  }

  async getInternshipById(id) {
    const internship = await this.internshipRepository.findById(id);
    if (!internship) throw new Error('Internship not found');
    return internship;
  }

  async getAllInternships(filter = {}) {
    return await this.internshipRepository.findAll(filter);
  }

  async updateInternship(id, updates) {
    if (updates.studentId) throw new Error('Cannot change student ID');
    
    const updated = await this.internshipRepository.update(id, updates);
    if (!updated) throw new Error('Internship not found');
    
    return updated;
  }

  async deleteInternship(id) {
    const internship = await this.internshipRepository.delete(id);
    if (!internship) throw new Error('Internship not found');
    return { message: 'Internship deleted successfully' };
  }

  // Business Logic
  async assignTeacher(internshipId, teacherId) {
    const teacher = await this.userRepository.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      throw new Error('Invalid teacher');
    }
    
    return await this.internshipRepository.assignTeacher(internshipId, teacherId);
  }

  async validateInternship(id, isValid, reason = '') {
    const updates = {
      validated: isValid,
      validatedAt: new Date(),
      ...(!isValid && { validationReason: reason })
    };
    
    return await this.internshipRepository.update(id, updates);
  }

  async getInternshipsByType(type) {
    return await this.internshipRepository.findByType(type);
  }
}

module.exports = InternshipService;