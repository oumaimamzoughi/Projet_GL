const mongoose = require('mongoose');
const Section = require('./Section.model');
const { date } = require('joi');

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
  date: {
    type: Date,
    required: false,
  },
  sections: [
    {
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Section'
    }
  ],
});

// Create the Chapter model
const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
