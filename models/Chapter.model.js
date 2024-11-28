const mongoose = require('mongoose');
const Section = require('./Section.model');

// Define the Chapter schema
const chapterSchema = new mongoose.Schema({
  id_chapter: {
    type: Number, // Integer for the chapter ID
    required: true,
    unique: true,
  },
  name: {
    type: String, // Name of the chapter
    required: true,
    trim: true,
  },
  status: {
    type: String, // Status of the chapter (e.g., "draft", "published")
    required: true,
    trim: true,
  },
  sections: [Section.schema]
});

// Create the Chapter model
const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
