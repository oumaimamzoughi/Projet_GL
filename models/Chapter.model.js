const mongoose = require('mongoose');
const Section = require('./Section.model');

// Define the Chapter schema
const chapterSchema = new mongoose.Schema({
  name: {
    type: String, // Name of the chapter
    required: false,
    trim: true,
  },
  status: {
    type: String, // Status of the chapter (e.g., "draft", "published")
    required: false,
    trim: true,
  },
  sections: [
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },
      content: {
        type: String,
        required: false,
      },
    }
  ],
});

// Create the Chapter model
const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
