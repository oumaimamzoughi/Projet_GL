const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubjectHistorySchema = new Schema(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject', // Reference to the original Subject model
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    nb_hour: {
      type: Number,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    archived: {
      type: Boolean,
      required: true,
    },
    archivedAt: {
      type: Date,
    },
    competences: [
      {
        id_Competence: { type: Number },
        title: { type: String },
        force: { type: Boolean },
      },
    ],
    chapters: [
      {
        name: { type: String },
        status: { type: String },
        sections: [
          {
            id_Section: { type: String },
            name: { type: String },
          },
        ],
      },
    ],
    evaluation: {
      id_evaluation: { type: String },
      message: { type: String },
    },
    advancement: {
      type: String,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);
SubjectHistorySchema.pre('save', async function (next) {
  if (this.isModified()) {
    this.version = this.version + 1 || 1; // Increment version before saving
  }
  next();
});
// Create and export the SubjectHistory model
const SubjectHistory = mongoose.model('SubjectHistory', SubjectHistorySchema);
module.exports = SubjectHistory;
