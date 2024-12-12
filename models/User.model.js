const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  cin: { type: String, required:true, unique: true},
  email: { type: String, required: true, unique: true, match: [/.+@.+\..+/, 'Please enter a valid email'], },
  role: {type:String,required:true,enum: ['student', 'admin', "teacher"], // Restrict to specific roles
    default: 'student',
},
courses: {
  type: [String], 
  required: false, 
},
  situation:{ type: String, required: true },
  password: { type: String, required: true },
  graduationDate: { type: Date },
  internships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
  ],
  class: { type: String, required: true },
  year:{
    type: String,
    required: true,
},
}, {
  timestamps: true, 
});

const User = mongoose.model('User', UserSchema);

module.exports = User ;
