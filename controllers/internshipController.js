const {
    BasicValidator,
    TitleValidationDecorator,
    DocumentValidationDecorator,
} = require("../decorators/InternshipValidators");
const Internship = require("../models/Internship.model");
const User = require("../models/User.model");
const multer = require("multer");

exports.addInternship = async (req, res) => {
    try {
        const { type } = req.params;
        const { title } = req.body;
        const documents = req.files ? req.files.map(file => file.path) : [];

        // 1. objet de validation
        const validationInput = {
            title,
            documents
        };

        // 2. Construction pas-à-pas 
        let validator = new BasicValidator(); // class de base 
        validator = new TitleValidationDecorator(validator); // validation de titre
        validator = new DocumentValidationDecorator(validator); // validation des documents

        // 3. Validation avec l'objet structuré
        const { isValid, errors } = validator.validate(validationInput);

        if (!isValid) {
            return res.status(400).json({ errors });
        }

        // creation de stage 
        const userId = "6752c59a346b414452d45ba3"; 
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const newInternship = new Internship({
            title,
            documents,
            type,
            studentId: userId,
        });

        await newInternship.save();
        user.internships.push(newInternship._id);
        await user.save();

        res.status(201).json({
            message: "Internship added successfully to your profile.",
            internship: newInternship,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


  