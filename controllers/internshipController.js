const {
    BasicValidator,
    TitleValidationDecorator,
    DocumentValidationDecorator,
} = require("../decorators/InternshipValidators");
const Internship = require("../models/Internship.model");
const User = require("../models/User.model");
const multer = require("multer");

// Fonction utilitaire pour construire la chaîne de validateurs
function buildValidatorChain() {
    let validator = new BasicValidator();
    validator = new TitleValidationDecorator(validator);
    validator = new DocumentValidationDecorator(validator);
    return validator;
}

exports.addInternship = async (req, res) => {
    try {
        const { type } = req.params;
        const { title } = req.body;
        const documents = req.files ? req.files.map(file => file.path) : [];

        if (documents.length === 0) {
            return res.status(400).json({ errors: ["Documents are missing."] });
        }

        const validationInput = {
            title,
            documents
        };

        // Validation
        const validator = buildValidatorChain();
        const validationResult = validator.validate(validationInput);

        if (!validationResult.isValid) {
            return res.status(400).json({ errors: validationResult.errors });
        }

        // Logique métier ici
        const userId = "6752c59a346b414452d45ba3"; // Exemple d'utilisateur
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


  