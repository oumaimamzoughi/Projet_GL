const express = require('express');
const router = express.Router();
const{
    
    updateSubjectAdvancement,
}= require('../controllers/SubjectAdvancement')


//update advancement for teacher 
router.put('/', updateSubjectAdvancement);



module.exports = router;