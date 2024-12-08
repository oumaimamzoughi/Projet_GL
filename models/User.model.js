const mongoose = require('mongoose');


const baseUserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  cin: { type: String, required:true, unique: true},
  email: { type: String, required: true, unique: true, match: [/.+@.+\..+/, 'Please enter a valid email'], },
  role: {type:String,required:true,enum: ['student', 'admin', "teacher"], // Restrict to specific roles
    default: 'student',
},
  situation:{ type: String, required: true },
  password: { type: String, required: true },
}, {
  timestamps: true, 
});


const baseUser = mongoose.model('User', baseUserSchema);

module.exports = baseUser ;
